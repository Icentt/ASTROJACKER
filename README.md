# Astrojack

Astrojack is a responsive streetwear storefront and small-team operations dashboard. It follows the supplied dark editorial mockup and includes product browsing, category/type filters, product details, a shopping bag, checkout, customer order lookup, FAQ, size chart, charity information, inventory controls, and order fulfillment status.

## Run

Open `index.html` in a browser. No build step or package installation is required.

## Demo behavior

Products, bag contents, inventory changes, and orders are stored in that browser's `localStorage`. Checkout rechecks available stock and decrements inventory when an order is placed. Payment options are cash on delivery and bank transfer; no payment gateway is connected. This is a single-browser prototype, not a shared production database or multi-customer stock reservation service.

The product catalogue and stock counts are sample data. Product photography currently uses remote editorial placeholder images; replace these images and seed records with approved Astrojack assets, final descriptions, prices, current stock counts, and agreed low-stock thresholds before launch.

## Main files

- `index.html` provides the app shell.
- `style.css` contains the mockup-inspired responsive styling.
- `script.js` contains the catalogue, screens, interactions, and browser persistence.