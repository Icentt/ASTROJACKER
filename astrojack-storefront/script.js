const seedProducts = [
  { id: 'orbit-hoodie', name: 'Orbit Heavyweight Hoodie', category: 'Men', type: 'Sweatshirts', price: 2490, stock: 8, threshold: 3, sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Heather Gray', 'Forest Green'], description: 'A heavyweight cotton fleece hoodie with a relaxed drop shoulder, tonal embroidered mark, and a soft brushed interior.', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1000&q=85' },
  { id: 'signal-tee', name: 'Signal Graphic Tee', category: 'Men', type: 'T-Shirts', price: 990, stock: 14, threshold: 4, sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Red'], description: 'Midweight, garment-dyed cotton with a screen-printed back graphic. Built to soften with every wear.', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=85' },
  { id: 'night-runner', name: 'Night Runner Shell', category: 'Women', type: 'Outerwear', price: 3290, stock: 5, threshold: 2, sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Olive', 'Stone'], description: 'A light, water-resistant shell with a high collar, adjustable hem, and easy room for layering.', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=1000&q=85' },
  { id: 'city-cap', name: 'City Circuit Cap', category: 'Kids', type: 'Accessories', price: 790, stock: 12, threshold: 3, sizes: ['One size'], colors: ['Black', 'Navy', 'Khaki'], description: 'A six-panel cotton cap with a curved brim, adjustable strap, and small embroidered spider emblem.', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1000&q=85' },
  { id: 'static-crew', name: 'Static Crewneck', category: 'Women', type: 'Sweatshirts', price: 2190, stock: 2, threshold: 3, sizes: ['S', 'M', 'L', 'XL'], colors: ['Charcoal', 'Oatmeal', 'Burgundy'], description: 'A heavyweight crewneck in washed charcoal, finished with ribbed trims and a clean, roomy fit.', image: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85' },
  { id: 'sidewalk-low', name: 'Sidewalk Low Top', category: 'Kids', type: 'Shoes', price: 2890, stock: 6, threshold: 2, sizes: ['36', '37', '38', '39', '40'], colors: ['Black', 'White', 'Red'], description: 'Everyday low-top sneakers with a durable canvas upper, cushioned footbed, and grippy rubber sole.', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85' },
  { id: 'afterhours-tee', name: 'Afterhours Long Sleeve', category: 'Men', type: 'T-Shirts', price: 1390, stock: 9, threshold: 3, sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'White', 'Charcoal'], description: 'A roomy long sleeve jersey tee with ribbed cuffs and an original Astrojack back print.', image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85' },
  { id: 'orbit-tote', name: 'Orbit Utility Tote', category: 'Women', type: 'Accessories', price: 590, stock: 0, threshold: 2, sizes: ['One size'], colors: ['Natural', 'Black'], description: 'A sturdy everyday carryall in recycled cotton canvas, with reinforced handles and an inside pocket.', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85', second: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85' }
];

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(`astrojack-${key}`)) ?? fallback; }
  catch { return fallback; }
};
const savedProducts = load('products', seedProducts);
const products = seedProducts.map(product => ({
  ...product,
  ...(Array.isArray(savedProducts) ? savedProducts.find(saved => saved.id === product.id) : {}),
  sizes: product.sizes,
  colors: product.colors
}));
const isAdminApp = document.body.dataset.appMode === 'admin';
const state = {
  products,
  cart: load('cart', []),
  orders: [],
  favorites: new Set(load('favorites', [])),
  page: isAdminApp ? 'admin' : 'home',
  category: 'All',
  type: 'All',
  query: '',
  sort: 'featured',
  onlyInStock: false,
  showFavorites: false,
  productId: null,
  size: null,
  color: null,
  accountEmail: '',
  orderReference: '',
  trackedOrder: null,
  paymentConfig: { paypal: false, gcash: false, bank: false },
  adminAuthenticated: false,
  adminDashboard: null,
  adminUsername: ''
};
const app = document.querySelector('#app');
const money = amount => `₱${Number(amount).toLocaleString('en-PH')}`;
const save = () => {
  localStorage.setItem('astrojack-products', JSON.stringify(state.products));
  localStorage.setItem('astrojack-cart', JSON.stringify(state.cart));
  localStorage.setItem('astrojack-favorites', JSON.stringify([...state.favorites]));
};
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const productById = id => state.products.find(product => product.id === id);
const cartCount = () => state.cart.reduce((sum, item) => sum + item.quantity, 0);
const cartTotal = () => state.cart.reduce((sum, item) => sum + (productById(item.productId)?.price || 0) * item.quantity, 0);

function logo() {
  return `<svg class="spider-mark" viewBox="0 0 64 80" role="img" aria-label="Astrojack spider emblem"><g fill="none" stroke="#eee" stroke-width="2.4" stroke-linecap="round"><path d="M25 27 12 12 8 4M39 27 52 12l4-8M22 35 8 31 3 20M42 35l14-4 5-11M22 43 7 49 3 62M42 43l15 6 4 13M26 50 16 64l-7 9M38 50l10 14 7 9"/><path d="M24 29q8-7 16 0l4 14q-12 12-24 0z"/></g><circle cx="27" cy="37" r="3.5" fill="#d52932"/><circle cx="37" cy="37" r="3.5" fill="#d52932"/></svg>`;
}

