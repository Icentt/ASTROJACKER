# AI usage

This project was built with AI assistance. This file is the record of it. It is
graded as the finals badge, and it is worth 100 points.

Start it in week 1 and keep it up as you go. The commit history of this file is
part of the evidence: a file written all at once the night before the deadline
looks exactly like what it is.

1. How I used AI

At least six entries. One per real use. Every entry needs a commit link.

2026-10-09 - Visual refresh of the storefront
Tool: GitHub Copilot
What I asked for: "Improve the website make it more look good"
What it gave back: A darker, higher-contrast direction with cleaner spacing and a more editorial feel.
What I kept, what I changed, and why: I kept the overall direction because the mockup is a dark editorial storefront. I adjusted the palette and spacing so it fit the mockup instead of a generic dark theme. [CONFIRM: name one real value you changed in style.css]
Commit: [https://github.com/YOUR-USERNAME/ASTROJACK/commit/d56c96b](https://github.com/Icentt/ASTROJACKER/commit/1d325a48efa07446f21d4dd160602d2ed25e013f)
2026-10-09 - Hero, product cards and navigation polish
Tool: GitHub Copilot
What I asked for: "Make it more good improve the design"
What it gave back: Refinement suggestions for the hero section, product cards and navigation.
What I kept, what I changed, and why: I kept the stronger hero composition and removed some effects because the page felt crowded. [CONFIRM: say which effects]
Commit: [https://github.com/YOUR-USERNAME/ASTROJACK/commit/d56c96b](https://github.com/Icentt/ASTROJACKER/commit/1d325a48efa07446f21d4dd160602d2ed25e013f)
2026-10-09 - Premium editorial streetwear look
Tool: GitHub Copilot
What I asked for: "Give me a more premium editorial streetwear look"
What it gave back: A darker palette, glow accents, card shadows and hover states.
What I kept, what I changed, and why: I kept the darker mood and hover states, and toned down the red accents so they mark prices, stock flags and active filters without competing with the content. [CONFIRM]
Commit: [https://github.com/YOUR-USERNAME/ASTROJACK/commit/d56c96b](https://github.com/Icentt/ASTROJACKER/commit/1d325a48efa07446f21d4dd160602d2ed25e013f)
2026-10-09 - Structure and styling review
Tool: GitHub Copilot
What I asked for: "Review the current storefront structure and styling and tell me what to improve"
What it gave back: A critique of visual hierarchy, spacing, contrast and card proportions.
What I kept, what I changed, and why: I acted on the hero emphasis and product grid points because they were the weakest parts, and ignored the rest to avoid cosmetic churn. [CONFIRM]
Commit: https://github.com/YOUR-USERNAME/ASTROJACK/commit/d56c96b
2026-10-09 - Debugging how to open the page
Tool: GitHub Copilot
What I asked for: "Open the site in the browser and debug the launch issue"
What it gave back: A shell command to launch the page, then advice to open the file directly.
What I kept, what I changed, and why: The command failed (see Section 2, Case 1), so I kept only the advice and opened index.html by hand. The app has no build step, so this is enough.
Commit: [https://github.com/YOUR-USERNAME/ASTROJACK/commit/d56c96b](https://github.com/Icentt/ASTROJACKER/commit/1d325a48efa07446f21d4dd160602d2ed25e013f)
2026-10-09 - Syntax check after the styling pass
Tool: GitHub Copilot
What I asked for: "Check whether the JavaScript still parses after the styling changes"
What it gave back: Run node --check script.js.
What I kept, what I changed, and why: I ran it and it passed, and I recorded the command in .github/copilot-instructions.md so it is repeatable. It only checks syntax, so I also clicked through the customer and admin flows. [[CONFIRM you did this]](https://github.com/Icentt/ASTROJACKER/commit/1d325a48efa07446f21d4dd160602d2ed25e013f)
Commit: [https://github.com/YOUR-USERNAME/ASTROJACK/commit/d56c96b](https://github.com/Icentt/ASTROJACKER/commit/1d325a48efa07446f21d4dd160602d2ed25e013f)
YYYY-MM-DD - [CONFIRM: add a real seventh entry only if it happened]
Tool:
What I asked for:
What it gave back:
What I kept, what I changed, and why:
Commit: https://github.com/YOUR-USERNAME/ASTROJACK/commit/SHA
2. Where the AI got it wrong

Three cases. Be specific. If you write that the AI was never wrong, this section scores zero.

Case 1 - Launch command that did not work
What it gave me: A PowerShell command to open the page in the browser.
What was wrong with it: It failed in my environment, so following it blindly would have left me unable to test.
What I did instead: Opened index.html directly in the browser and checked that it rendered.
Commit: [https://github.com/YOUR-USERNAME/ASTROJACK/commit/d56c96b](https://github.com/Icentt/ASTROJACKER/commit/1d325a48efa07446f21d4dd160602d2ed25e013f)
Case 2 - [CONFIRM: pick a real mistake and rename this]

Candidates that exist in script.js (use one only if the AI really produced it): order.id, item.size and product.image are put into template strings without escapeHtml (and item.size also goes inside data-size="..."); the Admin page has no login; checkout copies every form field into the order with ...values.

What it gave me:
What was wrong with it:
What I did instead: (best: fix it yourself in a new commit and link that commit)
Commit: [https://github.com/YOUR-USERNAME/ASTROJACK/commit/SHA](https://github.com/Icentt/ASTROJACKER/commit/1d325a48efa07446f21d4dd160602d2ed25e013f)
Case 3 - [CONFIRM: pick a second real mistake and rename this]

Candidates: order IDs built from the last 7 digits of Date.now() can collide; stock is one number per product shared across sizes, so one size can oversell; in the quantity action item?.quantity + delta is NaN if the line is missing.

What it gave me:
What was wrong with it:
What I did instead:
Commit: [https://github.com/YOUR-USERNAME/ASTROJACK/commit/SHA](https://github.com/Icentt/ASTROJACKER/commit/1d325a48efa07446f21d4dd160602d2ed25e013f)
3. Who wrote what

At least a fifth of this project is code you wrote yourself. Name it, and explain it in your own words.

Group projects: give each member their own heading below, and use your GitHub handle as the heading. You are graded on your own section.

Written by me

[CONFIRM: keep an item only if you wrote it and can explain it without looking. Rewrite in your own words.]

File: script.js (checkout branch of the submit listener)
Commit: d56c96b
What it does and why it is built this way: It does not trust the bag. Before placing an order it goes through every line and totals the quantity requested for that product across all sizes, then compares it to current stock. If any product is short it stops and shows a toast; only after every line passes does it subtract stock and create the order. I total across sizes because one product has one stock count shared by its sizes. I check again at checkout, not only when adding, because stock can change in between.
File: script.js (add-cart and quantity actions)
Commit: d56c96b
What it does and why it is built this way: Adding sums what is already in the bag for that product across sizes and refuses to exceed stock; the same product and size increases quantity instead of adding a duplicate row. The quantity buttons count the other sizes (otherSizes) and allow a change only if next + otherSizes <= stock. Going to zero removes the line.
File: script.js (shopContent filtering and search)
Commit: d56c96b
What it does and why it is built this way: visible keeps a product only if it matches the category chip, the type dropdown and the search text. Search lowercases both sides and matches name, type and category together. Type options come from new Set(...) of the product types, so a new type adds a filter without editing HTML.
File: script.js (accountPage order lookup)
Commit: d56c96b
What it does and why it is built this way: Orders show only after an email is entered, compared lowercased so case does not matter, with a "No orders found" state. It is a demo lookup, not a login, and only works in the same browser.
File: script.js (load / save)
Commit: d56c96b
What it does and why it is built this way: load reads JSON from localStorage and falls back to seed data if the key is missing or the JSON is broken (the try/catch), so a bad stored value cannot stop the page starting. save writes products, cart and orders after every change.
File: script.js (admin stock-form and data-order-status handling)
Commit: d56c96b
What it does and why it is built this way: Stock and threshold are clamped with Math.max(0, Number(...)) so negatives cannot be saved. Status changes find the order by id and update only that order. Low stock is stock <= threshold.
File: script.js (render and the click / change / submit listeners on #app)
Commit: d56c96b
What it does and why it is built this way: render picks a page function from a lookup object and rewrites the app, so each screen is a function of state. One listener per event type sits on #app and uses closest('[data-...]') to find what was pressed, so it keeps working after every re-render, which would drop per-button handlers.
