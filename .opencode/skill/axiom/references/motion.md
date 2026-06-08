---
name: Motion
audience: AI agents composing animations and transitions in Gorgias UI
purpose: Resolve "which timing function + duration" to a single named curve in one read
status: Motion tokens are NOT yet shipped in @gorgias/axiom. This is the target design spec; until tokens land, follow the "Usage in code" section.
---

# Motion

> ⚠️ **There are no motion tokens in `@gorgias/axiom` yet.** There is no
> `motionTokens` export and no `--motion-*` CSS variable. The named curves below
> are the **design target**, not a shippable API — do not `import { motionTokens }`
> or reference `var(--motion-layout)`; neither exists. See "Usage in code" for what
> to actually write today.

Two curves cover everything. Every transition maps to one of these.

## Curves (design target)

| Name | Bezier curve | Duration | When |
|---|---|---|---|
| layout | `cubic-bezier(0.6, 0, 0, 1)` | 800ms | Page-level structural shifts: panel slide-in, drawer open, accordion expand, route transitions, modal mount |
| micro | `cubic-bezier(0.9, 0, 0, 1)` | 250–300ms | Component-level state change: button press lift, dropdown open, checkbox toggle, tab switch, tooltip in/out |
| micro-alt | `cubic-bezier(0.9, 0, 0.6, 1)` | 300ms | Alternate micro for symmetric in/out — softer end-of-motion (e.g. tooltip/popover dismiss) |

**Only `micro` is currently realized in the codebase** — components hardcode
`cubic-bezier(0.9, 0, 0, 1)` at 250–300ms (often via a local `--animation-timing-fn`
CSS var in their `.module.less`). The `layout` and `micro-alt` curves are not yet used anywhere.

## Decision rule (single line)

> If it changes the **page shape** → layout curve. If it changes a **single component's state** → micro. If the dismiss should feel softer than the open → micro-alt for the closing direction.

## Usage in code

1. **Prefer not to hand-roll motion at all.** Where a component already animates
   (Modal, SidePanel, Toast, Disclosure, Tooltip, Tabs), it owns its motion contract —
   do NOT override its timings.
2. **When you must add a transition,** match the existing micro curve verbatim so new
   motion is consistent with the library. Don't introduce new curves or durations.

```css
/* micro — matches what components already use */
.button-press { transition: background-color 300ms cubic-bezier(0.9, 0, 0, 1); }
```

There is intentionally no token reference here because the token doesn't exist yet.
When motion tokens ship, this section will switch to `var(--motion-*)`.

## Hard rules

- ❌ No `transition: all 0.3s ease` — `ease` is not the system curve; use `cubic-bezier(0.9, 0, 0, 1)`
- ❌ Never animate `width`/`height` directly — use `transform: scale` or animate the wrapper's max-width
- ❌ No motion longer than 800ms — anything longer is either a loader (use `<Loader>`) or a flow (route change)
- ✅ Animate `transform` and `opacity`; everything else is suspect
- ✅ Respect `prefers-reduced-motion` — each component that animates guards its transition with `@media (prefers-reduced-motion: reduce)` in its own `.module.less` (e.g. Disclosure, ScrollFollowButton, AnimatedChevronIcon). There is no global handler — if you add motion, add the guard too.

## Anti-patterns

- A button hover that takes 500ms (use the micro curve at ~300ms; 150ms is fine for hovers if the spec calls it out)
- A modal that takes 300ms to slide in (modals are structural — use the layout curve, 800ms)
- Different bezier curves on enter vs leave of the same surface (use micro for both, or micro + micro-alt)
