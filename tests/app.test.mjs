import assert from 'node:assert/strict';
import { createServer as createProbe } from 'node:net';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scryptSync } from 'node:crypto';
import test, { after, before } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDirectory = await mkdtemp(path.join(tmpdir(), 'astrojack-test-'));
const portProbe = createProbe();
await new Promise(resolve => portProbe.listen(0, '127.0.0.1', resolve));
const port = portProbe.address().port;
await new Promise(resolve => portProbe.close(resolve));
const baseUrl = `http://127.0.0.1:${port}`;
const password = 'Test-Admin-Password-123!';
const salt = '0123456789abcdef0123456789abcdef';
const passwordHash = `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
let serverProcess;
let cookie;
let serverOutput = '';

after(async () => {
  if (serverProcess && serverProcess.exitCode === null) {
    await new Promise(resolve => {
      serverProcess.once('exit', resolve);
      serverProcess.kill();
    });
  }
  await rm(dataDirectory, { recursive: true, force: true });
});

before(async () => {
  serverProcess = spawn(process.execPath, ['server.mjs'], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      PUBLIC_URL: baseUrl,
      DATA_DIR: dataDirectory,
      ADMIN_USERNAME: 'test-admin',
      ADMIN_PASSWORD_HASH: passwordHash,
      PAYPAL_CLIENT_ID: '',
      PAYPAL_CLIENT_SECRET: '',
      PAYMONGO_SECRET_KEY: '',
      PAYMONGO_WEBHOOK_SECRET: ''
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  serverProcess.stdout.setEncoding('utf8').on('data', chunk => { serverOutput += chunk; });
  serverProcess.stderr.setEncoding('utf8').on('data', chunk => { serverOutput += chunk; });
  serverProcess.on('error', error => { throw error; });
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Test server did not start. ${serverOutput}`);
});

async function request(pathname, options = {}) {
  return fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  });
}

test('serves live catalogue and protects operations routes', async () => {
  const page = await request('/');
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal((await request('/server.mjs')).status, 404);
  const products = await (await request('/api/products')).json();
  assert.equal(products.length, 8);
  assert.equal(products[0].colors[0], 'Black');
  assert.equal((await request('/api/admin/dashboard')).status, 401);
});

test('authenticates admin and persists inventory and order operations', async () => {
  const origin = { Origin: baseUrl };
  const unauthenticated = await request('/api/admin/products/orbit-hoodie', {
    method: 'PATCH',
    headers: origin,
    body: JSON.stringify({ stock: 4, threshold: 2 })
  });
  assert.equal(unauthenticated.status, 401);

  const login = await request('/api/admin/login', {
    method: 'POST',
    headers: origin,
    body: JSON.stringify({ username: 'test-admin', password })
  });
  assert.equal(login.status, 200);
  cookie = login.headers.get('set-cookie').split(';')[0];

  const stockUpdate = await request('/api/admin/products/orbit-hoodie', {
    method: 'PATCH',
    headers: { ...origin, Cookie: cookie },
    body: JSON.stringify({ stock: 4, threshold: 2 })
  });
  assert.equal(stockUpdate.status, 200);
  assert.equal((await stockUpdate.json()).product.stock, 4);

  const checkout = await request('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({
      customer: { name: 'Test Buyer', email: 'buyer@example.com', phone: '09170000000', address: '1 Test Road' },
      items: [{ productId: 'orbit-hoodie', size: 'M', color: 'Forest Green', quantity: 1 }],
      method: 'cod'
    })
  });
  assert.equal(checkout.status, 200);
  const order = (await checkout.json()).order;
  assert.equal(order.total, 2490);
  assert.equal(order.items[0].color, 'Forest Green');

  const tracked = await request(`/api/orders/${order.id}?email=buyer%40example.com`);
  assert.equal(tracked.status, 200);
  assert.equal((await tracked.json()).order.items[0].color, 'Forest Green');
  assert.equal((await request(`/api/orders/${order.id}?email=wrong%40example.com`)).status, 404);

  const fulfillment = await request(`/api/admin/orders/${order.id}`, {
    method: 'PATCH',
    headers: { ...origin, Cookie: cookie },
    body: JSON.stringify({ status: 'processing' })
  });
  assert.equal(fulfillment.status, 200);
  const dashboard = await (await request('/api/admin/dashboard', { headers: { Cookie: cookie } })).json();
  assert.equal(dashboard.stats.orders, 1);
  assert.equal(dashboard.products.find(product => product.id === 'orbit-hoodie').stock, 3);

  const logout = await request('/api/admin/logout', { method: 'POST', headers: { ...origin, Cookie: cookie } });
  assert.equal(logout.status, 200);
  assert.equal((await request('/api/admin/dashboard', { headers: { Cookie: cookie } })).status, 401);
});

test('rejects invalid variants and unconfigured online payment', async () => {
  const checkoutBody = {
    customer: { name: 'Test Buyer', email: 'buyer@example.com', phone: '09170000000', address: '1 Test Road' },
    items: [{ productId: 'orbit-hoodie', size: 'M', color: 'Invisible', quantity: 1 }],
    method: 'cod'
  };
  const invalidVariant = await request('/api/checkout', { method: 'POST', body: JSON.stringify(checkoutBody) });
  assert.equal(invalidVariant.status, 400);

  checkoutBody.items[0].color = 'Black';
  checkoutBody.method = 'gcash';
  const unavailablePayment = await request('/api/checkout', { method: 'POST', body: JSON.stringify(checkoutBody) });
  assert.equal(unavailablePayment.status, 503);
});