function applyPaymentConfig() {
  const select = document.querySelector('#payment-method');
  if (!select) return;
  for (const option of select.options) {
    if (option.value === 'cod') continue;
    const available = Boolean(state.paymentConfig[option.value]);
    option.disabled = !available;
    option.textContent = `${option.value === 'paypal' ? 'PayPal' : option.value === 'gcash' ? 'GCash' : 'Online bank transfer'}${available ? '' : ' (not configured)'}`;
  }
  if (select.selectedOptions[0]?.disabled) select.value = 'cod';
}

function saveCompletedOrder(order) {
  if (state.orders.some(saved => saved.id === order.id)) return;
  for (const item of order.items) {
    const product = productById(item.productId);
    if (product) product.stock = Math.max(0, product.stock - item.quantity);
  }
  state.orders.push(order);
  state.cart = [];
  state.accountEmail = order.email;
  state.orderReference = order.id;
  state.trackedOrder = order;
  save();
  state.page = 'account';
  render();
}

async function postCheckout(path, body) {
  let response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new Error('Checkout server is unavailable. Start the Astrojack server and try again.');
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Checkout could not be completed.');
  return result;
}

async function requestApi(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
    });
  } catch {
    throw new Error('The Astrojack server is unavailable. Start the server and try again.');
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'The request could not be completed.');
  return result;
}

async function refreshAdminDashboard() {
  state.adminDashboard = await requestApi('/api/admin/dashboard');
  state.products = seedProducts.map(product => ({
    ...product,
    stock: state.adminDashboard.products.find(entry => entry.id === product.id)?.stock ?? product.stock,
    threshold: state.adminDashboard.products.find(entry => entry.id === product.id)?.threshold ?? product.threshold
  }));
  render();
}

