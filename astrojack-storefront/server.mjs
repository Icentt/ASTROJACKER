import { createHash, createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stdin, stdout } from 'node:process';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.resolve(process.env.DATA_DIR || path.join(root, 'data'));
const databasePath = path.join(dataDirectory, 'astrojack.sqlite');
const port = Number(process.env.PORT || 4173);
const publicUrl = (process.env.PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, '');
const paypalBase = process.env.PAYPAL_ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';
const bodyLimit = 1024 * 1024;
const defaultLowStockThreshold = 3;
const sessionCookie = 'astrojack_admin';
const sessionDuration = 8 * 60 * 60 * 1000;
await mkdir(dataDirectory, { recursive: true });
const database = new DatabaseSync(databasePath);
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    stock INTEGER NOT NULL CHECK (stock >= 0),
    threshold INTEGER NOT NULL CHECK (threshold >= 0)
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    status TEXT NOT NULL,
    total INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    provider_order_id TEXT,
    checkout_session_id TEXT,
    order_json TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS orders_email_id ON orders(email, id);
  CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL
  );
`);

const catalog = [
  { id: 'orbit-hoodie', name: 'Orbit Heavyweight Hoodie', category: 'Men', type: 'Sweatshirts', price: 2490, stock: 8, colors: ['Black', 'Heather Gray', 'Forest Green'], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'signal-tee', name: 'Signal Graphic Tee', category: 'Men', type: 'T-Shirts', price: 990, stock: 14, colors: ['Black', 'White', 'Red'], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'night-runner', name: 'Night Runner Shell', category: 'Women', type: 'Outerwear', price: 3290, stock: 5, colors: ['Black', 'Olive', 'Stone'], sizes: ['XS', 'S', 'M', 'L'] },
  { id: 'city-cap', name: 'City Circuit Cap', category: 'Kids', type: 'Accessories', price: 790, stock: 12, colors: ['Black', 'Navy', 'Khaki'], sizes: ['One size'] },
  { id: 'static-crew', name: 'Static Crewneck', category: 'Women', type: 'Sweatshirts', price: 2190, stock: 2, colors: ['Charcoal', 'Oatmeal', 'Burgundy'], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'sidewalk-low', name: 'Sidewalk Low Top', category: 'Kids', type: 'Shoes', price: 2890, stock: 6, colors: ['Black', 'White', 'Red'], sizes: ['36', '37', '38', '39', '40'] },
  { id: 'afterhours-tee', name: 'Afterhours Long Sleeve', category: 'Men', type: 'T-Shirts', price: 1390, stock: 9, colors: ['Black', 'White', 'Charcoal'], sizes: ['S', 'M', 'L', 'XL'] },
  { id: 'orbit-tote', name: 'Orbit Utility Tote', category: 'Women', type: 'Accessories', price: 590, stock: 0, colors: ['Natural', 'Black'], sizes: ['One size'] }
];

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};
const loginAttempts = new Map();

function readStore() {
  const products = database.prepare('SELECT id, stock, threshold FROM products').all();
  const inventory = Object.fromEntries(products.map(row => [row.id, row.stock]));
  const thresholds = Object.fromEntries(products.map(row => [row.id, row.threshold]));
  const orders = database.prepare('SELECT order_json FROM orders ORDER BY created_at').all().map(row => JSON.parse(row.order_json));
  return { inventory, thresholds, orders };
}

function persistStore(store) {
  const saveProducts = database.prepare(`
    INSERT INTO products (id, stock, threshold) VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET stock = excluded.stock, threshold = excluded.threshold
  `);
  const saveOrder = database.prepare(`
    INSERT INTO orders (id, email, status, total, created_at, provider_order_id, checkout_session_id, order_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET status = excluded.status, provider_order_id = excluded.provider_order_id,
      checkout_session_id = excluded.checkout_session_id, order_json = excluded.order_json
  `);
  for (const product of catalog) {
    saveProducts.run(product.id, store.inventory[product.id] ?? product.stock, store.thresholds[product.id] ?? product.threshold ?? defaultLowStockThreshold);
  }
  for (const order of store.orders) {
    saveOrder.run(order.id, order.customer.email, order.status, order.total, order.createdAt, order.providerOrderId, order.checkoutSessionId, JSON.stringify(order));
  }
}

function updateStore(update) {
  database.exec('BEGIN IMMEDIATE');
  try {
    const store = readStore();
    const result = update(store);
    if (result && typeof result.then === 'function') throw new Error('Database updates must be synchronous.');
    persistStore(store);
    database.exec('COMMIT');
    return result;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

function getStore() {
  return readStore();
}

function initializeDatabase() {
  database.exec('BEGIN IMMEDIATE');
  try {
    const saveProduct = database.prepare('INSERT OR IGNORE INTO products (id, stock, threshold) VALUES (?, ?, ?)');
    for (const product of catalog) saveProduct.run(product.id, product.stock, product.threshold ?? defaultLowStockThreshold);
    database.exec('DELETE FROM admin_sessions WHERE expires_at <= unixepoch() * 1000; COMMIT;');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

function hashAdminPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}

function verifyAdminPassword(password, encoded) {
  const [algorithm, salt, hash] = String(encoded || '').split('$');
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(hash)) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
}

async function readHidden(prompt) {
  if (!stdin.isTTY || !stdin.setRawMode) throw new Error('Run this command in an interactive terminal.');
  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error, result) => {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdout.write('\n');
      if (error) reject(error);
      else resolve(result);
    };
    const onData = chunk => {
      for (const character of chunk.toString()) {
        if (character === '\u0003') return finish(new Error('Cancelled.'));
        if (character === '\r' || character === '\n') return finish(null, value);
        if (character === '\u007f' || character === '\b') value = value.slice(0, -1);
        else if (character >= ' ') value += character;
      }
    };
    stdin.on('data', onData);
  });
}

function readCookies(request) {
  return Object.fromEntries((request.headers.cookie || '').split(';').map(cookie => {
    const separator = cookie.indexOf('=');
    return separator < 0 ? ['', ''] : [cookie.slice(0, separator).trim(), decodeURIComponent(cookie.slice(separator + 1).trim())];
  }).filter(([key]) => key));
}

function sessionForRequest(request) {
  const token = readCookies(request)[sessionCookie];
  if (!token) return null;
  return database.prepare('SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ?')
    .get(createHash('sha256').update(token).digest('hex'), Date.now()) || null;
}

function requireAdmin(request) {
  if (!sessionForRequest(request)) throw paymentError(401, 'Sign in to access the operations workspace.');
}

function requireSameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin || origin !== new URL(publicUrl).origin) throw paymentError(403, 'Request origin could not be verified.');
}

function adminOrders() {
  return getStore().orders.slice().reverse().map(order => ({
    id: order.id,
    name: order.customer.name,
    email: order.customer.email,
    phone: order.customer.phone,
    address: order.customer.address,
    items: order.items,
    total: order.total,
    payment: order.method,
    paymentStatus: order.paymentStatus,
    status: order.status,
    createdAt: order.createdAt
  }));
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(value));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', chunk => {
      size += chunk.length;
      if (size > bodyLimit) {
        reject(Object.assign(new Error('Request is too large.'), { status: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function safeText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizeCheckout(body) {
  const customer = {
    name: safeText(body.customer?.name, 120),
    email: safeText(body.customer?.email, 254).toLowerCase(),
    phone: safeText(body.customer?.phone, 40),
    address: safeText(body.customer?.address, 500)
  };
  if (!customer.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || !customer.phone || !customer.address) {
    throw Object.assign(new Error('Enter a valid name, email, phone number, and shipping address.'), { status: 400 });
  }
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 30) {
    throw Object.assign(new Error('Your bag is empty or contains too many items.'), { status: 400 });
  }

  const items = body.items.map(item => {
    const product = catalog.find(entry => entry.id === item.productId);
    const quantity = Number(item.quantity);
    const size = safeText(item.size, 20);
    const color = safeText(item.color, 30);
    if (!product || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20 || !product.sizes.includes(size) || !product.colors.includes(color)) {
      throw Object.assign(new Error('An item in your bag is invalid. Please review your bag.'), { status: 400 });
    }
    return { productId: product.id, name: product.name, price: product.price, size, color, quantity };
  });
  const quantities = new Map();
  for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  for (const [productId, quantity] of quantities) {
    const product = catalog.find(entry => entry.id === productId);
    if (quantity > product.stock) {
      throw Object.assign(new Error(`${product.name} does not have enough stock.`), { status: 409 });
    }
  }
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { customer, items, total, quantities };
}

function paymentConfiguration() {
  return {
    paypal: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
    gcash: Boolean(process.env.PAYMONGO_SECRET_KEY && process.env.PAYMONGO_WEBHOOK_SECRET),
    bank: Boolean(process.env.PAYMONGO_SECRET_KEY && process.env.PAYMONGO_WEBHOOK_SECRET)
  };
}

function paymentError(status, message) {
  return Object.assign(new Error(message), { status });
}

async function providerRequest(url, options, provider) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(`${provider} API request failed (${response.status}):`, JSON.stringify(result).slice(0, 1000));
    throw paymentError(502, `The ${provider} payment service could not start checkout. Please try again.`);
  }
  return result;
}

async function paypalAccessToken() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw paymentError(503, 'PayPal is not configured on the server yet.');
  }
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const result = await providerRequest(`${paypalBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  }, 'PayPal');
  return result.access_token;
}

