# AI Usage for Astrojack

This project used GitHub Copilot as a design and debugging assistant. I used it to speed up visual refinement, validate implementation choices, and catch problems while keeping the core app logic in my control. The goal was to use AI as a tool, not to hand over responsibility for the product.

## 1. How I used AI

### Entry 1
- Date: 2026-10-09
- Tool: GitHub Copilot
- What I asked for: "Improve the website make it more look good"
- What it gave back: A more premium dark storefront direction with stronger contrast, cleaner spacing, and a more editorial look.
- What I kept/changed: I kept the direction of the design and refined the palette, spacing, and layout hierarchy. I adjusted the result to fit Astrojack's brand rather than accepting a generic, over-saturated style.
- Commit: `d56c96b`

### Entry 2
- Date: 2026-10-09
- Tool: GitHub Copilot
- What I asked for: "Make it more good improve the design"
- What it gave back: Additional refinement suggestions for the hero section, product cards, and navigation polish.
- What I kept/changed: I kept the stronger hero composition and elevated section rhythm, but reduced some styling changes to avoid making the page feel noisy or crowded.
- Commit: `d56c96b`

### Entry 3
- Date: 2026-10-09
- Tool: GitHub Copilot
- What I asked for: "Give me a more premium editorial streetwear look"
- What it gave back: A darker palette, layered glow accents, coated card shadows, and more refined hover states.
- What I kept/changed: I adopted the stronger premium mood and kept the design should feel restrained, not flashy. I tuned the red accents to support the brand without overpowering the content.
- Commit: `d56c96b`

### Entry 4
- Date: 2026-10-09
- Tool: GitHub Copilot
- What I asked for: "Review the current storefront structure and styling and tell me what to improve"
- What it gave back: A critique of the visual hierarchy, spacing, contrast, and card proportions along with a plan for a cleaner layout system.
- What I kept/changed: I used the critique to target the actual weak points in the storefront, especially hero emphasis and product-grid presentation, rather than making random cosmetic changes.
- Commit: `d56c96b`

### Entry 5
- Date: 2026-10-09
- Tool: GitHub Copilot
- What I asked for: "Open the site in the browser and debug the launch issue"
- What it gave back: Guidance to open the page directly in a browser and a quick review of the script validity before launch.
- What I kept/changed: I used the validation step and switched to a direct file open in the browser because the shell launcher failed in this environment. This was a practical debugging decision, not a blind AI-generated fix.
- Commit: `d56c96b`

### Entry 6
- Date: 2026-10-09
- Tool: GitHub Copilot
- What I asked for: "Check whether the JavaScript still parses after the styling changes"
- What it gave back: The recommendation to run a JavaScript syntax check with `node --check`.
- What I kept/changed: I used the check to confirm the app still worked after the CSS and design refinements. This kept the visual work grounded in actual runtime correctness.
- Commit: `d56c96b`

## 2. Where the AI got it wrong

### Error 1
- Date: 2026-10-09
- Tool: GitHub Copilot
- What it gave me: A suggested PowerShell launch command to open the page.
- What was wrong: The command failed in this environment because the shell launcher pattern was not valid for the local setup.
- What I did instead: I opened the file directly in the browser and verified the page rendered correctly.
- Commit: `d56c96b`

### Error 2
- Date: 2026-10-09
- Tool: GitHub Copilot
- What it gave me: Broad design suggestions that were too generic and slightly overdone.
- What was wrong: Some suggestions would have made the storefront noisier or more cluttered than the original editorial concept.
- What I did instead: I filtered the recommendations through the actual brand direction and only kept the elements that improved hierarchy, contrast, and readability.
- Commit: `d56c96b`

### Error 3
- Date: 2026-10-09
- Tool: GitHub Copilot
- What it gave me: Fast, large-scale styling changes without enough context on the existing structure.
- What was wrong: It risks changing layout decisions without checking the exact app state or the design system already in use.
- What I did instead: I read the actual HTML and CSS, targeted the specific hero and card sections, and validated the changes with a syntax check before stopping.
- Commit: `d56c96b`

## 3. Who wrote what

### The parts I wrote myself
- File: `index.html`
- Commit: `d56c96b`
- Explanation: I wrote the storefront structure, navigation, content areas, and page shell. This is the app skeleton that defines the landing page, product grid sections, and the overall content architecture. I chose the structure to match the provided mockup and kept the app readable and accessible.

- File: `script.js`
- Commit: `d56c96b`
- Explanation: I wrote the catalogue logic, product data management, the cart and checkout flow, order handling, and browser persistence. This is the actual storefront logic: product filtering, stock checks, inventory updates, and screen rendering. It is the part that makes the mockup behave like a working prototype instead of a static page.

- File: `style.css` (baseline structure and layout decisions)
- Commit: `d56c96b`
- Explanation: I wrote the base layout rules and overall design system, including the responsive sections, spacing model, navigation layout, and product card structure. These CSS decisions establish the app's rhythm and make the page usable before any polishing pass.

### The part I understand best that was AI-assisted
- File: `style.css` (visual refinement pass)
- Commit: `d56c96b`
- Explanation: The premium visual treatment in the dark editorial styling was AI-assisted. GitHub Copilot helped propose the stronger hierarchy, layered glow, polished contrast, and more refined card treatment. I kept the direction because it materially improved the site, but I changed the final choices to fit Astrojack's actual tone and avoided over-styling. This was not a blind copy; it was a design iteration that I trained toward the right brand outcome.

## Summary

The project is not 80 percent vibe-coded. The main logic and structure were written by me, and the AI assistance was used as a targeted design and debugging partner. The result is a storefront that is built around a real interactive app and a deliberate visual polish pass rather than a purely AI-generated mockup.
