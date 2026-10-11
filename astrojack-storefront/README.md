[![Made with AI](https://img.shields.io/badge/Made_with-AI_assistance-blue)](AI-USAGE.md)

# Astrojack

Astrojack is a responsive streetwear storefront with a separate operations workspace. The customer storefront includes product browsing, category/type filters, product details, a shopping bag, checkout, customer order lookup, FAQ, size chart, and charity information. Staff inventory controls and order fulfillment are kept on a distinct admin page.

This project used GitHub Copilot for design refinement, code review, and debugging support. AI assistance was used to improve visual polish and validate implementation choices, but the core storefront structure and product logic were kept under direct developer control. See [AI-USAGE.md](AI-USAGE.md).

## Run

Node.js 22.13 or newer is required for the built-in SQLite database. Copy `.env.example` to `.env`, generate an admin password hash, configure your admin username, and add provider credentials as described below:

```sh
node server.mjs --hash-admin-password
# Add the printed ADMIN_PASSWORD_HASH to .env
node --env-file=.env server.mjs
```

Open `http://localhost:4173` for the customer storefront or `http://localhost:4173/admin.html` for the admin workspace. Do not open the HTML files directly when using checkout; the browser needs the backend API.

The first run creates `data/astrojack.sqlite` for product stock, orders, and admin sessions. Keep the `data/` directory private and backed up. `node:sqlite` is built into supported Node versions; no package install is required.

Run the local API and order-flow checks with:

```sh
node --test tests/app.test.mjs
```

## Admin operations

- Admin sign-in uses `ADMIN_USERNAME` and the scrypt password hash in `.env`; create a strong password using the hidden-input command above.
- Admin sessions use an HTTP-only, same-site cookie and expire after eight hours. Sign-in attempts are rate-limited.
- Inventory changes, order status, stock levels, and customer order lookups use the shared SQLite database. Customers need both the order reference and checkout email to view order status.
- `admin.html` is an operations entry point, not a substitute for HTTPS or production identity controls. Back up the database and do not expose the local development server directly to the public internet.

## Payment setup

- **PayPal:** Create a REST app in the PayPal developer dashboard. Put its client ID and secret in `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`. Keep `PAYPAL_ENV=sandbox` for testing; use `live` only after the business account and live credentials are approved.
- **GCash and online bank transfer:** Configure a PayMongo account and activate the desired payment channels. Put the secret API key in `PAYMONGO_SECRET_KEY` and the webhook signing secret in `PAYMONGO_WEBHOOK_SECRET`. Register `https://your-public-domain/api/webhooks/paymongo` in the PayMongo dashboard for the `checkout_session.payment.paid` event. PayMongo-hosted checkout handles the sensitive payment details.
- Set `PUBLIC_URL` to the exact public HTTPS URL of the deployed site so provider return links work. `localhost` cannot receive provider webhooks; use a deployed HTTPS environment or a secure tunnel for end-to-end testing.
- **Cash on delivery** remains available without a payment provider.

The backend calculates order totals from its server-side product catalogue, keeps provider credentials off the client, and confirms online payment server-to-server before marking orders paid. Checkout requires the Node server; running the HTML directly will not process orders. Configure provider test credentials before trying online payments. Never commit `.env` or expose live secret keys.

## Prototype limitations

The SQLite database is suitable for single-server local development and small deployments with durable local storage. It is not a substitute for a managed database in a horizontally scaled deployment. Before production, configure HTTPS, backups, provider webhooks, trusted proxy settings, and provider test-mode verification. Provider credentials and payment account approval are required for real online payments.

The product catalogue and stock counts are sample data. Product photography currently uses remote editorial placeholder images; replace these images and seed records with approved Astrojack assets, final descriptions, prices, current stock counts, and agreed low-stock thresholds before launch.
Product pages show one primary image and selectable sample color options. Stock is currently shared across all colors and sizes for each product; color-specific images and variant-level inventory are not configured.

## Main files

- `index.html` provides the app shell.
- `admin.html` provides the separate admin app shell.
- `style.css` contains the mockup-inspired responsive styling.
- `script.js` contains the catalogue, screens, interactions, and browser persistence.
- `server.mjs` serves the site, persists app data in SQLite, authenticates admin sessions, and handles provider checkout, PayPal capture, PayMongo confirmation, and webhooks.