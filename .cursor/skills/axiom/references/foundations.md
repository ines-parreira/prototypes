---
name: Foundations
audience: AI agents composing Gorgias UI
purpose: Resolve every visual decision (color, type, spacing, elevation, shape, mode) to a token before writing JSX
---

# Foundations

The seven systems that bind Axiom. Each section answers one question: *given an intent, which token?*

## Brand voice → visual choices

| Intent | Visual move |
|---|---|
| "Help an experienced agent move faster on their 200th ticket" | Density > whitespace; type weight > color; structured rhythm |
| Neutral and information-dense | Brand purple is **chirurgical** — selected/checked/links/focus/AI only |
| Three surfaces, one system | Helpdesk (light default), AI Agent (gradients allowed), Statistics (dataviz palette) |

Reference: Linear, Notion. **Not** Mailchimp, Material You.

## Color — semantic categories only

Colors are organized by **role**, never by hue. Never use hex. Always `var(--token-name)` or component-bound props (`Card elevation="default"`, `Dot color="content-success-default"`). Note: a few components (`Tag`, `StatusButton`, `Quantity`) take a fixed hue name on `color` (`green`, `red`, `blue`…), not a role token — map the role to its hue (success → `green`, error → `red`).

| Category | Use | Examples |
|---|---|---|
| `content-*` | Text, icons, glyphs | `content-neutral-default`, `content-neutral-secondary`, `content-error-primary`, `content-additional-{blue,fuchsia,purple,teal,yellow}` |
| `surface-*` | Flat fills for tags, banners, AI gradients (NOT page bg) | `surface-accent-primary` (the only purple), `surface-neutral-default`, `surface-error-default`, `ai-gradient-component` |
| `border-*` | Separators, outlines, focus rings | `border-neutral-default`, `border-error-primary`, `focus` |
| `elevation-*` | Page bg + depth tiers (4 layers) | `bg` → `default` (card) → `mid` (popover) → `high` (modal/toast) |
| `hover-*` / `pressed-*` / `focus` | Interaction overlays — always layered on top, never replacement |
| `static-*` | Do NOT flip in dark mode (status dots, dataviz heat) |
| `*-inverted-*` | Content on dark surfaces (tooltip, toast) |

### Default → primary suffix rule

For `surface-*`:
- `*-default` → soft tinted background, suited to tag pills + banners
- `*-primary` → saturated/solid, suited to icon-only badges + active/selected states

### Accent purple — single source, chirurgical

`surface-accent-primary` is the **only** purple. Allowed for:
- Primary buttons, primary actions
- Selected/checked state
- Inline links
- Focus rings
- AI surfaces (also `ai-gradient-component`)

Never invent purples. Never use accent for decoration.

**Hard counter rule**: in a complete page, **no more than 3 distinct elements should use accent-* tokens or accent-prop components** (`<Button intent="ai">`, surfaces using `surface-accent-*`, accent-bordered Cards). A Gorgias page is ~92% neutral; accent is the chirurgical exception that draws the eye to *the one thing that matters*. If you count more than 3 accent uses in your output, you've diluted the signal — pull back. The most common over-use: applying accent to every step of a multi-step process. Instead use neutral + one accent on the active step.

### Accessibility floor

WCAG AA on every content/surface pair. Brand purple on white meets AA at 16px+; below that → fall back to `content-neutral-default`.

## Typography — Inter only

Single font family. OpenType variants `'cv11'` + `'ss03'` for tabular numbers (tables, dashboards).

### Hierarchy

| Token | px | Use |
|---|---|---|
| `heading-xl` | 32 | Empty-state, onboarding page titles |
| `heading-lg` | 24 | Primary page titles |
| `heading-md` | 20 | Section titles, modal headers |
| `heading-sm` | 16 | Sub-section, card headers |
| `bold-md` / `medium-md` / `regular-md` | 14 | Body, three emphasis tiers |
| `bold-sm` / `regular-sm` | 12 | Metadata, captions, tag text, table-cell labels |
| `link-md` | 14 | Inline links (underlined on hover only) |

### Hard rules

- Max **2 text-style sizes** per section
- Never `fontSize: '14px'` inline → always reference a token via `<Heading size>` or `<Text size>`
- Page title = `heading-lg`; step down one tier per nested level
- Table numerics = tabular numbers (`'tnum'` enabled)

## Density — product surfaces are dense by default

Gorgias UI is helpdesk product UI. The user is an agent on their 200th ticket of the shift — they need information density, not generous breathing room. **The default rhythm for product surfaces is dense.** Marketing surfaces, onboarding flows, empty-state pages can be airy; the helpdesk, settings, dashboards, and detail panels cannot.

Concrete defaults — all expressed in tokens, never px:

| Surface | Row gap (inside a section) | Section-to-section gap | Outer padding | Surrounding wrapper |
|---|---|---|---|---|
| Detail pane (ticket sidebar, customer sidebar) | `xxs` | `xs` | `sm` | No Card per section — use `<Separator>` or whitespace alone |
| Form (settings card) | `sm` | `md` | `lg` | One `<Card>` wraps the form |
| Dashboard cards row | `md` between cards | `lg` between rows | `lg` interior | Each KPI is its own `<Card>` |
| Conversation / message thread | `xs` between messages | `md` between groups | `md` interior | No Card per message |

### Avatars

| Surface | Size |
|---|---|
| Dense table cell, message author chip | `<Avatar size="sm">` |
| Identity row, conversation message header | `<Avatar size="md">` |
| Detail header (customer profile section) | `<Avatar size="xl">` |

