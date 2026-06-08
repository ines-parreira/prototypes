---
name: Patterns
audience: AI agents — FIRST STOP for any component-selection decision; also the canonical compositions for non-trivial UIs
purpose: (1) Route intent → component name in one lookup. (2) For each repeating composition shape, name the components used + the canonical composition to borrow.
note: This file is the entry point. Read the "Component picker — by intent" section before opening any references/*.md.
---

# Patterns

A pattern is a **canonical composition** of 2+ Axiom components. Lifting a pattern is always cheaper than composing from atoms — it's pre-debugged. Each entry below names the parts, the gaps, and the composition to copy verbatim.

> **Source of truth = the code.** For exact prop shapes, defaults, and the
> verbatim composition, read the component's reference file (`references/<Name>.md`)
> or, failing that, the component source in `packages/axiom/src/<Name>`. The
> compositions below are recipes; the code is canonical.

---

## Component picker — by intent (start here)

Match your **intent** to a component, then open that component's doc. The per-component `## When` / `## When NOT` sections are the confirmatory check — this table is the first lookup.

### Actions

| I want… | Component |
|---|---|
| Trigger an action | [Button](references/Button.md) |
| Inline text navigation (destination, not action) | [Link](references/Link.md) |
| Dominant action + related variants behind a chevron | [MultiButton](references/MultiButton.md) |
| Segmented control / single-select toolbar | [ButtonGroup](references/ButtonGroup.md) |
| Hidden list of actions behind a `…` trigger | [Menu](references/Menu.md) |
| Button representing an entity's status (presence, workspace) | [StatusButton](references/StatusButton.md) |

### Form inputs

| I want… | Component |
|---|---|
| Single-line free-text input | [TextField](references/TextField.md) |
| Multi-line text input | [TextAreaField](references/TextAreaField.md) |
| Numeric input | [NumberField](references/NumberField.md) |
| Search input (with built-in clear + Enter submit) | [SearchField](references/SearchField.md) |
| Yes/no for **form submit** (terms acceptance, opt-in) | [CheckBoxField](references/CheckBoxField.md) |
| Yes/no for **instant effect** (settings on/off) | [ToggleField](references/ToggleField.md) |
| Pick 1 from 2-5 visible options | [RadioGroup](references/RadioGroup.md) |
| Pick 1 from a longer list (dropdown) | [SelectField](references/SelectField.md) |
| Pick many from a list (dropdown) | [MultiSelectField](references/MultiSelectField.md) |
| Single date | [DateField](references/DateField.md) |
| Date range (start + end) | [DateRangeField](references/DateRangeField.md) |

### Selection (without form-field chrome)

| I want… | Component |
|---|---|
| Dropdown single-select with custom trigger / not in a form | [Select](references/Select.md) |
| Dropdown multi-select with custom trigger / not in a form | [MultiSelect](references/MultiSelect.md) |
| Date picker without form chrome | [DatePicker](references/DatePicker.md) |
| Date range picker without form chrome | [DateRangePicker](references/DateRangePicker.md) |
| Action-list dropdown | [Menu](references/Menu.md) |
| Filter chips above a table or list | [Filters](references/Filters.md) (umbrella) |

### Status & status-indicators

| I want… | Component |
|---|---|
| Pill with text + color (status, channel, label, dismissible chip) | [Tag](references/Tag.md) |
| Compact colored circle (with adjacent label/context) | [Dot](references/Dot.md) |
| Numeric badge (counts, unread, notifications) | [Quantity](references/Quantity.md) |
| Identity surface (user/customer avatar) | [Avatar](references/Avatar.md) |
| Multiple people in a row (stacked) | [AvatarGroup](references/AvatarGroup.md) |
| Icon inside a tinted square (status badge, empty-state visual) | [IconBox](references/IconBox.md) |
| A canonical icon by name | [Icon](references/Icon.md) |
| Keyboard shortcut display (visual only) | [ShortcutKey](references/ShortcutKey.md) |

### Messages & feedback

| I want… | Component |
|---|---|
| Persistent in-flow contextual message | [Banner](references/Banner.md) |
| Ephemeral confirmation (Saved, Sent) | [Toast](references/Toast.md) |
| Blocking decision required (confirm, small form) | [Modal](references/Modal.md) |
| Slide-in detail panel (non-blocking) | [SidePanel](references/SidePanel.md) |
| Hover/focus contextual info | [Tooltip](references/Tooltip.md) |
| Auto-tooltip on ellipsis-truncated text | [OverflowTooltip](references/OverflowTooltip.md) |
| Anchored floating content with interactive children (form, buttons) | [Popover](references/Popover.md) |
| Inline field-level validation | TextField/SelectField/etc. `error` prop |

### Progress & loading

| I want… | Component |
|---|---|
| Indeterminate spinner | [Loader](references/Loader.md) |
| Layout-mimicking placeholder for initial load | [Skeleton](references/Skeleton.md) |
| Determinate progress (% complete) | [ProgressBar](references/ProgressBar.md) |
| Multi-step workflow with state per step | [Stepper](references/Stepper.md) |

### Navigation

| I want… | Component |
|---|---|
| Within-page section switcher (Overview / Activity / Settings) | [Tabs](references/Tabs.md) |
| Hierarchy path (Home → Settings → Form) | [Breadcrumbs](references/Breadcrumbs.md) |
| Next/previous for paginated content | [Pagination](references/Pagination.md) |
| Sequential multi-step flow | [Stepper](references/Stepper.md) |
| Inline destination link | [Link](references/Link.md) |

### Layout containers

| I want… | Component |
|---|---|
| Flexible div replacement (gap, padding, flex, polymorphic) | [Box](references/Box.md) |
| Grouped content with elevation + border + radius | [Card](references/Card.md) |
| Repeating item in a list (TileList) | [Tile](references/TileList.md) |
| Card with sticky header/footer during scroll | [Panel](references/Panel.md) |
| Visual divider between sections (use sparingly) | [Separator](references/Separator.md) |

### Collections (tabular / list-shaped data)

| I want… | Component |
|---|---|
| Feature-rich table (sorting, filtering, selection, pagination) | [DataTable](references/DataTable.md) |
| Plain static table (< 10 rows, no interactions) | [Table](references/Table.md) |
| Selectable list (standalone or as Select/Menu's inner) | [List](references/List.md) |

### Typography

| I want… | Component |
|---|---|
| Page title, section title, modal/card header | [Heading](references/Heading.md) |
| Body, metadata, caption, helper text, inline emphasis | [Text](references/Text.md) |

### Disclosure & expansion

| I want… | Component |
|---|---|
| Collapsible content section (with accordion option) | [Disclosure](references/Disclosure.md) |

---

## Wireframe → semantic extraction (when the user provides one)

The common case is "here's a wireframe / screenshot / hand-drawn sketch — vibe-code it". The wireframe is the layout truth. Your job is to read it precisely and translate it without losing the structure.

### Read the wireframe in this order

1. **Macro structure** — how many columns / panes? Are they fixed-width or flex? Where do they meet?
2. **Page header** — title? breadcrumb? description? primary action(s) right? tabs below?
3. **Repeated rows / cards** — is there a list, a table, a tile grid? How many distinct row "types" (e.g. parent row + child row + footer row)? Identify the repeating unit and design **one** component you reuse.
4. **Action placement** — where are buttons? Top right (primary)? On row hover (table row actions)? Inside an empty state (centered CTA)?
5. **Elements that look generic but aren't** — a "filter chip" is `Filters` umbrella, a "tag" is `Tag`, a "dot status" is `Dot`, a "selector" might be `Select` (no form) or `SelectField` (in a form). Route via the **Component picker — by intent** above.

### Don't auto-map to one of the common layout shapes

The recurring layout shapes (dashboard / settings / full-width-table / centered) are inspirations, not a menu. **When a wireframe shows something different — a 3-pane workspace, a kanban, a canvas, a split-pane inspector — build that shape.** Use the universal spacing defaults (outer `xs`, sibling cards `md`, header gap `0`, Main Container 16px+1px) and let the column structure follow the wireframe. The wireframe is the truth; the common shapes are not a procrustean bed.

### When an element doesn't map to an Axiom component

- **First**, grep `references/` (this folder) — sometimes the right component exists under a different name than the wireframe label (a "stepper" might be `Stepper`, a "chart" might need a third-party lib, a "pill" might be `Tag`).
- **Second**, check the component source in `packages/axiom/src` for components not yet documented under `references/` (the reference coverage isn't exhaustive — the code is).
- **If neither has it**, flag it explicitly and use a clearly-labeled approximation: a `Box` with the right spacing/elevation, a `[PLACEHOLDER: data visualization]` text node, etc. **Never invent a component name** — the build will fail and the user has to debug.

### Multi-screen flows

When the wireframe shows two or more screens (login → onboarding → dashboard, or before/after a modal):
- One file per screen (`LoginPage.tsx`, `OnboardingPage.tsx`, `DashboardPage.tsx`)
- A `RouterDemo.tsx` that switches between them via state (no real router — just enough to demo the transition)
- The `index.tsx` default-exports the RouterDemo

This lets the preview show the flow in motion without requiring a real routing setup.

### Wireframe quality matters — but you can build from anything

A pixel-perfect Figma frame, a Notion mockup, a hand-drawn napkin sketch — all are legitimate inputs. The agent does its best with what's given. If the wireframe is genuinely ambiguous in a place that matters (e.g. "is this a tab bar or a button group?"), ask **one** clarifying question rather than guessing. Otherwise pick the most likely Axiom answer and note it in the citation header's `Caveats`.

---

## Decision shortcuts — common confusions

These pairs are the most-asked "which one?" questions. Bookmark.

- **Toast vs Banner vs Modal** → Toast = ephemeral, Banner = persistent in-flow, Modal = blocking
- **Button vs Link** → Button = action (verb); Link = destination (noun)
- **Toggle vs Checkbox** → Toggle = instant-effect setting; Checkbox = form-submit value
- **Tag vs Dot vs Quantity** → Tag = pill+text; Dot = colored circle with context; Quantity = numeric badge
- **Tooltip vs Popover** → Tooltip = hover, no interaction; Popover = click, can hold inputs/buttons
- **Menu vs Select** → Menu = action list; Select = value selection
- **Modal vs SidePanel** → Modal = blocking centered; SidePanel = non-blocking slide-in
- **Loader vs Skeleton vs ProgressBar** → Loader = indeterminate spinner; Skeleton = layout placeholder; ProgressBar = known %
- **Tabs vs ButtonGroup vs Stepper** → Tabs = panel switching; ButtonGroup = segmented toolbar control; Stepper = sequential flow with state
- **Card vs Tile vs Panel** → Card = grouped content; Tile = list-row primitive; Panel = scrollable section with sticky chrome
- **Table vs DataTable** → Table = static < 10 rows; DataTable = anything with sorting/filtering/pagination/selection
- **SelectField vs Select** → SelectField = labeled form variant; Select = atom (custom trigger, no form chrome)
- **DateField vs DateFilter** → DateField = form input; DateFilter = filter-bar chip (lives inside Filters)

---

## Canonical compositions (lift these, don't reconstruct)

A pattern below is a **canonical composition of 2+ components** (PageHeader, FormField, SidePanel, etc.) — pre-debugged, lift verbatim. These are component-level recipes, intentionally closed.

For **page-level layouts** (dashboard / settings / table / 3-pane workspace / kanban / custom) the rule is the **opposite**: the recurring layout shapes are **inspiration, not a closed menu**. When a wireframe or spec calls for a layout that isn't one of them, build that custom layout. The token system (8-spacing scale, shell, dividers, radii) applies universally; only the column structure changes.

## Page Header

**Anatomy**: `[breadcrumb?] [title] [description?] [actions]` left/center · primary action right · tabs below · border-bottom divider.

**Composition** — use PanelHeader's `title` / `caption` props, not `<Heading>` / `<Text>` children:
```tsx
<PanelHeader
  title="Page title"
  caption="Optional description"
  trailingSlot={                       {/* right-aligned actions */}
    <Box flexDirection="row" gap="sm">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save</Button>
    </Box>
  }
