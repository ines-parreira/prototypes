# Prototypes

Interactive explorations and UI pattern studies by Inês Parreira.

**[View live →](https://ines-parreira.github.io/prototypes/)**

---

## Copilot UI Patterns

A collection of UI patterns for AI copilot interfaces that flex with user intent, collaborate, anticipate, and adapt.

**[View prototype →](https://ines-parreira.github.io/prototypes/copilot-ui-patterns/)**

Patterns included:

- **Input** — Ask anything (default & in-progress states), smart suggestions
- **Progress** — Reasoning, thinking (simple, comprehensive, completed), execution steps
- **Artifacts** — Source viewer, diff viewer, charts
- **Confirmation** — Plan approval with action items

Features dark and light theme support.

---

## Adding a new prototype

1. Create a folder inside `copilot-ui-patterns/` (or a new sibling folder for a different project)
2. Add your `index.html` (self-contained, single-file prototypes work best)
3. Add a new card to the root `index.html` following the existing pattern
4. Commit and push — GitHub Pages will deploy automatically

## Setup

This repo is designed to be served via [GitHub Pages](https://pages.github.com/). To enable it:

1. Go to **Settings → Pages** in your repo
2. Set source to **Deploy from a branch**
3. Select the **main** branch and **/ (root)** folder
4. Your site will be live at `https://ines-parreira.github.io/prototypes/`