Never override `size` with a numeric prop — the named sizes are calibrated to pair with text-style sizes.

### Heading & Text in dense panes

| Role | Component |
|---|---|
| Pane section header (e.g. "Ticket details", "Customer") | `<Heading size="sm">` (16px equivalent) |
| Field label (left column of a label/value row) | `<Text size="sm" color="content-neutral-secondary">` (12px, neutral-secondary color) |
| Field value (right column) | `<Text size="md">` (14px default body) |
| Pane title (top of the column) | `<Heading size="md">` |

### When to use airy spacing instead

Use `lg`/`xl` gaps and generous padding only on surfaces where density is wrong:
- Marketing landing pages (rare in Gorgias product)
- Onboarding / empty-state hero
- Settings page header zones (not the form inside)
- Single-form-flow centered pages

When in doubt, stay dense. Gorgias readers prefer "I can see all my fields at once" over "this looks airy".

## Spacing — 8 tokens, no escapes

| Token | px | Anchor use |
|---|---|---|
| `xxxs` | 2 | Tag inner padding |
| `xxs` | 4 | Icon-to-text in dense rows |
| `xs` | 6 | Outer screen-edge padding around Main Container |
| `sm` | 8 | Button internal, filter chip gap |
| `md` | 12 | Sibling cards (row OR column), chart-to-chart |
| `lg` | 16 | Dashboard interior, settings left-pad, gap between dashboard sections |
| `xl` | 24 | Reserved — section breaks |
| `xxl` | 32 | Reserved — page-level vertical rhythm |

**Mapping rule**: any pixel value seen in a design that's not 1px borders or font sizes must round to the nearest token. Never escape into raw `px`. Same for `gap`, `padding`, `margin`.

**Rounding policy** — round to nearest, ties round up. Examples:
- 3px → `xxs` (4)
- 5px → `xs` (6) — closer to 6 than to 4
- 7px → `sm` (8) — tie between 6 and 8, round up
- 10px → `md` (12) — closer to 12 than to 8
- 14px → `lg` (16) — tie between 12 and 16, round up
- 20px → `xl` (24) — closer to 24 than to 16
- 28px → `xxl` (32) — tie between 24 and 32, round up

If a measurement is so far off the scale that the rounded value would distort the design (e.g. a 60px gap), reconsider the design — it likely doesn't belong in the system. Don't invent a 9th token.

## Elevation — 4 tiers, tone-based

Shadows are minimal. Depth comes from **surface tone**, not heavy drop-shadow.

| Tier | Use | Token |
|---|---|---|
| Page bg | Lowest layer | `elevation-neutral-bg` |
| Card | Default working surface | `elevation-neutral-default` |
| Mid | Popovers, dropdowns, hovering | `elevation-neutral-mid` |
| High | Modals, drawers, toasts | `elevation-neutral-high` |

Surfaces: use a component's `elevation` prop — `<Card elevation="default">`, `<Panel elevation="mid">`. Most surface components expose one; reach for it rather than styling a raw `<Box>`. **Never** plain `bg="white"` + manual border + manual radius — that's what `Card` is for.

### Nesting rule — bump elevation +1 per level

Elevation is **relative to the surface underneath**. Every time a `Card`/`Panel` is nested inside or stacked on top of another, step **one tier up** so the inner surface reads as raised, not flush. Walk the tiers in order — `bg` → `default` → `mid` → `high`:

- Page (`bg`) → top-level `<Card elevation="default">` → a nested `<Card elevation="mid">` inside it → a popover/modal launched from there (`high`).
- Two Cards side-by-side on the page bg are siblings, **not** nested — both stay at `default`. The bump applies only when one surface sits *on* another.
- Don't skip tiers (`default` → `high`) or repeat the parent's tier on a child (`default` inside `default` reads flush — the nesting disappears). `high` is the ceiling; if you need a 5th level, the layout is too deep — flatten it.

## Shape — 4 radii, no mixing

| Radius | Use |
|---|---|
| 16px | Outer Main Container, Modal, Drawer |
| 12px | Inner Cards (one tier nested) |
| 8px | Buttons, inputs |
| 4px | Menu items, small controls |
| full (pill/circle) | Tags, dots, avatars |

Never mix sharp and rounded corners on the same surface.

## Color modes

Two modes: **light** (default) + **dark**. Same token names, different underlying hex. Runtime swap via active theme. Code always consumes mode-agnostic CSS variables.

### Tokens that DO NOT flip

- All `static-*`
- All `Dataviz/*` heat colors
- Brand-static logos and illustrations

### Sanity-check sample (dark mode)

| Token | Light | Dark |
|---|---|---|
| `content-neutral-default` | `#1e242e` | `#fafafa` |
| `elevation-neutral-bg` | `#fafafa` | `#14171a` |
| `elevation-neutral-default` | `#ffffff` | `#22252a` |
| `surface-accent-primary` | `#7e55f6` | `#754dec` |

## One-page cheat sheet

- **Color** → `var(--<role>-<modifier>-<state>)` only, never hex
- **Type** → text-style token via `<Heading>` / `<Text>`, max 2 sizes per section
- **Spacing** → 8-token scale, no raw px, `lg` interior + `xs` outer edge + `md` between siblings
- **Surface** → a component `elevation` prop (`Card elevation="*"`, `Panel elevation="*"`), never plain white + border
- **Shape** → 16/12/8/4/full, never mixed
- **Mode** → consume CSS vars, don't branch on theme in JSX