>
  <Tabs>...</Tabs>                      {/* children render below the title row */}
</PanelHeader>
```

- `title` / `caption` are props (string or ReactNode) — don't pass `<Heading>` / `<Text>` as children for them.
- Non-`SearchField` children (Tabs, Breadcrumbs, filters) render in a row **below** the title. To stack a breadcrumb above the title or place an icon button beside it, pass `title` as a ReactNode.

**Heights**: 80 / 112 / 120 / 160 depending on what's inside (title only → title+tabs → title+description+actions → full).

**Hard rule**: bottom-pad is owned by the header. Gap below = `0`.

## Form field

**Anatomy**: `[label] [tooltip?]` → `[input]` → `[helper | error]`.

**Composition**:
```tsx
<TextField
  label="Email"
  caption="We'll send the receipt here."
  error={hasError ? 'Please enter a valid email.' : undefined}
/>
```

- Label = `bold-md`, paired above the input (`label` prop)
- Helper = `regular-sm`, `content-neutral-secondary` (the `caption` prop)
- On error: pass the `error` prop (string or node) — input border becomes `border-error-primary` and the caption is **replaced** by the error message in `content-error-primary`. Setting `error` also marks the field invalid (no separate `isInvalid` needed).
- Tooltip sits inline with the label (right-aligned in the label row)
- Disabled inputs use `surface-neutral-tertiary` bg + `content-neutral-tertiary` text
- Focus ring = 2px in `focus` color, offset 2px

**All `*Field` components share this contract**: TextField, NumberField, SelectField, MultiSelectField, CheckBoxField, ToggleField, TimeField, DateField, DateRangeField, SearchField, TextAreaField.

## Table cell types

| Cell type | Composition | Alignment |
|---|---|---|
| Text | `regular-md` in `content-neutral-default` | left |
| Numeric | `regular-md` + tabular numbers (`tnum`) | **right** |
| Status | `<Tag color={role}>` OR `<Dot color={role}> + label` (compact rows) | left |
| Avatar + name | `<Avatar size="sm" />` (24px) + `regular-md` name | left, `xxs` gap |
| Actions | `<Button variant="tertiary" icon="…" aria-label="…">` group, **visible only on row hover** | right |

**Row height**: 48px default, 40px compact, **40px header row** in `bold-sm` + `content-neutral-secondary`.

**Row states**:
- Hover → `hover-default` overlay
- Selected → `surface-additional-purple` background

## Empty state

**Anatomy**: `[illustration?] [heading-md title] [regular-md description] [primary CTA]`, centered, padding `48px 24px`.

**Composition**:
```tsx
<Box flexDirection="column" alignItems="center" gap="md" p="xl">
  {illustration && <Image src={illustration} alt="" />}
  <Heading size="md">No tickets yet</Heading>
  <Text>Your customer support inbox is empty.</Text>
  <Button variant="primary" leadingSlot="add-plus">Create ticket</Button>