async function handleCheckout(form) {
  const button = form.querySelector('#checkout-submit');
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  const values = Object.fromEntries(new FormData(form));
  try {
    for (const item of state.cart) {
      const product = productById(item.productId);
      const requested = state.cart.filter(entry => entry.productId === item.productId).reduce((sum, entry) => sum + entry.quantity, 0);
      if (!product || product.stock < requested) throw new Error(`${product?.name || 'An item'} no longer has enough stock. Please review your bag.`);
    }
    const result = await postCheckout('/api/checkout', {
      customer: { name: values.name, email: values.email, phone: values.phone, address: values.address },
      items: state.cart.map(item => ({ productId: item.productId, size: item.size, color: item.color || productById(item.productId)?.colors[0], quantity: item.quantity })),
      method: values.payment
    });
    if (result.redirectUrl) {
      window.location.assign(result.redirectUrl);
      return;
    }
    if (!result.order) throw new Error('The checkout service did not return an order confirmation.');
    saveCompletedOrder(result.order);
    notify(`Order ${result.order.id.slice(0, 8)} placed. Payment is due on delivery.`);
  } catch (error) {
    notify(error.message);
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
}

async function handlePaymentReturn() {
  const url = new URL(window.location.href);
  const result = url.searchParams.get('payment');
  const orderId = url.searchParams.get('orderId');
  if (!result || !orderId) return;
  if (result === 'cancel') {
    try {
      await postCheckout('/api/checkout/cancel', { orderId });
    } catch (error) {
      notify(error.message);
      return;
    }
    url.search = '';
    history.replaceState(null, '', url);
    notify('Payment was cancelled. Your bag is ready when you are.');
    return;
  }
  if (result !== 'paypal' && result !== 'paymongo') return;
  try {
    const response = result === 'paypal'
      ? await postCheckout('/api/paypal/capture', { orderId, paypalOrderId: url.searchParams.get('token') })
      : await postCheckout('/api/paymongo/confirm', { orderId });
    saveCompletedOrder(response.order);
    url.search = '';
    history.replaceState(null, '', url);
    notify(`Payment confirmed. Order ${response.order.id.slice(0, 8)} is being prepared.`);
  } catch (error) {
    notify(error.message);
  }
}

function header() {
  if (isAdminApp) {
    return `<header class="store-header admin-header"><a class="logo-button" href="index.html" aria-label="Astrojack storefront">${logo()}</a><div class="admin-brand"><span>Operations workspace</span><strong>ASTROJACK / ADMIN</strong></div><a class="admin-store-link" href="index.html">View storefront <span>↗</span></a></header>`;
  }

  const pages = ['home', 'shop', 'faq', 'size', 'charity'];
  const navItems = pages.map(page => {
    const labels = { home: 'Home', shop: 'Shop', faq: 'FAQ', size: 'Size chart', charity: 'Charity', admin: 'Admin' };
    return `<button class="${state.page === page ? 'active' : ''}" data-page="${page}">${labels[page]}</button>`;
  }).join('');

  return `<header class="store-header"><a class="brand-lockup" href="index.html" aria-label="Astrojack home">${logo()}<span class="brand-wordmark">ASTROJACK<small>Independent streetwear</small></span></a><nav class="main-nav" id="main-navigation" aria-label="Main navigation">${navItems}</nav><div class="header-tools"><button class="icon-button" data-page="account" aria-label="Track an order" title="Track an order"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg></button><form class="header-search" id="search-form" role="search"><input name="query" type="search" aria-label="Search products" placeholder="Search pieces" value="${escapeHtml(state.query)}"><button class="icon-button" aria-label="Search"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></button></form><button class="icon-button cart-trigger" data-page="cart" aria-label="Shopping bag, ${cartCount()} items" title="Shopping bag"><svg viewBox="0 0 24 24"><path d="M3 4h2l2.2 11.2a2 2 0 002 1.6h8.9a2 2 0 001.9-1.4L22 8H6"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg><span>${cartCount()}</span></button><button class="menu-toggle" data-action="menu" aria-controls="main-navigation" aria-expanded="false" aria-label="Open navigation menu"><span aria-hidden="true">☰</span></button></div></header>`;
}

function productCard(product) {
  const isFavorite = state.favorites.has(product.id);
  return `<article class="product-card"><button class="product-image" data-product="${product.id}" aria-label="View ${escapeHtml(product.name)}"><img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy"><span class="stock-flag ${product.stock ? '' : 'sold-out'}">${product.stock ? 'In stock' : 'Sold out'}</span><span class="product-image-cta">Explore piece <span aria-hidden="true">↗</span></span></button><button class="favorite-toggle ${isFavorite ? 'active' : ''}" data-favorite="${product.id}" aria-label="${isFavorite ? 'Remove from' : 'Add to'} wishlist" aria-pressed="${isFavorite}">${isFavorite ? '♥' : '♡'}</button><div class="product-caption"><button data-product="${product.id}" class="product-name">${escapeHtml(product.name)}</button><span>${money(product.price)}</span></div><p class="product-subtitle">${product.category} / ${product.type}</p><div class="card-colors" aria-label="Available colors">${product.colors.map(color => `<span class="color-swatch" title="${escapeHtml(color)}" aria-label="${escapeHtml(color)}" style="--swatch-color:${({ Black: '#171719', 'Heather Gray': '#9a9a98', 'Forest Green': '#314a3b', White: '#f2f0ec', Red: '#b52e36', Olive: '#69704b', Stone: '#c3b9a5', Navy: '#28334b', Khaki: '#b39b72', Charcoal: '#48484a', Oatmeal: '#d7c9b1', Burgundy: '#702d3b', Natural: '#d2c2a3' })[color] || '#777'}"></span>`).join('')}<span class="color-count">${product.colors.length} colors</span></div></article>`;
}

function shopContent() {
  let visible = state.products.filter(product => (state.category === 'All' || product.category === state.category) && (state.type === 'All' || product.type === state.type) && (!state.onlyInStock || product.stock > 0) && (!state.showFavorites || state.favorites.has(product.id)) && `${product.name} ${product.type} ${product.category} ${product.colors.join(' ')}`.toLowerCase().includes(state.query.toLowerCase()));
  if (state.sort === 'price-asc') visible = [...visible].sort((left, right) => left.price - right.price);
  if (state.sort === 'price-desc') visible = [...visible].sort((left, right) => right.price - left.price);
  if (state.sort === 'name') visible = [...visible].sort((left, right) => left.name.localeCompare(right.name));
  const types = ['All', ...new Set(state.products.map(product => product.type))];
  return `<section class="shop-section"><div class="section-heading"><div><p class="eyebrow">Astrojack / shop</p><h1>Streetwear with a point of view.</h1></div><span class="result-count">${visible.length} ${visible.length === 1 ? 'piece' : 'pieces'}</span></div><div class="filter-row"><div class="filter-group">${['All', 'Men', 'Women', 'Kids'].map(category => `<button class="filter-chip ${state.category === category ? 'active' : ''}" data-category="${category}">${category}</button>`).join('')}</div><div class="shop-controls"><label class="type-filter"><span>Type</span><select id="type-filter">${types.map(type => `<option ${state.type === type ? 'selected' : ''}>${type}</option>`).join('')}</select></label><label class="type-filter"><span>Sort</span><select id="sort-filter"><option value="featured" ${state.sort === 'featured' ? 'selected' : ''}>Featured</option><option value="price-asc" ${state.sort === 'price-asc' ? 'selected' : ''}>Price: low to high</option><option value="price-desc" ${state.sort === 'price-desc' ? 'selected' : ''}>Price: high to low</option><option value="name" ${state.sort === 'name' ? 'selected' : ''}>Name</option></select></label><label class="stock-filter"><input type="checkbox" id="stock-filter" ${state.onlyInStock ? 'checked' : ''}> In stock</label><button class="filter-chip ${state.showFavorites ? 'active' : ''}" data-action="favorite-filter">Wishlist (${state.favorites.size})</button></div></div>${visible.length ? `<div class="product-grid">${visible.map(productCard).join('')}</div>` : '<p class="empty-state">No pieces found. Try a different search or filter.</p>'}</section>`;
}

function homePage() {
  const featured = state.products.slice(0, 4);
  return `<main><section class="home-hero"><div class="hero-copy"><p class="eyebrow"><span class="eyebrow-mark"></span> Independent streetwear / giving back</p><h1>ASTRO<br>JACK</h1><p class="hero-tagline">Style meets purpose. Everyday essentials for the ones who move differently.</p><div class="hero-actions"><button class="primary-button" data-page="shop">Shop the collection <span aria-hidden="true">↗</span></button><button class="hero-secondary-link" data-page="charity">Our story</button></div><p class="hero-edition"><span>01</span> — MADE TO MOVE. MADE TO MATTER.</p></div><div class="hero-image"><img src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1500&q=90" alt="Streetwear campaign in the city" fetchpriority="high"><span class="image-index">ASTROJACK / CITY SERIES 001</span><span class="hero-image-caption">Built for the<br>everyday after dark.</span></div><div class="hero-side-note">MADE TO MOVE<br>MADE TO MATTER</div></section><section class="value-strip" aria-label="Shopping highlights"><div><span class="value-icon" aria-hidden="true">01</span><p><strong>Find your fit</strong><span>Size guide on every piece</span></p><button data-page="size" aria-label="View size guide">↗</button></div><div><span class="value-icon" aria-hidden="true">02</span><p><strong>Checkout your way</strong><span>Available methods shown at checkout</span></p><button data-page="shop" aria-label="Browse pieces">↗</button></div><div><span class="value-icon" aria-hidden="true">03</span><p><strong>Stay in the loop</strong><span>Track with your order reference</span></p><button data-page="account" aria-label="Track an order">↗</button></div></section><section class="collection-preview"><div class="section-heading"><div><p class="eyebrow">Fresh from the rotation</p><h2>Find your next favorite.</h2></div><button class="text-link" data-page="shop">Shop all pieces <span>↗</span></button></div><div class="home-category-links" aria-label="Shop by category">${['Men', 'Women', 'Kids'].map(category => `<button data-home-category="${category}">${category}<span aria-hidden="true">↗</span></button>`).join('')}<button data-home-category="All">View everything<span aria-hidden="true">↗</span></button></div><div class="product-grid">${featured.map(productCard).join('')}</div></section><section class="cause-strip"><p class="eyebrow">Good clothes. Good cause.</p><h2>Wear what you believe in.</h2><p class="cause-copy">A portion of every sale supports community-led work with lasting impact.</p><button class="text-link" data-page="charity">Our commitment <span>↗</span></button></section></main>`;
}

function detailPage() {
  const product = productById(state.productId);
  if (!product) return shopPage();
  const size = state.size || product.sizes[0];
  const color = state.color || product.colors[0];
  const swatches = { Black: '#171719', 'Heather Gray': '#9a9a98', 'Forest Green': '#314a3b', White: '#f2f0ec', Red: '#b52e36', Olive: '#69704b', Stone: '#c3b9a5', Navy: '#28334b', Khaki: '#b39b72', Charcoal: '#48484a', Oatmeal: '#d7c9b1', Burgundy: '#702d3b', Natural: '#d2c2a3' };
  return `<main class="detail-layout"><div class="detail-gallery"><img src="${product.image}" alt="${escapeHtml(product.name)}"></div><section class="detail-info"><button class="back-link" data-page="shop">← Back to shop</button><p class="eyebrow">${product.category} / ${product.type}</p><h1>${escapeHtml(product.name)}</h1><p class="detail-price">${money(product.price)}</p><p class="detail-description">${escapeHtml(product.description)}</p><p class="form-label">Available colors</p><div class="color-options" role="group" aria-label="Available colors">${product.colors.map(value => `<button class="color-option ${color === value ? 'active' : ''}" data-color="${escapeHtml(value)}" aria-label="${escapeHtml(value)}" aria-pressed="${color === value}"><span class="color-swatch" style="--swatch-color:${swatches[value] || '#777'}"></span><span>${escapeHtml(value)}</span></button>`).join('')}</div><p class="form-label">Select size</p><div class="size-options">${product.sizes.map(value => `<button class="size-option ${size === value ? 'active' : ''}" data-size="${value}" aria-pressed="${size === value}">${value}</button>`).join('')}</div><p class="availability ${product.stock ? '' : 'unavailable'}">${product.stock ? `${product.stock} available` : 'Currently unavailable'}</p><button class="primary-button add-button" data-action="add-cart" ${product.stock ? '' : 'disabled'}>Add to bag <span>${money(product.price)}</span></button><div class="product-notes"><details open><summary>Details</summary><p>${escapeHtml(product.description)} A portion of every sale supports our current community partner.</p></details><details><summary>Delivery & returns</summary><p>PayPal, GCash, online bank transfer, and cash on delivery are available where configured at checkout.</p></details></div></section></main>`;
}

function shopPage() { return `<main>${shopContent()}</main>`; }

function cartPage() {
  if (!state.cart.length) return `<main class="narrow-page"><p class="eyebrow">Astrojack / bag</p><h1>Your bag is empty.</h1><p class="muted">The good stuff is still out there.</p><button class="primary-button" data-page="shop">Continue shopping</button></main>`;
  return `<main class="checkout-layout"><section><p class="eyebrow">Astrojack / bag</p><h1>Your bag <span class="muted">(${cartCount()})</span></h1><div class="cart-list">${state.cart.map(item => { const product = productById(item.productId); const color = item.color || product?.colors[0]; return product ? `<article class="cart-item"><img src="${product.image}" alt=""><div class="cart-item-info"><h2>${escapeHtml(product.name)}</h2><p>Color ${escapeHtml(color)} / Size ${escapeHtml(item.size)} / ${money(product.price)}</p><div class="quantity-control"><button data-action="quantity" data-id="${product.id}" data-size="${item.size}" data-color="${escapeHtml(color)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-action="quantity" data-id="${product.id}" data-size="${item.size}" data-color="${escapeHtml(color)}" data-delta="1" aria-label="Increase quantity">+</button><button class="remove-button" data-action="remove" data-id="${product.id}" data-size="${item.size}" data-color="${escapeHtml(color)}">Remove</button></div></div><strong>${money(product.price * item.quantity)}</strong></article>` : ''; }).join('')}</div><button class="text-link" data-page="shop">← Continue shopping</button></section><aside class="checkout-panel"><h2>Checkout</h2><form id="checkout-form"><label>Full name<input required name="name" autocomplete="name"></label><label>Email address<input required type="email" name="email" autocomplete="email"></label><label>Phone number<input required type="tel" name="phone" autocomplete="tel"></label><label>Shipping address<textarea required name="address" rows="3" autocomplete="street-address"></textarea></label><label>Payment method<select name="payment" id="payment-method"><option value="paypal" ${state.paymentConfig.paypal ? '' : 'disabled'}>PayPal${state.paymentConfig.paypal ? '' : ' (not configured)'}</option><option value="gcash" ${state.paymentConfig.gcash ? '' : 'disabled'}>GCash${state.paymentConfig.gcash ? '' : ' (not configured)'}</option><option value="bank" ${state.paymentConfig.bank ? '' : 'disabled'}>Online bank transfer${state.paymentConfig.bank ? '' : ' (not configured)'}</option><option value="cod">Cash on delivery</option></select></label><p class="payment-note" id="payment-note" aria-live="polite">Choose a payment method. Online payments open a secure provider-hosted checkout.</p><div class="total-row"><span>Subtotal</span><strong>${money(cartTotal())}</strong></div><div class="total-row"><span>Delivery</span><span>Calculated on dispatch</span></div><button class="primary-button" id="checkout-submit" type="submit">Continue to payment · ${money(cartTotal())}</button><p class="fine-print">PayPal payments are captured securely by PayPal. GCash and online bank transfers are processed by PayMongo. Card details are never stored here.</p></form></aside></main>`;
}

function accountPage() {
  const order = state.trackedOrder;
  const orderResult = order
    ? `<article class="history-order"><div><strong>${escapeHtml(order.id)}</strong><p>${new Date(order.createdAt).toLocaleDateString()}</p></div><span class="status-pill ${escapeHtml(order.status)}">${escapeHtml(order.status.replaceAll('_', ' '))}</span><strong>${money(order.total)}</strong><p class="history-items">${order.items.map(item => `${escapeHtml(item.name)} / ${escapeHtml(item.color || 'Default')} / ${escapeHtml(item.size)} × ${item.quantity}`).join(' / ')} · ${escapeHtml(order.paymentStatus.replaceAll('_', ' '))}</p></article>`
    : state.orderReference ? '<p class="empty-state">No order matches that reference and email.</p>' : '<p class="muted">Enter your order reference and checkout email to see delivery and payment status.</p>';
  return `<main class="narrow-page"><p class="eyebrow">Astrojack / order tracking</p><h1>Track your order</h1><form id="account-form" class="tracking-form"><label>Order reference<input required name="orderId" value="${escapeHtml(state.orderReference)}" placeholder="Paste your order reference"></label><label>Checkout email<input type="email" required name="email" value="${escapeHtml(state.accountEmail)}" placeholder="you@example.com"></label><button class="primary-button" type="submit">Find order</button></form><div class="order-history">${orderResult}</div></main>`;
}

function adminPage() {
  if (!state.adminAuthenticated) {
    return `<main class="admin-login-page"><section class="admin-login-card"><p class="eyebrow">Restricted area / staff only</p><h1>Operations sign in</h1><p class="muted">Sign in to securely manage Astrojack inventory and fulfillment.</p><form id="admin-login-form"><label>Username<input required name="username" autocomplete="username"></label><label>Password<input required type="password" name="password" autocomplete="current-password"></label><button class="primary-button" type="submit">Sign in to operations</button><p class="form-error" id="admin-login-error" role="alert"></p></form><a class="text-link" href="index.html">← Return to storefront</a></section></main>`;
  }
  const dashboard = state.adminDashboard;
  if (!dashboard) return '<main class="admin-page"><p class="muted">Loading operations dashboard…</p></main>';
  const { stats, products, orders } = dashboard;
  return `<main class="admin-page"><div class="admin-intro"><div><p class="eyebrow">Astrojack / operations</p><h1>Control room</h1><p>Manage live inventory and customer fulfillment.</p></div><div class="admin-context"><span class="admin-badge">Signed in as ${escapeHtml(state.adminUsername)}</span><button class="admin-logout" data-action="admin-logout">Sign out</button></div></div><div class="stats-row"><article><span>Gross sales</span><strong>${money(stats.grossSales)}</strong></article><article><span>Units ordered</span><strong>${stats.units}</strong></article><article><span>Orders</span><strong>${stats.orders}</strong></article><article><span>Pending</span><strong>${stats.pending}</strong></article></div><section class="admin-section"><div class="section-heading compact"><div><p class="eyebrow">Stock control</p><h2>Inventory</h2></div><span class="muted">${stats.lowStock} low stock</span></div><div class="table-scroll"><table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Available</th><th>Alert at</th><th>Update</th></tr></thead><tbody>${products.map(product => `<tr><td class="table-product"><img src="${product.image}" alt=""><span>${escapeHtml(product.name)}</span></td><td>${product.category} / ${product.type}</td><td>${money(product.price)}</td><td><span class="stock-number ${product.stock <= product.threshold ? 'low' : ''}">${product.stock}</span></td><td>${product.threshold}</td><td><form class="stock-form" data-stock-form="${product.id}"><input name="stock" type="number" min="0" value="${product.stock}" aria-label="Available stock for ${escapeHtml(product.name)}"><input name="threshold" type="number" min="0" value="${product.threshold}" aria-label="Low stock alert for ${escapeHtml(product.name)}"><button type="submit">Save</button></form></td></tr>`).join('')}</tbody></table></div></section><section class="admin-section"><div class="section-heading compact"><div><p class="eyebrow">Fulfillment</p><h2>Customer orders</h2></div></div>${orders.length ? `<div class="table-scroll"><table><thead><tr><th>Order / customer</th><th>Date</th><th>Items / variant</th><th>Total</th><th>Payment</th><th>Fulfillment</th></tr></thead><tbody>${orders.map(order => `<tr><td>${escapeHtml(order.id.slice(0, 8))}<br>${escapeHtml(order.name)}<br><span class="muted">${escapeHtml(order.email)}</span></td><td>${new Date(order.createdAt).toLocaleDateString()}</td><td>${order.items.map(item => `${escapeHtml(item.name)} (${escapeHtml(item.color)}, ${escapeHtml(item.size)}) × ${item.quantity}`).join('<br>')}</td><td>${money(order.total)}</td><td>${escapeHtml(order.paymentStatus.replaceAll('_', ' '))} / ${escapeHtml(order.payment)}</td><td><select data-admin-order-status="${order.id}" aria-label="Fulfillment for order ${order.id}">${['pending', 'processing', 'shipped'].map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty-state">No orders yet.</p>'}</section></main>`;
}

function staticPage(page) {
  if (page === 'faq') return `<main class="narrow-page content-page"><p class="eyebrow">Help / answers</p><h1>FAQ</h1>${[['Orders & delivery', 'Orders are prepared within 2–4 business days. Delivery timing depends on your location. You will see your order status in your account.'], ['Sizing', 'Our pieces are designed for a relaxed fit. Check the size chart for garment measurements before ordering.'], ['Returns', 'Contact the Astrojack team with your order number within 7 days of delivery for return assistance. Items must be unworn and in original condition.'], ['Payment', 'Choose PayPal, GCash, online bank transfer, or cash on delivery at checkout. PayPal is handled by PayPal; GCash and online banking are processed through PayMongo. Online payment options appear once the server is configured with the approved provider credentials.'], ['Giving back', 'A portion of every Astrojack sale goes to our current charitable partner.']].map(([title, answer]) => `<details><summary>${title}</summary><p>${answer}</p></details>`).join('')}</main>`;
  if (page === 'size') return `<main class="narrow-page content-page"><p class="eyebrow">Find your fit</p><h1>Size chart</h1><p class="muted">Measurements are garment measurements in centimetres. For a relaxed fit, choose your usual size.</p><div class="table-scroll"><table><thead><tr><th>Size</th><th>Chest</th><th>Length</th><th>Shoulder</th><th>Sleeve</th></tr></thead><tbody>${[['XS', 96, 64, 42, 58], ['S', 102, 67, 45, 60], ['M', 108, 70, 48, 62], ['L', 114, 73, 51, 64], ['XL', 122, 76, 54, 66]].map(row => `<tr>${row.map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}</tbody></table></div></main>`;
  return `<main class="charity-page"><p class="eyebrow">Astrojack / purpose</p><h1>Clothes can do<br>more than clothe.</h1><p>We believe the things we make should leave something good behind. A portion of every Astrojack sale supports community-led work chosen for its lasting impact.</p><div class="charity-pledge"><span>01 / Every order</span><strong>Funds a better next step.</strong></div><button class="text-link" data-page="shop">Shop with purpose <span>↗</span></button></main>`;
}

function render() {
  const pages = isAdminApp
    ? { admin: adminPage }
    : { home: homePage, shop: shopPage, product: detailPage, cart: cartPage, account: accountPage, faq: () => staticPage('faq'), size: () => staticPage('size'), charity: () => staticPage('charity') };
  const footer = isAdminApp
    ? '<footer class="site-footer admin-footer"><span>ASTROJACK / OPERATIONS</span><span>Staff-only workspace · Activity saved to local database</span><a href="index.html">Return to storefront</a></footer>'
    : '<footer class="site-footer"><div class="footer-brand"><strong>ASTROJACK</strong><span>Independent streetwear / made to matter</span></div><nav class="footer-links" aria-label="Footer navigation"><button data-page="shop">Shop</button><button data-page="size">Size guide</button><button data-page="faq">Help & FAQ</button><button data-page="account">Track order</button></nav><div class="footer-meta"><span>© ASTROJACK 2026</span><a href="admin.html">Team workspace ↗</a></div></footer>';
  const content = (pages[state.page] || (isAdminApp ? adminPage : homePage))().replace('<main', '<main id="main-content" tabindex="-1"');
  app.innerHTML = `<a class="skip-link" href="#main-content">Skip to content</a>${header()}${content}${footer}<div id="toast" role="status" aria-live="polite"></div>`;
  document.title = isAdminApp ? 'ADMIN WORKSPACE — ASTROJACK' : `${state.page === 'home' ? 'ASTROJACK' : `${state.page.toUpperCase()} — ASTROJACK`}`;
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
  const homeCategory = event.target.closest('[data-home-category]');
  if (homeCategory) { state.category = homeCategory.dataset.homeCategory; state.page = 'shop'; render(); window.scrollTo(0, 0); return; }
  const productButton = event.target.closest('[data-product]');
  if (productButton) { state.productId = productButton.dataset.product; state.size = productById(state.productId)?.sizes[0] || null; state.color = productById(state.productId)?.colors[0] || null; state.page = 'product'; render(); window.scrollTo(0, 0); return; }
  const categoryButton = event.target.closest('[data-category]');
  if (categoryButton) { state.category = categoryButton.dataset.category; render(); return; }
  const favoriteButton = event.target.closest('[data-favorite]');
  if (favoriteButton) {
    const productId = favoriteButton.dataset.favorite;
    if (state.favorites.has(productId)) state.favorites.delete(productId);
    else state.favorites.add(productId);
    save();
    render();
    return;
  }
  const colorButton = event.target.closest('[data-color]');
  if (colorButton) { state.color = colorButton.dataset.color; render(); return; }
  const sizeButton = event.target.closest('[data-size]');
  if (sizeButton) { state.size = sizeButton.dataset.size; render(); return; }
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;
  if (actionButton.dataset.action === 'favorite-filter') { state.showFavorites = !state.showFavorites; render(); return; }
  if (actionButton.dataset.action === 'admin-logout') {
    requestApi('/api/admin/logout', { method: 'POST' })
      .then(() => { state.adminAuthenticated = false; state.adminDashboard = null; render(); })
      .catch(error => notify(error.message));
    return;
  }
  if (actionButton.dataset.action === 'clear-cart') { state.cart = []; save(); render(); return; }
  if (actionButton.dataset.action === 'add-cart') {
    const product = productById(state.productId);
    if (!product || product.stock < 1) return;
    const color = state.color || product.colors[0];
    const existing = state.cart.find(item => item.productId === product.id && item.size === state.size && (item.color || product.colors[0]) === color);
    const quantityInBag = state.cart.filter(item => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
    if (quantityInBag >= product.stock) { notify('Your bag already has all available stock.'); return; }
    if (existing) existing.quantity += 1; else state.cart.push({ productId: product.id, size: state.size || product.sizes[0], color, quantity: 1 });
    save(); render(); notify('Added to your bag.'); return;
  }
  if (actionButton.dataset.action === 'quantity') {
    const item = state.cart.find(entry => entry.productId === actionButton.dataset.id && entry.size === actionButton.dataset.size && (entry.color || productById(entry.productId)?.colors[0]) === actionButton.dataset.color);
    const next = item?.quantity + Number(actionButton.dataset.delta);
    const product = productById(actionButton.dataset.id);
    const otherSizes = state.cart.filter(entry => entry.productId === actionButton.dataset.id && entry !== item).reduce((sum, entry) => sum + entry.quantity, 0);
    if (next <= 0) state.cart = state.cart.filter(entry => entry !== item);
    else if (product && next + otherSizes <= product.stock) item.quantity = next;
    else notify('Quantity exceeds available stock.');
    save(); render(); return;
  }
  if (actionButton.dataset.action === 'remove') { state.cart = state.cart.filter(item => !(item.productId === actionButton.dataset.id && item.size === actionButton.dataset.size && (item.color || productById(item.productId)?.colors[0]) === actionButton.dataset.color)); save(); render(); }
  if (actionButton.dataset.action === 'menu') {
    const nav = document.querySelector('.main-nav');
    const isOpen = nav?.classList.toggle('open') || false;
    actionButton.setAttribute('aria-expanded', String(isOpen));
    actionButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  }
});

app.addEventListener('change', event => {
  if (event.target.id === 'type-filter') { state.type = event.target.value; render(); }
  if (event.target.id === 'sort-filter') { state.sort = event.target.value; render(); }
  if (event.target.id === 'stock-filter') { state.onlyInStock = event.target.checked; render(); }
  if (event.target.id === 'payment-method') {
    const notes = {
      paypal: 'You will approve the PHP-denominated order on PayPal, then return here to confirm payment.',
      gcash: 'PayMongo will open a secure checkout page where you can pay with GCash.',
      bank: 'PayMongo will open a secure online bank transfer checkout.',
      cod: 'Pay in cash when your order is delivered.'
    };
    document.querySelector('#payment-note').textContent = notes[event.target.value];
  }
  if (event.target.matches('[data-order-status]')) {
    const order = state.orders.find(item => item.id === event.target.dataset.orderStatus);
    if (order) { order.status = event.target.value; save(); notify(`Order ${order.id} updated.`); }
  }
  if (event.target.matches('[data-admin-order-status]')) {
    const orderId = event.target.dataset.adminOrderStatus;
    const status = event.target.value;
    requestApi(`/api/admin/orders/${orderId}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      .then(() => refreshAdminDashboard())
      .catch(error => { notify(error.message); refreshAdminDashboard().catch(refreshError => notify(refreshError.message)); });
  }
});

app.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'search-form') {
    state.query = new FormData(form).get('query').trim(); state.page = 'shop'; render(); return;
  }
  if (form.id === 'checkout-form') {
    handleCheckout(form); return;
  }
  if (form.id === 'admin-login-form') {
    const values = Object.fromEntries(new FormData(form));
    const error = document.querySelector('#admin-login-error');
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    requestApi('/api/admin/login', { method: 'POST', body: JSON.stringify(values) })
      .then(result => {
        state.adminAuthenticated = true;
        state.adminUsername = result.username;
        return refreshAdminDashboard();
      })
      .catch(loginError => { if (error) error.textContent = loginError.message; })
      .finally(() => { if (button.isConnected) button.disabled = false; });
    return;
  }
  if (form.id === 'account-form') {
    const values = Object.fromEntries(new FormData(form));
    state.accountEmail = values.email.trim();
    state.orderReference = values.orderId.trim();
    state.trackedOrder = null;
    render();
    requestApi(`/api/orders/${encodeURIComponent(state.orderReference)}?email=${encodeURIComponent(state.accountEmail)}`)
      .then(result => { state.trackedOrder = result.order; render(); })
      .catch(error => { render(); notify(error.message); });
    return;
  }
  if (form.matches('[data-stock-form]')) {
    const values = Object.fromEntries(new FormData(form));
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    requestApi(`/api/admin/products/${form.dataset.stockForm}`, {
      method: 'PATCH',
      body: JSON.stringify({ stock: Number(values.stock), threshold: Number(values.threshold) })
    }).then(() => refreshAdminDashboard())
      .then(() => notify('Inventory saved.'))
      .catch(error => notify(error.message))
      .finally(() => { if (button.isConnected) button.disabled = false; });
  }
});

render();
applyPaymentConfig();
requestApi('/api/config')
  .then(config => { state.paymentConfig = config; applyPaymentConfig(); })
  .catch(() => {});
requestApi('/api/products')
  .then(productsFromServer => {
    state.products = state.products.map(product => ({
      ...product,
      stock: productsFromServer.find(entry => entry.id === product.id)?.stock ?? product.stock,
      threshold: productsFromServer.find(entry => entry.id === product.id)?.threshold ?? product.threshold
    }));
    if (isAdminApp && !state.adminAuthenticated) render();
    else if (!isAdminApp) render();
  })
  .catch(() => {});
if (isAdminApp) {
  requestApi('/api/admin/session')
    .then(session => {
      state.adminAuthenticated = session.authenticated;
      state.adminUsername = session.username || '';
      if (session.authenticated) return refreshAdminDashboard();
      render();
      return null;
    })
    .catch(error => { notify(error.message); });
}
handlePaymentReturn();