async function paymongoRequest(url, options = {}) {
  if (!process.env.PAYMONGO_SECRET_KEY) throw paymentError(503, 'PayMongo is not configured on the server yet.');
  const authorization = Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64');
  return providerRequest(url, {
    ...options,
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  }, 'PayMongo');
}

async function reserveOrder(body) {
  const { customer, items, total, quantities } = normalizeCheckout(body);
  const method = body.method;
  if (!['paypal', 'gcash', 'bank', 'cod'].includes(method)) {
    throw paymentError(400, 'Choose a supported payment method.');
  }
  if (method !== 'cod' && !paymentConfiguration()[method]) {
    throw paymentError(503, `${method === 'paypal' ? 'PayPal' : 'PayMongo'} is not configured on the server yet.`);
  }

  const order = {
    id: randomUUID(),
    customer,
    items,
    total,
    currency: 'PHP',
    method,
    status: method === 'cod' ? 'pending' : 'awaiting_payment',
    paymentStatus: method === 'cod' ? 'cash_on_delivery' : 'pending',
    createdAt: new Date().toISOString(),
    providerOrderId: null,
    checkoutSessionId: null
  };

  await updateStore(store => {
    for (const [productId, quantity] of quantities) {
      if (store.inventory[productId] < quantity) {
        const product = catalog.find(entry => entry.id === productId);
        throw paymentError(409, `${product.name} has just sold out. Please review your bag.`);
      }
    }
    for (const [productId, quantity] of quantities) store.inventory[productId] -= quantity;
    store.orders.push(order);
  });
  return order;
}