</Box>
```

Illustration is optional — pulled from the `Illustration/*` token group when relevant.

## Filter bar

**Anatomy**: `[search input] + [filter chips] + [sort dropdown] + [view toggle]`, horizontal, `sm` gap, total height `40px`. Sits at the top of the table area.

**Composition**:
```tsx
<Box flexDirection="row" gap="sm" alignItems="center" height={40}>
  <SearchField placeholder="Search…" />
  <Filters>
    <SelectFilter ... />
    <MultiSelectFilter ... />
    <DateRangeFilter ... />
  </Filters>
  <Select trigger={<Button variant="tertiary" trailingSlot="arrow-chevron-down">Sort by…</Button>} />
</Box>
```

See `references/Filters.md` for the canonical Filters group composition and use it verbatim.

## Side panel / Drawer (right-slide detail)

**Anatomy**: slide from the right over a list page · width controlled by `size` prop (`sm`/`md`/`lg`/`xl`) or custom `width` · `OverlayHeader` owns the close affordance + title + description declaratively · body uses `lg` padding.

**Composition**: lift the canonical structure below verbatim (see `references/SidePanel.md` for the full prop signature):
```tsx
<SidePanel isOpen={open} onOpenChange={setOpen}>
  <OverlayHeader title="Customer details" description="John Doe — VIP" />
  <OverlayContent>...</OverlayContent>
  <OverlayFooter>
    <Button variant="primary">Edit</Button>
  </OverlayFooter>
</SidePanel>
```

## Modal — centered dialog

**Anatomy**: 480px default, focus-trapped, dismissable by Esc or backdrop click. Single primary purpose.

**Footer button placement**:
- 2 buttons → primary right, tertiary (Cancel) immediately left of primary
- 3 buttons → primary right, then secondary, then tertiary "More" (e.g., "Discard")

**Composition**: see `references/Modal.md` and lift it verbatim. Never invent a custom modal — the Modal component handles a11y, focus trap, scroll lock, and Escape.

## Detail field list (the dense label/value column)

**This is the central composition of any Gorgias product sidebar** — ticket details, customer details, order details, settings panel right column, any place where you have a list of `Label : Value` rows. Get this wrong and the whole pane reads "marketing card" instead of "product UI".

**Anatomy**: vertical stack of rows. Each row = label left (`<Text size="sm" color="content-neutral-secondary">`), value right (`<Text size="md">`). Rows are separated by `xxs` gap only. **No `<Card>` wrapper per row. No padding between rows other than the gap.** Sections within the same pane are separated by `<Separator>` or `xs` whitespace.

**Composition** — tokens only, never px:

```tsx
<Box flexDirection="column" gap="xxs" p="sm">
  <Box flexDirection="row" justifyContent="space-between" alignItems="center">
    <Text size="sm" color="content-neutral-secondary">Status</Text>
    <Tag color="green">Open</Tag>
  </Box>
  <Box flexDirection="row" justifyContent="space-between" alignItems="center">
    <Text size="sm" color="content-neutral-secondary">Channel</Text>
    <Text size="md">Email</Text>
  </Box>
  <Box flexDirection="row" justifyContent="space-between" alignItems="center">
    <Text size="sm" color="content-neutral-secondary">Priority</Text>
    <Text size="md">Normal</Text>
  </Box>
  {/* …more rows… */}
