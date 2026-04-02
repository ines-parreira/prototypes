---
name: editor-qa
description: Reads the Notion spec doc for the Guidance/Ticket editor, runs a manual browser QA session against flywheel-test.gorgias.com using the Chrome extension, and produces a structured test report. Use when asked to "QA the editor", "run editor tests", "test the guidance editor", or "test the ticket editor".
---

# Editor QA Skill

Runs manual browser tests for the Guidance Editor (Knowledge Hub) and the Ticket Reply Editor against the flywheel-test environment, using the latest spec from Notion.

## Reference URLs

- **Spec doc:** `https://www.notion.so/gorgias/Guidance-Editor-Behaviour-Spec-Browser-Test-Checklist-3101ae2178f580af89caf3d215e57e2e`
- **Guidance editor:** `https://flywheel-test.gorgias.com/app/ai-agent/shopify/ahmed-test-store-1/knowledge/sources`
- **Ticket editor:** `https://flywheel-test.gorgias.com/app/ticket/45330074`

---

## Testing Philosophy

**The goal is to mimic real user behaviour.** A user sees the screen — they don't inspect the DOM. Test what the user experiences, not what the code produces internally.

### Observation hierarchy

1. **Screenshots (primary)** — Take a screenshot after every user action. This is the ground truth. If bold formatting looks wrong on screen, that is the bug, regardless of what the DOM says.
2. **Zoomed screenshot crops (secondary)** — Use `computer` with a zoom region when inspecting small UI details: toolbar button active states, cursor position, rendered token appearance.
3. **`javascript_tool` (fallback only)** — Use JS inspection only when a screenshot is genuinely ambiguous and the question cannot be answered visually. Always document why JS was needed instead of a screenshot.

### When JS inspection is appropriate

| Situation | Why screenshot is not enough | JS assertion |
|-----------|------------------------------|--------------|
| Raw `&&&` strings hidden inside a rendered token | The token visually looks correct but raw text may still be in the DOM | Search `innerHTML` for `/&&&[^&]+&&&/g` |
| Focus location after keyboard actions | Screenshot cannot show which element has focus | `document.activeElement` / `ed.contains(document.activeElement)` |
| Draft.js list block type | `<ol>`/`<ul>` may not be present; class names on divs encode the type | Check `innerHTML` for `ordered-list-item` / `unordered-list-item` |
| Toolbar button active state | Active state may not produce a visible colour difference at screenshot resolution | Check for `isActive` class on the button element (see Toolbar active state section) |

### When to use screenshots only

For everything else — text content, visible formatting (bold, italic, underline text weight/style), heading sizes, variable token shape, link appearance, editor layout, send behaviour, and character order — screenshots are sufficient and preferred.

---

## Workflow

### Phase 1 — Load Chrome tools and get browser context

Always load Chrome tools before use:

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__get_screenshot,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__shortcuts_execute,mcp__claude-in-chrome__find,mcp__claude-in-chrome__form_input,mcp__claude-in-chrome__tabs_create_mcp
```

Then call `tabs_context_mcp` to see existing tabs. If flywheel-test tabs are not open, create them with `tabs_create_mcp`.

If Chrome shows "not connected", ask the user to open Chrome and click Connect in the extension popup, then retry `tabs_context_mcp`.

### Phase 2 — Fetch the latest spec from Notion

Navigate the Notion tab to the spec URL and use `get_page_text` to extract all test cases. Parse out each TC number, description, steps, and expected result. This is the source of truth — do NOT rely on hardcoded TC lists.

Key things to extract per TC:
- TC number and title
- Steps to reproduce
- Expected outcome
- Related issue/ticket number if present (e.g. COACH-2217)

### Phase 3 — Run Guidance Editor tests

Navigate to the guidance editor URL. Open an existing guidance entry or create one.

#### Standard test loop per TC

For each TC:
1. Perform the user action (type, click, keyboard shortcut)
2. Take a screenshot immediately after
3. If the screenshot clearly shows pass or fail, record the result
4. If the screenshot is ambiguous (see table above), use a targeted JS assertion as a tiebreaker
5. Move to the next TC

#### User action tools

- **Typing text:** `form_input` targeting the contenteditable editor, or `shortcuts_execute` for individual keys
- **Keyboard shortcuts:** `shortcuts_execute`
  - Bold: `cmd+b` | Italic: `cmd+i` | Underline: `cmd+u`
  - Undo: `cmd+z` | Redo: `cmd+shift+z` | Select all: `cmd+a`
  - Send (ticket editor): `cmd+enter`
- **Clicking:** `find` to locate element, then click
- **Selecting text:** `shortcuts_execute` with `shift+left`, `shift+right`, etc.

#### Auto-block markdown triggers

The trailing space that triggers auto-block conversion (e.g. `# `, `## `, `1. `, `- `) must be dispatched as a keyboard event, not via DOM `insertText`. The editor's `keyBindingFn` only fires on `keydown`.

Use `shortcuts_execute` with the `space` key after typing the prefix characters, rather than including the space in a `form_input` call.

#### Tab key behaviour

- Tab INSIDE a list: should indent the list item and keep focus in editor — PASS
- Tab in a plain text block: currently moves DOM focus OUT of the editor and may collapse the guidance panel — known bug, confirm it still reproduces and record as FAIL

#### Variable insertion

Use the `(+) Variables` toolbar button to open the variable picker. Do NOT click a category label — it may dismiss the picker. Click directly on a variable name.

#### Link insertion