async function releaseOrder(orderId, reason) {
  return updateStore(store => {
    const order = store.orders.find(entry => entry.id === orderId);
    if (!order || order.status !== 'awaiting_payment') return null;
    for (const item of order.items) store.inventory[item.productId] += item.quantity;
    order.status = 'payment_failed';
    order.paymentStatus = reason;
    return order;
  });
}

async function cancelCheckout(orderId) {
  const order = await releaseOrder(orderId, 'cancelled');
  if (!order) throw paymentError(404, 'This checkout was already completed or could not be found.');
  return { cancelled: true };
}

async function markPaid(orderId, providerId) {
  return updateStore(store => {
    const order = store.orders.find(entry => entry.id === orderId);
    if (!order || order.providerOrderId !== providerId && order.checkoutSessionId !== providerId) return null;
    if (order.paymentStatus === 'paid') return order;
    if (order.status !== 'awaiting_payment') return null;
    order.status = 'pending';
    order.paymentStatus = 'paid';
    order.paidAt = new Date().toISOString();
    return order;
  });
}

function publicOrder(order) {
  if (!order) return null;
  return {
    id: order.id,
    email: order.customer.email,
    name: order.customer.name,
    items: order.items,
    total: order.total,
    createdAt: order.createdAt,
    status: order.status,
    paymentStatus: order.paymentStatus,
    payment: order.method
  };
}

