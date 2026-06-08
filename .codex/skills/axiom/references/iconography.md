---
name: Iconography
audience: AI agents using Axiom icons inside Button, IconBox, Menu, Tab, list rows, form-field adornments
purpose: Avoid silent Material-Icons fallback (rendered as empty space or wrong glyph) — every icon name must be canonical
canonical_source: packages/axiom/src/Icon/icons.ts on default branch
total_icons: 439 (327 outlined, 25 multicolor, 16 mono-filled, ~71 unknown style)
---

# Iconography

The single failure mode you must prevent: a string passed to `leadingSlot` / `trailingSlot` / `icon` / `name` that **looks** like an icon name (Material/Lucide style) but isn't in our catalog. The component will silently fall through to the Material Icons font fallback — either rendering a different icon or empty space with phantom padding. **The visual bug is invisible in code review.**

## Three styles, three contracts

| Style | Inherits text color? | Use for |
|---|---|---|
| **Outlined** | ✅ via `currentColor` | All UI affordances — buttons, list rows, menu items, form-field adornments, navigation |
| **Multicolor** | ❌ fixed palette | App/integration logos (Shopify, Magento, Recharge…) |
| **Mono-filled** | ❌ native brand color | Channel logos (WhatsApp, Instagram, Aircall, X…) |

**Default** = outlined. Reach for multicolor/mono-filled only when you specifically need a brand logo.

## Which style — decision rule

| Context | Style | Example name |
|---|---|---|
| Generic UI affordance (button, menu item, list row, form-field adornment, status indicator) | **Outlined** (default) | `add-plus`, `close`, `search-magnifying-glass`, `edit-pencil`, `arrow-chevron-down`, `info`, `check` |
| Integration / app logo in a card, list, or settings detail | **Multicolor** | `app-shopify`, `app-magento`, `app-recharge` |
| Channel logo as a status indicator next to a ticket/conversation | **Mono-filled** | `channel-whatsapp`, `channel-instagram`, `channel-aircall` |
| Brand mark adjacent to outlined icons in the same row | Wrap the brand in `<IconBox>` | e.g. an integration row with `<IconBox><Icon name="app-shopify" /></IconBox>` next to an outlined `edit-pencil` |
| Decorative illustration in an empty state or onboarding card | Neither — use an `Illustration/*` token via `<Image>` | n/a |

### Why these rules

- Outlined icons inherit `currentColor`, so they sit visually inside text-style hierarchy (a button's icon picks up the button's foreground color). Mixing multicolor or mono-filled into the same row breaks that hierarchy — the brand mark dominates and reads as "this is a screenshot of an integration", not "this is native UI".
- Multicolor and mono-filled are reserved for brand identity moments: showing *which* app/channel/integration this is. They are the answer to "which platform?", not "what action?".
- When you must put a brand mark next to outlined icons (an integration row that also has an edit button), the `<IconBox>` wrapper gives the brand a tinted surface that harmonizes its visual weight with the outlined icons around it. Without the wrapper the brand mark looks pasted in.

## Sizing

Default render = 16px. Acceptable = 12, 16, 20, 24. Outlined stays crisp at all sizes (`vector-effect="non-scaling-stroke"`).

## Naming traps — top 8

These are the most common wrong-name attempts. Memorize them. Verified against `icons.ts` (live catalog) on 2026-05-19.

| Want | Use | NOT |
|---|---|---|
| Plus | `add-plus` | `plus`, `add` |
| X / close | `close` | `x`, `xmark`, `cancel` |
| Search | `magnifying-glass` | `search`, `search-magnifying-glass`, `magnifier` |
| Edit | `edit-pencil` | `edit`, `pencil` |
| Delete | `trash-empty` (no `trash-full` exists) | `trash`, `delete`, `bin`, `trash-full` |
| Chevron down | `arrow-chevron-down` | `chevron-down`, `caret-down`, `down` |
| Kebab horizontal | `dots-meatballs-horizontal` | `more-horizontal`, `dots`, `kebab`, `meatball`, `ellipsis` |
| Kebab vertical | `dots-kebab-vertical` | `more-vertical`, `dots-vertical`, `kebab-vertical` |
| Info | `info` | `info-circle`, `help` (only `help-circle` has the suffix) |

## Validation rule (mandatory before declaring done)

For every `<Component leadingSlot="...">`, `<Component trailingSlot="...">`, `<Icon name="...">` you write:

1. The string must appear **verbatim** in `packages/axiom/src/Icon/icons.ts`
2. If unsure, grep the file: `grep '"<your-name>"' packages/axiom/src/Icon/icons.ts`
3. Empty grep result = the icon does NOT exist = the build will silently fall through to Material Icons

## Color rules

- ✅ Outlined icons inherit color via `currentColor`. Set the parent text color and the icon follows.
- ❌ Don't try to recolor multicolor or mono-filled via CSS `color`/`fill` — they ignore the cascade.
- ❌ Don't mix outlined and multicolor in the same row, list, or button group — the weight clash makes it look like an integration screenshot, not native UI. If you must put a brand logo next to outlined icons (e.g. "Connect Shopify"), wrap the logo in a tinted square surface to harmonize visual weight.
- ❌ Never use a custom SVG alongside Axiom icons in the same component.

## Catalog navigation

The full 439-name catalog lives at `packages/axiom/src/Icon/icons.ts` — the canonical, always-current source. Don't memorize — grep the file when needed. Categories the catalog spans: Actions, General, AI, Apps, Arrows, Status, Channels.

Common categories agents hit:
- **Actions** (13): `add-plus`, `close`, `copy`, `download`, `edit-pencil`, `redo`, `sort-ascending`, `sort-descending`, `trash-empty`, `undo`, `send`
- **Status** (31): `check`, `info`, `error-octagon`, `warning-triangle`, `help-circle`
- **Arrows** (46): full `arrow-chevron-*` (4 directions, duo + single) and `arrow-{up,down,left,right}` + diagonals
- **AI** (7): `ai`, `ai-agent-feedback`, `ai-alt-1`, `ai-skill`, `ai-search`, `ai-ticket-summary`
- **Apps** (20): `app-shopify`, `app-magento`, `app-recharge`, …
- **Channels** (17): `channel-whatsapp`, `channel-instagram`, `channel-facebook`, `channel-google`, `channel-aircall`, …

## When grep returns nothing

The icon does not exist. Two options:
1. Find a related canonical name (search by substring: `grep -i 'mail' icons.ts`)
2. Tell the user the icon isn't in the catalog and ask them to use a different concept. Do NOT improvise.
