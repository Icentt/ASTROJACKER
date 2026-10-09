const seedProducts = [
  { id: 'orbit-hoodie', name: 'Orbit Heavyweight Hoodie', category: 'Men', type: 'Sweatshirts', price: 2490, stock: 8, threshold: 3, sizes: ['S', 'M', 'L', 'XL'], description: 'A heavyweight cotton fleece hoodie with a relaxed drop shoulder, tonal embroidered mark, and a soft brushed interior.', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1000&q=85' },
  { id: 'signal-tee', name: 'Signal Graphic Tee', category: 'Men', type: 'T-Shirts', price: 990, stock: 14, threshold: 4, sizes: ['S', 'M', 'L', 'XL'], description: 'Midweight, garment-dyed cotton with a screen-printed back graphic. Built to soften with every wear.', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=85' },
  { id: 'night-runner', name: 'Night Runner Shell', category: 'Women', type: 'Outerwear', price: 3290, stock: 5, threshold: 2, sizes: ['XS', 'S', 'M', 'L'], description: 'A light, water-resistant shell with a high collar, adjustable hem, and easy room for layering.', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=1000&q=85' },
  { id: 'city-cap', name: 'City Circuit Cap', category: 'Kids', type: 'Accessories', price: 790, stock: 12, threshold: 3, sizes: ['One size'], description: 'A six-panel cotton cap with a curved brim, adjustable strap, and small embroidered spider emblem.', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1000&q=85' },
  { id: 'static-crew', name: 'Static Crewneck', category: 'Women', type: 'Sweatshirts', price: 2190, stock: 2, threshold: 3, sizes: ['S', 'M', 'L', 'XL'], description: 'A heavyweight crewneck in washed charcoal, finished with ribbed trims and a clean, roomy fit.', image: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85' },
  { id: 'sidewalk-low', name: 'Sidewalk Low Top', category: 'Kids', type: 'Shoes', price: 2890, stock: 6, threshold: 2, sizes: ['36', '37', '38', '39', '40'], description: 'Everyday low-top sneakers with a durable canvas upper, cushioned footbed, and grippy rubber sole.', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85' },
  { id: 'afterhours-tee', name: 'Afterhours Long Sleeve', category: 'Men', type: 'T-Shirts', price: 1390, stock: 9, threshold: 3, sizes: ['S', 'M', 'L', 'XL'], description: 'A roomy long sleeve jersey tee with ribbed cuffs and an original Astrojack back print.', image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85' },
  { id: 'orbit-tote', name: 'Orbit Utility Tote', category: 'Women', type: 'Accessories', price: 590, stock: 0, threshold: 2, sizes: ['One size'], description: 'A sturdy everyday carryall in recycled cotton canvas, with reinforced handles and an inside pocket.', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85' }
];

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(`astrojack-${key}`)) ?? fallback; }
  catch { return fallback; }
};
const state = {
  products: load('products', seedProducts),
  cart: load('cart', []),
  orders: load('orders', []),
  page: 'home',
  category: 'All',
  type: 'All',
  query: '',
  productId: null,
  size: null,
  accountEmail: ''
};
const app = document.querySelector('#app');
const money = amount => `₱${Number(amount).toLocaleString('en-PH')}`;
const save = () => {
  localStorage.setItem('astrojack-products', JSON.stringify(state.products));
  localStorage.setItem('astrojack-cart', JSON.stringify(state.cart));
  localStorage.setItem('astrojack-orders', JSON.stringify(state.orders));
};
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const productById = id => state.products.find(product => product.id === id);
const cartCount = () => state.cart.reduce((sum, item) => sum + item.quantity, 0);
const cartTotal = () => state.cart.reduce((sum, item) => sum + (productById(item.productId)?.price || 0) * item.quantity, 0);

function logo() {
  return `<svg class="spider-mark" viewBox="0 0 64 80" role="img" aria-label="Astrojack spider emblem"><g fill="none" stroke="#eee" stroke-width="2.4" stroke-linecap="round"><path d="M25 27 12 12 8 4M39 27 52 12l4-8M22 35 8 31 3 20M42 35l14-4 5-11M22 43 7 49 3 62M42 43l15 6 4 13M26 50 16 64l-7 9M38 50l10 14 7 9"/><path d="M24 29q8-7 16 0l4 14q-12 12-24 0z"/></g><circle cx="27" cy="37" r="3.5" fill="#d52932"/><circle cx="37" cy="37" r="3.5" fill="#d52932"/></svg>`;
}

function header() {
  return `<header class="store-header"><button class="logo-button" data-page="home" aria-label="Astrojack home">${logo()}</button><nav class="main-nav" aria-label="Main navigation"><button data-page="home">Home</button><button data-page="shop">Shop</button><button data-page="faq">FAQ</button><button data-page="size">Size chart</button><button data-page="charity">Charity</button><button data-page="admin">Admin</button></nav><div class="header-tools"><button class="icon-button" data-page="account" aria-label="Account" title="Account"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg></button><form class="header-search" id="search-form"><input name="query" aria-label="Search products" placeholder="Search" value="${escapeHtml(state.query)}"><button class="icon-button" aria-label="Submit search"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></button></form><button class="icon-button cart-trigger" data-page="cart" aria-label="Cart, ${cartCount()} items" title="Cart"><svg viewBox="0 0 24 24"><path d="M3 4h2l2.2 11.2a2 2 0 002 1.6h8.9a2 2 0 001.9-1.4L22 8H6"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg><span>${cartCount()}</span></button><button class="menu-toggle" data-action="menu" aria-label="Open menu">☰</button></div></header>`;
}

function productCard(product) {
  return `<article class="product-card"><button class="product-image" data-product="${product.id}" aria-label="View ${escapeHtml(product.name)}"><img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy"><span class="stock-flag ${product.stock ? '' : 'sold-out'}">${product.stock ? 'In stock' : 'Sold out'}</span></button><div class="product-caption"><button data-product="${product.id}" class="product-name">${escapeHtml(product.name)}</button><span>${money(product.price)}</span></div><p class="product-subtitle">${product.category} / ${product.type}</p></article>`;
}

function shopContent() {
  const visible = state.products.filter(product => (state.category === 'All' || product.category === state.category) && (state.type === 'All' || product.type === state.type) && `${product.name} ${product.type} ${product.category}`.toLowerCase().includes(state.query.toLowerCase()));
  const types = ['All', ...new Set(state.products.map(product => product.type))];
  return `<section class="shop-section"><div class="section-heading"><div><p class="eyebrow">Astrojack / shop</p><h1>Streetwear with a point of view.</h1></div><span class="result-count">${visible.length} pieces</span></div><div class="filter-row"><div class="filter-group">${['All', 'Men', 'Women', 'Kids'].map(category => `<button class="filter-chip ${state.category === category ? 'active' : ''}" data-category="${category}">${category}</button>`).join('')}</div><label class="type-filter"><span>Type</span><select id="type-filter">${types.map(type => `<option ${state.type === type ? 'selected' : ''}>${type}</option>`).join('')}</select></label></div>${visible.length ? `<div class="product-grid">${visible.map(productCard).join('')}</div>` : '<p class="empty-state">No pieces found. Try a different search.</p>'}</section>`;
}

function homePage() {
  const featured = state.products.slice(0, 4);
  return `<main><section class="home-hero"><div class="hero-copy"><p class="eyebrow">Independent streetwear / giving back</p><h1>ASTRO<br>JACK</h1><p class="hero-tagline">Style meets purpose. Every piece supports a cause worth believing in.</p><button class="text-link" data-page="shop">Explore the collection <span>↗</span></button></div><div class="hero-image"><img src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1500&q=90" alt="Streetwear campaign in the city"><span class="image-index">001 / 026</span></div><div class="hero-side-note">MADE TO MOVE<br>MADE TO MATTER</div></section><section class="collection-preview"><div class="section-heading"><div><p class="eyebrow">New season / 2026</p><h2>Current rotation</h2></div><button class="text-link" data-page="shop">Shop all <span>↗</span></button></div><div class="product-grid">${featured.map(productCard).join('')}</div></section><section class="cause-strip"><p class="eyebrow">Good clothes. Good cause.</p><h2>Wear what you believe in.</h2><button class="text-link" data-page="charity">Our commitment <span>↗</span></button></section></main>`;
}

function detailPage() {
  const product = productById(state.productId);
  if (!product) return shopPage();
  const size = state.size || product.sizes[0];
  return `<main class="detail-layout"><div class="detail-gallery"><img src="${product.image}" alt="${escapeHtml(product.name)} front view"><img src="${product.second}" alt="${escapeHtml(product.name)} alternate view"></div><section class="detail-info"><button class="back-link" data-page="shop">← Back to shop</button><p class="eyebrow">${product.category} / ${product.type}</p><h1>${escapeHtml(product.name)}</h1><p class="detail-price">${money(product.price)}</p><p class="detail-description">${escapeHtml(product.description)}</p><p class="form-label">Select size</p><div class="size-options">${product.sizes.map(value => `<button class="size-option ${size === value ? 'active' : ''}" data-size="${value}">${value}</button>`).join('')}</div><p class="availability ${product.stock ? '' : 'unavailable'}">${product.stock ? `${product.stock} available` : 'Currently unavailable'}</p><button class="primary-button add-button" data-action="add-cart" ${product.stock ? '' : 'disabled'}>Add to bag <span>${money(product.price)}</span></button><div class="product-notes"><details open><summary>Details</summary><p>${escapeHtml(product.description)} A portion of every sale supports our current community partner.</p></details><details><summary>Delivery & returns</summary><p>Orders are packed locally. Cash on delivery and bank transfer are available at checkout.</p></details></div></section></main>`;
}

function shopPage() { return `<main>${shopContent()}</main>`; }

function cartPage() {
  if (!state.cart.length) return `<main class="narrow-page"><p class="eyebrow">Astrojack / bag</p><h1>Your bag is empty.</h1><p class="muted">The good stuff is still out there.</p><button class="primary-button" data-page="shop">Continue shopping</button></main>`;
  return `<main class="checkout-layout"><section><p class="eyebrow">Astrojack / bag</p><h1>Your bag <span class="muted">(${cartCount()})</span></h1><div class="cart-list">${state.cart.map(item => { const product = productById(item.productId); return product ? `<article class="cart-item"><img src="${product.image}" alt=""><div class="cart-item-info"><h2>${escapeHtml(product.name)}</h2><p>Size ${escapeHtml(item.size)} / ${money(product.price)}</p><div class="quantity-control"><button data-action="quantity" data-id="${product.id}" data-size="${item.size}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-action="quantity" data-id="${product.id}" data-size="${item.size}" data-delta="1" aria-label="Increase quantity">+</button><button class="remove-button" data-action="remove" data-id="${product.id}" data-size="${item.size}">Remove</button></div></div><strong>${money(product.price * item.quantity)}</strong></article>` : ''; }).join('')}</div><button class="text-link" data-page="shop">← Continue shopping</button></section><aside class="checkout-panel"><h2>Checkout</h2><form id="checkout-form"><label>Full name<input required name="name" autocomplete="name"></label><label>Email address<input required type="email" name="email" autocomplete="email"></label><label>Phone number<input required type="tel" name="phone" autocomplete="tel"></label><label>Shipping address<textarea required name="address" rows="3" autocomplete="street-address"></textarea></label><label>Payment method<select name="payment"><option>Cash on delivery</option><option>Bank transfer</option></select></label><div class="total-row"><span>Subtotal</span><strong>${money(cartTotal())}</strong></div><div class="total-row"><span>Delivery</span><span>Calculated on dispatch</span></div><button class="primary-button" type="submit">Place order · ${money(cartTotal())}</button><p class="fine-print">Payment is collected by cash on delivery or bank transfer. No card details are stored.</p></form></aside></main>`;
}

function accountPage() {
  const matching = state.accountEmail ? state.orders.filter(order => order.email.toLowerCase() === state.accountEmail.toLowerCase()) : [];
  return `<main class="narrow-page"><p class="eyebrow">Astrojack / account</p><h1>Order history</h1><form id="account-form" class="inline-form"><label>Email used at checkout<input type="email" required name="email" value="${escapeHtml(state.accountEmail)}" placeholder="you@example.com"></label><button class="primary-button" type="submit">Find orders</button></form>${state.accountEmail ? matching.length ? `<div class="order-history">${matching.map(order => `<article class="history-order"><div><strong>${order.id}</strong><p>${new Date(order.createdAt).toLocaleDateString()}</p></div><span class="status-pill ${order.status}">${order.status}</span><strong>${money(order.total)}</strong><p class="history-items">${order.items.map(item => `${escapeHtml(item.name)} × ${item.quantity}`).join(' / ')}</p></article>`).join('')}</div>` : '<p class="empty-state">No orders found for that email.</p>' : '<p class="muted">Enter the email address used at checkout to see your purchases.</p>'}</main>`;
}

function adminPage() {
  const revenue = state.orders.reduce((sum, order) => sum + order.total, 0);
  const units = state.orders.reduce((sum, order) => sum + order.items.reduce((subtotal, item) => subtotal + item.quantity, 0), 0);
  const pending = state.orders.filter(order => order.status === 'pending').length;
  return `<main class="admin-page"><div class="section-heading"><div><p class="eyebrow">Astrojack / operations</p><h1>Control room</h1></div><span class="admin-date">${new Date().toLocaleDateString()}</span></div><div class="stats-row"><article><span>Gross sales</span><strong>${money(revenue)}</strong></article><article><span>Units sold</span><strong>${units}</strong></article><article><span>Orders</span><strong>${state.orders.length}</strong></article><article><span>Pending</span><strong>${pending}</strong></article></div><section class="admin-section"><div class="section-heading compact"><div><p class="eyebrow">Stock control</p><h2>Inventory</h2></div><span class="muted">${state.products.filter(product => product.stock <= product.threshold).length} low stock</span></div><div class="table-scroll"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Available</th><th>Low-stock alert</th><th>Update</th></tr></thead><tbody>${state.products.map(product => `<tr><td class="table-product"><img src="${product.image}" alt=""><span>${escapeHtml(product.name)}</span></td><td>${product.category} / ${product.type}</td><td>${money(product.price)}</td><td><span class="stock-number ${product.stock <= product.threshold ? 'low' : ''}">${product.stock}</span></td><td>${product.threshold}</td><td><form class="stock-form" data-stock-form="${product.id}"><input name="stock" type="number" min="0" value="${product.stock}" aria-label="New stock for ${escapeHtml(product.name)}"><input name="threshold" type="number" min="0" value="${product.threshold}" aria-label="Low stock threshold"><button aria-label="Save stock">Save</button></form></td></tr>`).join('')}</tbody></table></div></section><section class="admin-section"><div class="section-heading compact"><div><p class="eyebrow">Fulfillment</p><h2>Orders</h2></div></div>${state.orders.length ? `<div class="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>${[...state.orders].reverse().map(order => `<tr><td>${order.id}</td><td>${escapeHtml(order.name)}<br><span class="muted">${escapeHtml(order.email)}</span></td><td>${new Date(order.createdAt).toLocaleDateString()}</td><td>${order.items.map(item => `${escapeHtml(item.name)} (${item.size}) × ${item.quantity}`).join('<br>')}</td><td>${money(order.total)}</td><td>${escapeHtml(order.payment)}</td><td><select data-order-status="${order.id}" aria-label="Status for ${order.id}">${['pending', 'processing', 'shipped'].map(status => `<option ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty-state">New orders will appear here after checkout.</p>'}</section></main>`;
}

function staticPage(page) {
  if (page === 'faq') return `<main class="narrow-page content-page"><p class="eyebrow">Help / answers</p><h1>FAQ</h1>${[['Orders & delivery', 'Orders are prepared within 2–4 business days. Delivery timing depends on your location. You will see your order status in your account.'], ['Sizing', 'Our pieces are designed for a relaxed fit. Check the size chart for garment measurements before ordering.'], ['Returns', 'Contact the Astrojack team with your order number within 7 days of delivery for return assistance. Items must be unworn and in original condition.'], ['Payment', 'Version one supports cash on delivery and bank transfer. Payment instructions are confirmed with your order.'], ['Giving back', 'A portion of every Astrojack sale goes to our current charitable partner.']].map(([title, answer]) => `<details><summary>${title}</summary><p>${answer}</p></details>`).join('')}</main>`;
  if (page === 'size') return `<main class="narrow-page content-page"><p class="eyebrow">Find your fit</p><h1>Size chart</h1><p class="muted">Measurements are garment measurements in centimetres. For a relaxed fit, choose your usual size.</p><div class="table-scroll"><table><thead><tr><th>Size</th><th>Chest</th><th>Length</th><th>Shoulder</th><th>Sleeve</th></tr></thead><tbody>${[['XS', 96, 64, 42, 58], ['S', 102, 67, 45, 60], ['M', 108, 70, 48, 62], ['L', 114, 73, 51, 64], ['XL', 122, 76, 54, 66]].map(row => `<tr>${row.map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}</tbody></table></div></main>`;
  return `<main class="charity-page"><p class="eyebrow">Astrojack / purpose</p><h1>Clothes can do<br>more than clothe.</h1><p>We believe the things we make should leave something good behind. A portion of every Astrojack sale supports community-led work chosen for its lasting impact.</p><div class="charity-pledge"><span>01 / Every order</span><strong>Funds a better next step.</strong></div><button class="text-link" data-page="shop">Shop with purpose <span>↗</span></button></main>`;
}

function render() {
  const pages = { home: homePage, shop: shopPage, product: detailPage, cart: cartPage, account: accountPage, admin: adminPage, faq: () => staticPage('faq'), size: () => staticPage('size'), charity: () => staticPage('charity') };
  app.innerHTML = `${header()}${(pages[state.page] || homePage)()}<footer class="site-footer"><span>© ASTROJACK 2026</span><span>Independent streetwear / made to matter</span><button data-page="admin">Team access</button></footer><div id="toast" role="status" aria-live="polite"></div>`;
  document.title = `${state.page === 'home' ? 'ASTROJACK' : `${state.page.toUpperCase()} — ASTROJACK`}`;
}

function notify(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

app.addEventListener('click', event => {
  const pageButton = event.target.closest('[data-page]');
  if (pageButton) { state.page = pageButton.dataset.page; state.size = null; render(); window.scrollTo(0, 0); return; }
  const productButton = event.target.closest('[data-product]');
  if (productButton) { state.productId = productButton.dataset.product; state.size = productById(state.productId)?.sizes[0] || null; state.page = 'product'; render(); window.scrollTo(0, 0); return; }
  const categoryButton = event.target.closest('[data-category]');
  if (categoryButton) { state.category = categoryButton.dataset.category; render(); return; }
  const sizeButton = event.target.closest('[data-size]');
  if (sizeButton) { state.size = sizeButton.dataset.size; render(); return; }
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;
  if (actionButton.dataset.action === 'add-cart') {
    const product = productById(state.productId);
    if (!product || product.stock < 1) return;
    const existing = state.cart.find(item => item.productId === product.id && item.size === state.size);
    const quantityInBag = state.cart.filter(item => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
    if (quantityInBag >= product.stock) { notify('Your bag already has all available stock.'); return; }
    if (existing) existing.quantity += 1; else state.cart.push({ productId: product.id, size: state.size || product.sizes[0], quantity: 1 });
    save(); render(); notify('Added to your bag.'); return;
  }
  if (actionButton.dataset.action === 'quantity') {
    const item = state.cart.find(entry => entry.productId === actionButton.dataset.id && entry.size === actionButton.dataset.size);
    const next = item?.quantity + Number(actionButton.dataset.delta);
    const product = productById(actionButton.dataset.id);
    const otherSizes = state.cart.filter(entry => entry.productId === actionButton.dataset.id && entry !== item).reduce((sum, entry) => sum + entry.quantity, 0);
    if (next <= 0) state.cart = state.cart.filter(entry => entry !== item);
    else if (product && next + otherSizes <= product.stock) item.quantity = next;
    else notify('Quantity exceeds available stock.');
    save(); render(); return;
  }
  if (actionButton.dataset.action === 'remove') { state.cart = state.cart.filter(item => !(item.productId === actionButton.dataset.id && item.size === actionButton.dataset.size)); save(); render(); }
  if (actionButton.dataset.action === 'menu') document.querySelector('.main-nav')?.classList.toggle('open');
});

app.addEventListener('change', event => {
  if (event.target.id === 'type-filter') { state.type = event.target.value; render(); }
  if (event.target.matches('[data-order-status]')) {
    const order = state.orders.find(item => item.id === event.target.dataset.orderStatus);
    if (order) { order.status = event.target.value; save(); notify(`Order ${order.id} updated.`); }
  }
});

app.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'search-form') {
    state.query = new FormData(form).get('query').trim(); state.page = 'shop'; render(); return;
  }
  if (form.id === 'checkout-form') {
    const values = Object.fromEntries(new FormData(form));
    for (const item of state.cart) {
      const product = productById(item.productId);
      const totalRequested = state.cart.filter(entry => entry.productId === item.productId).reduce((sum, entry) => sum + entry.quantity, 0);
      if (!product || product.stock < totalRequested) { notify(`${product?.name || 'An item'} no longer has enough stock. Please review your bag.`); return; }
    }
    const items = state.cart.map(item => ({ ...item, name: productById(item.productId).name, price: productById(item.productId).price }));
    for (const item of state.cart) productById(item.productId).stock -= item.quantity;
    const order = { id: `AJ-${Date.now().toString().slice(-7)}`, ...values, items, total: cartTotal(), createdAt: new Date().toISOString(), status: 'pending' };
    state.orders.push(order); state.cart = []; state.accountEmail = values.email; save(); state.page = 'account'; render(); notify(`Order ${order.id} placed. Thank you.`); return;
  }
  if (form.id === 'account-form') { state.accountEmail = new FormData(form).get('email').trim(); render(); return; }
  if (form.matches('[data-stock-form]')) {
    const product = productById(form.dataset.stockForm); const values = new FormData(form);
    if (product) { product.stock = Math.max(0, Number(values.get('stock'))); product.threshold = Math.max(0, Number(values.get('threshold'))); save(); render(); notify(`${product.name} inventory saved.`); }
  }
});

render();