async function startCheckout(body) {
  const order = await reserveOrder(body);
  if (order.method === 'cod') return { order: publicOrder(order) };

  try {
    if (order.method === 'paypal') {
      const token = await paypalAccessToken();
      const result = await providerRequest(`${paypalBase}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': order.id
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: order.id,
            custom_id: order.id,
            description: `Astrojack order ${order.id.slice(0, 8)}`,
            amount: { currency_code: 'PHP', value: order.total.toFixed(2) }
          }],
          application_context: {
            brand_name: 'Astrojack',
            user_action: 'PAY_NOW',
            return_url: `${publicUrl}/?payment=paypal&orderId=${encodeURIComponent(order.id)}`,
            cancel_url: `${publicUrl}/?payment=cancel&orderId=${encodeURIComponent(order.id)}`
          }
        })
      }, 'PayPal');
      const approvalUrl = result.links?.find(link => link.rel === 'approve')?.href;
      if (!result.id || !approvalUrl) throw paymentError(502, 'PayPal did not return an approval link.');
      await updateStore(store => {
        const savedOrder = store.orders.find(entry => entry.id === order.id);
        savedOrder.providerOrderId = result.id;
      });
      return { redirectUrl: approvalUrl };
    }

    const paymentMethod = order.method === 'gcash' ? 'gcash' : 'dob';
    const result = await paymongoRequest('https://api.paymongo.com/v2/checkout_sessions', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: order.items.map(item => ({
              name: `${item.name} (${item.color}, ${item.size})`,
              amount: item.price * 100,
              currency: 'PHP',
              quantity: item.quantity
            })),
            payment_method_types: [paymentMethod],
            success_url: `${publicUrl}/?payment=paymongo&orderId=${encodeURIComponent(order.id)}`,
            cancel_url: `${publicUrl}/?payment=cancel&orderId=${encodeURIComponent(order.id)}`,
            reference_number: order.id,
            send_email_receipt: true,
            metadata: { order_id: order.id }
          }
        }
      })
    });
    const session = result.data;
    if (!session?.id || !session.attributes?.checkout_url) {
      throw paymentError(502, 'PayMongo did not return a checkout link.');
    }
    await updateStore(store => {
      const savedOrder = store.orders.find(entry => entry.id === order.id);
      savedOrder.checkoutSessionId = session.id;
    });
    return { redirectUrl: session.attributes.checkout_url };
  } catch (error) {
    await releaseOrder(order.id, 'checkout_failed');
    throw error;
  }
}

async function completePayPal(orderId, paypalOrderId) {
  const store = await getStore();
  const order = store.orders.find(entry => entry.id === orderId);
  if (!order || order.method !== 'paypal' || order.providerOrderId !== paypalOrderId) {
    throw paymentError(404, 'The PayPal order could not be verified.');
  }
  if (order.paymentStatus === 'paid') return publicOrder(order);
  if (order.status !== 'awaiting_payment') throw paymentError(409, 'This order is no longer awaiting payment.');

  const token = await paypalAccessToken();
  const result = await providerRequest(`${paypalBase}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `capture-${order.id}`
    }
  }, 'PayPal');
  const captures = result.purchase_units?.flatMap(unit => unit.payments?.captures || []) || [];
  const capturedAmount = captures.reduce((sum, capture) => {
    if (capture.status !== 'COMPLETED' || capture.amount?.currency_code !== order.currency) return sum;
    return sum + Math.round(Number(capture.amount.value) * 100);
  }, 0);
  if (result.status !== 'COMPLETED' || capturedAmount !== order.total * 100) {
    throw paymentError(409, 'PayPal has not confirmed the full order payment.');
  }
  const completed = await markPaid(order.id, paypalOrderId);
  if (!completed) throw paymentError(409, 'The PayPal payment could not be matched to this order.');
  return publicOrder(completed);
}

function isPaymongoPaid(session, expectedAmount) {
  const attributes = session?.attributes;
  const payments = attributes?.payments || [];
  const paidPaymentMatches = payments.some(payment =>
    payment.attributes?.status === 'paid'
    && payment.attributes?.currency === 'PHP'
    && Number(payment.attributes?.amount) === expectedAmount * 100
  );
  const lineItemsMatch = Array.isArray(attributes?.line_items)
    && attributes.line_items.reduce((sum, item) => sum + Number(item.amount) * Number(item.quantity), 0) === expectedAmount * 100;
  return paidPaymentMatches || (attributes?.status === 'paid' && lineItemsMatch);
}

