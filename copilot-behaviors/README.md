# Copilot Behaviors

A short, clickable flow demo of four core Copilot interaction states:

1. **Opening Copilot** — entry point in the product + the panel sliding in.
2. **Opening an artifact** — a generated draft opening into its own viewer.
3. **Approving a plan** — a proposed plan card, approval, and live progress.
4. **Changing a plan** — the same plan being revised after user feedback.

Sibling prototype to [`copilot-ui-patterns`](../copilot-ui-patterns/): that one is a static pattern library, this one shows the patterns *in motion*.

**[View live →](https://ines-parreira.github.io/prototypes/copilot-behaviors/)**

---

## How to run

It's a single self-contained HTML file. You have two options:

**Option 1 — open directly**
Double-click `index.html` in Finder. It will open in your default browser.

**Option 2 — serve locally (recommended for smooth reload)**
```bash
cd copilot-behaviors
python3 -m http.server 8000
# then open http://localhost:8000
```

No build step, no dependencies. Pure HTML + CSS + vanilla JS.

---

## What's in the file

Everything lives in `index.html`. The main pieces:

| Section | What it is |
|---|---|
| `<header class="stepper">` | Top bar with the four numbered steps + Prev/Next nav |
| `<div class="product">` | Mock helpdesk page used as a backdrop so Copilot has context to open into |
| `<aside class="copilot">` | The sliding Copilot panel (Gaia intro, messages, composer) |
| `<aside class="artifact">` | The artifact viewer that expands from the copilot panel |
| `.plan-card` | Reusable plan component with todo states (done / working / queued / removed) |
| `renderStep1…4()` | Each step renders the relevant copilot content + transitions |
| `revisePlan()` | Drives the step-4 plan change: dims the old plan, adds an AI ack, reveals the revised plan |

The design tokens (`--bg`, `--surface`, `--accent`, etc.) match the `copilot-ui-patterns` prototype so the two feel like the same family. Light/dark theme toggle lives in the stepper.

---

## Demo script

For a 60-second walkthrough:

1. Start on step 1. The "Ask Copilot" button pulses. Click it — the panel slides in.
2. Step 2 loads automatically. Click the **Shipping policy draft** card to open the artifact.
3. Click **Step 3** in the stepper. Review the plan, click **Approve & run**, watch it execute.
4. Click **Step 4**. Click **"Skip the deploy step"** (or type in the composer). The revised plan appears with a "Revised" badge.

Use **Prev / Next** to move through the flow, or click any step number to jump.