</Box>
```

For multi-section panes (a sidebar with "Ticket details" + "Customer" + "Tickets" + "Orders"):

```tsx
<Box flexDirection="column" gap="xs" p="sm">
  <Box flexDirection="column" gap="xxs">
    <Heading size="sm">Ticket details</Heading>
    {/* …field rows… */}
  </Box>
  <Separator />
  <Box flexDirection="column" gap="xxs">
    <Heading size="sm">Customer</Heading>
    {/* …field rows… */}
  </Box>
  <Separator />
  {/* …more sections… */}
</Box>
```

**When to deviate**:
- If a value is too long to fit on one line (multi-line address, long bio), stack value below label (still `xxs` gap)
- If a value is itself interactive (a Select to change status), use the matching `<*Field>` component instead of `<Text>` — but keep the label `regular-sm secondary` on the same row
- If a row needs hover/edit affordance (click the row to open an edit drawer), wrap the row in a tertiary-button-styled `<Box>` that shows a hover state via `hover-default` overlay

**Don'ts**:
- ❌ Wrapping each row in a `<Card>` — adds chrome that breaks density
- ❌ Using `md`/`lg` gap between rows — that's marketing-card density, not product density
- ❌ Using `<Heading>` for field labels — labels are `<Text size="sm" color="content-neutral-secondary">`, headings are for section titles
- ❌ Padding > `sm` on the outer Box — dense panes are `sm` interior, not `lg`
- ❌ Coloring values with accent purple "to make them pop" — values are `content-neutral-default`; if you need to draw attention, the value's component (Tag, Avatar) carries the color

## Avatar + name combinations

| Surface | Avatar size | Pair with |
|---|---|---|
| Detail header (customer info) | `xl` (48px) | `heading-md` name |
| Default identity row | `md` (32px) | `regular-md` name |
| Dense table cell | `sm` (24px) | `regular-md` name, `xxs` gap |

**Hard rule**: Size pairs with role. Large avatars belong to identity surfaces, small to dense tables. **Mismatch breaks visual rhythm.**

## Stepper / multi-step flow

**Anatomy**: numbered/labeled steps, current step highlighted, completed steps marked `check`, future steps muted.

**Composition**: see `references/Stepper.md` and lift it verbatim. Stepper is a tab-like switcher — it owns the panel switching, you provide the panels.

## Disclosure (accordion)

**Anatomy**: collapsible content row with a chevron toggle (`arrow-chevron-down`).

Use case: dense settings, FAQs, advanced sections. Avoid more than 5 nested disclosures.

## Tooltip vs Popover decision

- **Tooltip**: hover/focus only, no interaction inside, single line of text, 300ms delay
- **Popover**: click-triggered, can hold buttons/links/inputs, dismissable by outside-click or Esc

Mixing them is the #1 invented anti-pattern (a "tooltip with a button"). Use Popover.

## Toast vs Banner vs Modal decision

| Decision | Use |
|---|---|
| Ephemeral, non-blocking, action confirm ("Saved") | `Toast` |
| Persistent, contextual, in the page flow | `Banner` |
| Blocking, requires a decision | `Modal` |
| Inline validation error on a field | Field's `errorMessage` prop, NOT Banner |

## Loader vs Skeleton decision

- Indeterminate progress on a single button/action → `<Loader>` inside the button (`isLoading`)
- Initial page/section load → `<Skeleton>` mimicking the eventual layout
- Full-screen blocking load → uncommon; use `<Loader>` centered in a `<Card elevation="mid">`