async function completePaymongo(orderId) {
  const store = await getStore();
  const order = store.orders.find(entry => entry.id === orderId);
  if (!order || !order.checkoutSessionId || !['gcash', 'bank'].includes(order.method)) {
    throw paymentError(404, 'The PayMongo checkout could not be verified.');
  }
  if (order.paymentStatus === 'paid') return publicOrder(order);
  const result = await paymongoRequest(
    `https://api.paymongo.com/v2/checkout_sessions/${encodeURIComponent(order.checkoutSessionId)}`
  );
  if (result.data?.id !== order.checkoutSessionId || !isPaymongoPaid(result.data, order.total)) {
    throw paymentError(409, 'Payment is not confirmed yet. Please wait a moment and check again.');
  }
  const completed = await markPaid(order.id, order.checkoutSessionId);
  if (!completed) throw paymentError(409, 'The PayMongo payment could not be matched to this order.');
  return publicOrder(completed);
}

function verifyPaymongoWebhook(request, rawBody) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) return false;
  const header = request.headers['paymongo-signature'];
  if (typeof header !== 'string') return false;
  const parts = Object.fromEntries(header.split(',').map(part => part.trim().split('=')));
  const signature = parts[process.env.PAYMONGO_SECRET_KEY?.startsWith('sk_live_') ? 'li' : 'te'];
  if (!parts.t || !signature || !/^\d+$/.test(parts.t)) return false;
  const expected = createHmac('sha256', secret).update(`${parts.t}.${rawBody}`).digest('hex');
  const actualBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