Use the link toolbar button. Enter a URL. After inserting, hover the link and screenshot the popover.

For TCs that test Cmd+K with pre-selected text: select text first, then press `cmd+k` and check if the modal opens with anchor text prefilled.

For TCs that test the link popover Edit/Remove buttons: after inserting a link, hover it and check whether Edit/Remove buttons appear and remain visible without navigating away (known issue COACH-2181).

Execute whichever of these steps the TC in the spec actually describes — do NOT assume a TC number maps to a specific link behaviour.

#### Toolbar active state

Toolbar buttons (Bold, Italic, Underline, Heading 1/2/3, Bullet List, Ordered List) apply an
`isActive` CSS class when the current selection has that formatting active. Use JS to check this
class — visual difference at screenshot resolution is not reliable for this check.

**Procedure:**
1. Select some text in the editor
2. Apply formatting (e.g. Cmd+B for bold)
3. Use `javascript_tool` to check for the `isActive` class on the Bold/Italic/Underline buttons:
   ```js
   const allButtons = Array.from(document.querySelectorAll('button'));
   const toolbarBtns = allButtons.filter(b => ['format_bold','format_italic','format_underline'].includes(b.textContent.trim()));
   toolbarBtns.map(b => ({ text: b.textContent.trim(), hasIsActive: Array.from(b.classList).some(c => c.includes('isActive')) }))
   ```
   Note: the class is CSS-module namespaced (`Button--isActive--LFcRr`), so use `some(c => c.includes('isActive'))` — `classList.contains('isActive')` will NOT match.
4. PASS: the active button has `isActive` in its class list; inactive neighbours do not
5. FAIL: the button has no `isActive` class after formatting is applied

### Phase 4 — Run Ticket Editor tests

Navigate to the ticket editor URL.

**Note:** `javascript_tool` returns `[BLOCKED: Cookie/query string data]` on ticket pages. Screenshots are the only observation method here — which is fine, as this matches real user observation.

All ticket editor TCs are verified visually via screenshots. Follow the exact steps in the spec for each TC — do not assume which TC number covers which behaviour.

**Common patterns you will encounter (match to the TC description in the spec):**

- *Basic typing* — characters appear in correct order on screen
- *Cmd+Enter send* — reply sent, editor clears, focus restored
- *Type after send without clicking* — characters appear in correct order
- *Keyboard shortcut after send without clicking* — formatting (e.g. bold) applied correctly

For any TC that tests behaviour after Cmd+Enter send, this sequence applies:
1. Type a message, send with `cmd+enter`
2. Without clicking anywhere, immediately perform the action described in the TC (type text, apply a shortcut, etc.)
3. Screenshot and zoom in to confirm the expected result

### Phase 5 — Produce the QA report

Output a structured markdown report after all tests:

```markdown
## QA Test Report — Guidance Editor & Ticket Reply Editor

**Branch:** <current git branch>
**Environment:** flywheel-test.gorgias.com
**Spec version:** <Notion doc last-edited date if visible>
**Date:** <today>

### Summary

| Result | Count |
|--------|-------|
| PASS   | N     |
| FAIL   | N     |
| PARTIAL| N     |
| SKIPPED| N     |

### Guidance Editor

| TC | Description | Result | Notes |
|----|-------------|--------|-------|
| TC-01 | ... | PASS/FAIL/SKIP | ... |
...

### Ticket Reply Editor

| TC | Description | Result | Notes |
|----|-------------|--------|-------|
| TC-41 | ... | PASS/FAIL/SKIP | ... |
...

### Bug Findings

For each FAIL:
- **TC-XX — Title (Severity: High/Medium/Low)**
- Steps, Expected, Actual, Likely cause

### Regressions

List any TC that was previously PASS but is now FAIL, or vice versa.

### Not Tested

List TC numbers skipped and brief reason.
```

---

## Known Constraints

| Constraint | Workaround |
|------------|------------|
| `javascript_tool` blocked on ticket pages | Screenshots only — consistent with real user observation |
| Variable picker dismissed by category click | Use `(+) Variables` toolbar button; click variable name directly |
| Tab key in plain text exits editor | Confirm the bug reproduces, record as FAIL for relevant TC |
| Auto-block space must use `keydown` | Use `shortcuts_execute` for the trailing space, not `form_input` |
| Draft.js lists render as divs, not `<ol>`/`<ul>` | Zoom screenshot; if still ambiguous, use JS regex on `innerHTML` as fallback |

## Known Bugs (pre-existing, confirm if still present)

- **COACH-416**: Toolbar Bold/Italic/Underline buttons don't show active state after applying formatting — verify with JS `isActive` class check; if the button has no `isActive` class after formatting is applied, record as FAIL
- **COACH-2181**: Link Edit/Remove popover buttons navigate away instead of staying in popover
- **COACH-2133**: Cursor glitch on fast typing in empty guidance
- **COACH-2230**: Shift+Enter in a list creates a new list item instead of a soft line break
- **COACH-2006**: Pasting into a list item strips the bullet formatting
- **COACH-2200**: Variable tokens may render as raw `&&&...&&&` text during typing or after auto-save

## Tips for Reliability

- Take a screenshot after EVERY user action — this is your primary evidence
- Zoom into specific regions (toolbar, editor content area) when the full screenshot is too small to read
- Reset editor state between TCs: select all (`cmd+a`), delete, or navigate away and back
- If the browser extension loses connection, call `tabs_context_mcp` again to refresh tab IDs
- Only reach for JS inspection when a screenshot genuinely cannot answer the question — and note it in the TC result