async function handlePaymongoWebhook(request, rawBody) {
  if (!verifyPaymongoWebhook(request, rawBody)) throw paymentError(400, 'Invalid PayMongo webhook signature.');
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw paymentError(400, 'Invalid PayMongo webhook body.');
  }
  const event = payload.data;
  if (event?.type !== 'checkout_session.payment.paid') return { received: true };
  const session = event.data;
  const orderId = session?.attributes?.reference_number || session?.attributes?.metadata?.order_id;
  const store = await getStore();
  const order = store.orders.find(entry =>
    entry.id === orderId && entry.checkoutSessionId === session.id && ['gcash', 'bank'].includes(entry.method)
  );
  if (!order || !isPaymongoPaid(session, order.total)) {
    throw paymentError(400, 'PayMongo payment does not match a known order.');
  }
  await markPaid(order.id, session.id);
  return { received: true };
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/config') {
    sendJson(response, 200, paymentConfiguration());
    return;
  }
  if (request.method === 'GET' && url.pathname === '/api/products') {
    const store = getStore();
    sendJson(response, 200, catalog.map(product => ({
      ...product,
      stock: store.inventory[product.id] ?? product.stock,
      threshold: store.thresholds[product.id] ?? product.threshold ?? defaultLowStockThreshold
    })));
    return;
  }
  if (request.method === 'GET' && url.pathname === '/api/admin/session') {
    const authenticated = Boolean(sessionForRequest(request));
    sendJson(response, 200, { authenticated, username: authenticated ? process.env.ADMIN_USERNAME : '' });
    return;
  }
  if (request.method === 'POST' && url.pathname === '/api/admin/login') {
    requireSameOrigin(request);
    const ip = request.socket.remoteAddress || 'unknown';
    const attempt = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
    if (attempt.blockedUntil > Date.now()) throw paymentError(429, 'Too many sign-in attempts. Please wait 15 minutes.');
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
      throw paymentError(503, 'Admin sign-in is not configured. See the setup instructions.');
    }
    const body = await readRequestBody(request);
    const username = safeText(body.username, 100);
    const password = typeof body.password === 'string' ? body.password : '';
    const usernameMatches = timingSafeEqual(
      createHash('sha256').update(username).digest(),
      createHash('sha256').update(process.env.ADMIN_USERNAME).digest()
    );
    if (!usernameMatches || !verifyAdminPassword(password, process.env.ADMIN_PASSWORD_HASH)) {
      attempt.count += 1;
      if (attempt.count >= 5) {
        attempt.count = 0;
        attempt.blockedUntil = Date.now() + 15 * 60 * 1000;
      }
      loginAttempts.set(ip, attempt);
      throw paymentError(401, 'Username or password is incorrect.');
    }
    loginAttempts.delete(ip);
    const token = randomBytes(32).toString('base64url');
    const expiresAt = Date.now() + sessionDuration;
    database.prepare('INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)')
      .run(createHash('sha256').update(token).digest('hex'), expiresAt);
    const secure = new URL(publicUrl).protocol === 'https:' || process.env.NODE_ENV === 'production';
    response.setHeader('Set-Cookie', `${sessionCookie}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(sessionDuration / 1000)}${secure ? '; Secure' : ''}`);
    sendJson(response, 200, { authenticated: true, username: process.env.ADMIN_USERNAME });
    return;
  }
  if (request.method === 'POST' && url.pathname === '/api/admin/logout') {
    requireSameOrigin(request);
    const token = readCookies(request)[sessionCookie];
    if (token) database.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(createHash('sha256').update(token).digest('hex'));
    const secure = new URL(publicUrl).protocol === 'https:' || process.env.NODE_ENV === 'production';
    response.setHeader('Set-Cookie', `${sessionCookie}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure ? '; Secure' : ''}`);
    sendJson(response, 200, { authenticated: false });
    return;
  }
  if (request.method === 'GET' && url.pathname === '/api/admin/dashboard') {
    requireAdmin(request);
    const store = getStore();
    const orders = adminOrders();
    const products = catalog.map(product => ({
      ...product,
      stock: store.inventory[product.id] ?? product.stock,
      threshold: store.thresholds[product.id] ?? product.threshold ?? defaultLowStockThreshold
    }));
    sendJson(response, 200, {
      products,
      orders,
      stats: {
        grossSales: orders.filter(order => order.paymentStatus === 'paid' || order.payment === 'cod').reduce((sum, order) => sum + order.total, 0),
        units: orders.reduce((sum, order) => sum + order.items.reduce((subtotal, item) => subtotal + item.quantity, 0), 0),
        orders: orders.length,
        pending: orders.filter(order => ['pending', 'awaiting_payment'].includes(order.status)).length,
        lowStock: products.filter(product => product.stock <= product.threshold).length
      }
    });
    return;
  }
  const inventoryMatch = url.pathname.match(/^\/api\/admin\/products\/([a-z0-9-]+)$/);
  if (request.method === 'PATCH' && inventoryMatch) {
    requireSameOrigin(request);
    requireAdmin(request);
    const product = catalog.find(item => item.id === inventoryMatch[1]);
    const body = await readRequestBody(request);
    if (!product || !Number.isSafeInteger(body.stock) || body.stock < 0 || !Number.isSafeInteger(body.threshold) || body.threshold < 0) {
      throw paymentError(400, 'Enter a valid stock quantity and low-stock threshold.');
    }
    updateStore(store => {
      store.inventory[product.id] = body.stock;
      store.thresholds[product.id] = body.threshold;
      return true;
    });
    sendJson(response, 200, { product: { ...product, stock: body.stock, threshold: body.threshold } });
    return;
  }
  const orderMatch = url.pathname.match(/^\/api\/admin\/orders\/([a-f0-9-]+)$/);
  if (request.method === 'PATCH' && orderMatch) {
    requireSameOrigin(request);
    requireAdmin(request);
    const body = await readRequestBody(request);
    if (!['pending', 'processing', 'shipped'].includes(body.status)) throw paymentError(400, 'Choose a valid fulfillment status.');
    const order = updateStore(store => {
      const entry = store.orders.find(item => item.id === orderMatch[1]);
      if (!entry) return null;
      if (entry.paymentStatus !== 'paid' && entry.method !== 'cod') throw paymentError(409, 'Only paid orders can move to fulfillment.');
      entry.status = body.status;
      return entry;
    });
    if (!order) throw paymentError(404, 'Order not found.');
    sendJson(response, 200, { order: publicOrder(order) });
    return;
  }
  const customerOrderMatch = url.pathname.match(/^\/api\/orders\/([a-f0-9-]+)$/);
  if (request.method === 'GET' && customerOrderMatch) {
    const email = safeText(url.searchParams.get('email'), 254).toLowerCase();
    const order = getStore().orders.find(entry => entry.id === customerOrderMatch[1] && entry.customer.email === email);
    if (!order) throw paymentError(404, 'No order matches that reference and email.');
    sendJson(response, 200, { order: publicOrder(order) });
    return;
  }
  if (request.method === 'POST' && url.pathname === '/api/checkout') {
    const result = await startCheckout(await readRequestBody(request));
    sendJson(response, 200, result);
    return;
  }
  if (request.method === 'POST' && url.pathname === '/api/checkout/cancel') {
    const body = await readRequestBody(request);
    sendJson(response, 200, await cancelCheckout(safeText(body.orderId, 80)));
    return;
  }
  if (request.method === 'POST' && url.pathname === '/api/paypal/capture') {
    const body = await readRequestBody(request);
    const order = await completePayPal(safeText(body.orderId, 80), safeText(body.paypalOrderId, 100));
    sendJson(response, 200, { order });
    return;
  }
  if (request.method === 'POST' && url.pathname === '/api/paymongo/confirm') {
    const body = await readRequestBody(request);
    const order = await completePaymongo(safeText(body.orderId, 80));
    sendJson(response, 200, { order });
    return;
  }
  if (request.method === 'POST' && url.pathname === '/api/webhooks/paymongo') {
    const rawBody = await readRequestBodyRaw(request);
    sendJson(response, 200, await handlePaymongoWebhook(request, rawBody));
    return;
  }
  if (request.method === 'GET' && url.pathname === '/api/health') {
    sendJson(response, 200, { status: 'ok', payments: paymentConfiguration() });
    return;
  }
  sendJson(response, 404, { error: 'API route not found.' });
}

function readRequestBodyRaw(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', chunk => {
      size += chunk.length;
      if (size > bodyLimit) {
        reject(paymentError(413, 'Webhook body is too large.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

async function serveStatic(request, response, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = path.resolve(root, `.${requestedPath}`);
  const extension = path.extname(filePath).toLowerCase();
  if (!filePath.startsWith(`${root}${path.sep}`) || filePath.startsWith(`${dataDirectory}${path.sep}`)
      || !['.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico'].includes(extension)) {
    sendJson(response, 404, { error: 'Not found.' });
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw Object.assign(new Error('Not found.'), { code: 'ENOENT' });
    response.writeHead(200, {
      'Cache-Control': path.extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=300',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' https://images.unsplash.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
      'Content-Length': info.size,
      'Content-Type': mimeTypes[extension] || 'application/octet-stream',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff'
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    sendJson(response, 404, { error: 'Not found.' });
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, publicUrl);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(request, response, url);
      return;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      sendJson(response, 405, { error: 'Method not allowed.' });
      return;
    }
    await serveStatic(request, response, url.pathname);
  } catch (error) {
    if (response.headersSent || response.destroyed) return;
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status === 500) console.error('Request failed:', error);
    sendJson(response, status, { error: status === 500 ? 'The checkout service encountered an error.' : error.message });
  }
});

initializeDatabase();
if (process.argv.includes('--hash-admin-password')) {
  const first = await readHidden('New admin password (12+ characters): ');
  const second = await readHidden('Confirm admin password: ');
  if (first.length < 12 || first !== second) {
    database.close();
    throw new Error('Passwords must match and contain at least 12 characters.');
  }
  stdout.write(`ADMIN_PASSWORD_HASH=${hashAdminPassword(first)}\n`);
  database.close();
  process.exit(0);
}
server.listen(port, () => {
  console.log(`Astrojack storefront and payment API running at ${publicUrl}`);
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
    console.log('Admin sign-in is disabled until ADMIN_USERNAME and ADMIN_PASSWORD_HASH are configured.');
  }
  if (!process.env.PAYPAL_CLIENT_ID) console.log('PayPal is disabled until PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are configured.');
  if (!process.env.PAYMONGO_SECRET_KEY || !process.env.PAYMONGO_WEBHOOK_SECRET) {
    console.log('PayMongo is disabled until PAYMONGO_SECRET_KEY and PAYMONGO_WEBHOOK_SECRET are configured.');
  }
});
