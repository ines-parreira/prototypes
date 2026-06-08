---
name: axiom
description: Guide for using the @gorgias/axiom component library. Use when Claude needs to help users work with axiom components for (1) Understanding how to use a specific component, (2) Learning about component props and types, (3) Finding examples of component usage, (4) Discovering available components by category, (5) Building UI with axiom components, or (6) Any questions about axiom component APIs.
---
# @gorgias/axiom Component Library Guide

This skill provides comprehensive documentation for using the @gorgias/axiom design system components.

## Quick Start

All components are imported from `@gorgias/axiom` :

```typescript
import { Button, Modal, TextField } from '@gorgias/axiom'
```

## Design reference docs (read these for the "why")

This skill pairs **technical** per-component references (`references/<Component>.md` — props, types, examples, testing queries) with **design** references that carry the rules behind the API:

- **`references/patterns.md`** — **start here when choosing components or composing a UI.** A component picker by intent, wireframe→component extraction, decision shortcuts ("Toast vs Banner vs Modal", "Button vs Link"…), and canonical compositions (page header, form field, table cell, side panel, dense detail list…).
- **`references/foundations.md`** — color, typography, density, spacing, elevation, shape, and color modes resolved to tokens. The hard rules: never hex, never raw px, accent purple is chirurgical, product surfaces are dense by default.
- **`references/iconography.md`** — icon name validation (avoid the silent Material-Icons fallback), the three icon styles (outlined / multicolor / mono-filled), and the top naming traps.
- **`references/motion.md`** — the three motion tokens and when to use each.

The **code is always the source of truth** for prop facts (`packages/axiom/src/<Component>`, `tokens/tokens.json`, `Icon/icons.ts`); the design docs carry usage rules (when / why / placement).

## Component Categories

- **Typography**: Text, Heading
- **Buttons**: Button, ButtonGroup, MultiButton, StatusButton
- **Form Fields**: TextField, TextAreaField, NumberField, SelectField, DateField, DateRangeField, TimeField, SearchField, MultiSelectField, ToggleField, CheckBoxField, Label
- **Collections**: List, Table, DataTable, ReorderableTable, Pagination, OverflowList
- **Selections**: Menu, Select, MultiSelect, RadioGroup
- **Filters**: Filters, SelectFilter, MultiSelectFilter, DateFilter, DateRangeFilter, BooleanFilter, FilterButton
- **Date Selection**: DatePicker, DateRangePicker, Calendar, RangeCalendar
- **Overlays**: Modal, SidePanel, Overlay, Popover, Tooltip
- **Navigation**: Tabs, Breadcrumbs, Stepper, Link
- **Layout**: Box, Card (with CardHeader, CardContent, CardFooter), Panel (with PanelHeader, PanelFooter), StickyStack (with StickyLayer), ScrollFollow (with ScrollFollowButton), Tile (with TileHeader, TileContent), TileList (with TileListItem)
- **Miscellaneous**: Avatar, AvatarGroup, Banner, Dot, IconBox, Image, Loader, Tag, Icon, GaiaIcon, FlagIcon, Skeleton, ShortcutKey, Separator, Quantity, ProgressBar, Toast, OverflowTooltip, Disclosure

## Finding Component Documentation

When a user asks about a specific component:

1. Check if a reference file exists for that component: `references/<ComponentName>.md`
2. If the file exists, read it to get detailed information about:

    - Component props and TypeScript types
    - Usage examples
    - Related components
    - Accessible testing queries (ByRole, ByLabelText, etc.)

3. If no reference file exists, you can:
    - Read the component source file at `src/<ComponentName>/<ComponentName>.tsx` to see prop types and exports
    - Read the component index at `src/<ComponentName>/index.ts` to see what's exported
    - Look at Storybook stories at `src/<ComponentName>/<ComponentName>.stories.tsx` for usage examples
    - Look at test files at `src/<ComponentName>/<ComponentName>.spec.tsx` to see how components are tested with a11y queries

## Layout with Box and Card

**Use Box and Card components for all layout needs.** These provide flexbox-based layout with utility props that eliminate the need for custom CSS.

### Box Component

Box is the fundamental layout primitive with flexbox capabilities and utility props:

**Spacing utilities (shorthand):**

- `p`, `pt`, `pr`, `pb`, `pl` - padding (all, top, right, bottom, left)
- `m`, `mt`, `mr`, `mb`, `ml` - margin (all, top, right, bottom, left)

**Sizing utilities (shorthand):**

- `w`, `h` - width, height
- `minWidth`, `maxWidth`, `minHeight`, `maxHeight`

**Flexbox props:**

- `flexDirection` - `'row'` | `'column'` | `'row-reverse'` | `'column-reverse'`
- `justifyContent` - `'flex-start'` | `'flex-end'` | `'center'` | `'space-between'` | `'space-around'`
- `alignItems` - `'flex-start'` | `'flex-end'` | `'center'` | `'stretch'` | `'baseline'`
- `gap`, `rowGap`, `columnGap` - spacing between flex items
- `flexWrap`, `flexGrow`, `flexShrink`, `flexBasis`, `alignSelf`

**Values**: All spacing/sizing props accept `SizeValue` (Size enum like `'sm'` / `'md'` , numbers for pixels, or CSS units like `'100%'` )

```typescript
// Vertical stack with spacing
<Box flexDirection="column" gap="md" p="lg">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Box>

// Horizontal layout with space-between
<Box flexDirection="row" justifyContent="space-between" alignItems="center" p="md">
  <Text>Left</Text>
  <Button>Right</Button>
</Box>

// Responsive sizing
<Box w="100%" maxWidth="1200px" m="auto">
  <Text>Centered content</Text>
</Box>
```

### Card Component

Card extends Box with elevation styling. Accepts all Box props plus:

- `elevation` - `'background'` | `'low'` | `'default'` | `'mid'` | `'high'` - visual depth (omit for no elevation)
- `onClick` - makes card interactive (renders as anchor)

**Defaults:** `flexDirection="column"`, `gap="lg"`, `padding: md lg` (via CSS), `border-radius: sm`, `border: 1px solid`. Don't pass these props explicitly when using the default values.

```typescript
// Card with elevation — flexDirection="column" and gap="lg" are defaults
<Card elevation="mid">
  <Heading size="lg">Title</Heading>
  <Text>Content here</Text>
  <Button>Action</Button>
</Card>

// Interactive card
<Card elevation="high" onClick={handleClick}>
  <Text>Click me</Text>
</Card>
```

### Panel Component

Panel is a scrollable container with sticky header/footer support. It wraps Card with a StickyStack context so `PanelHeader`/`PanelFooter` pin to the top/bottom as content scrolls. Set `overflow="auto"` to enable internal overlay scrollbars. Use Panel as the top-level layout for pages with a sticky header and DataTable.

**When using DataTable inside a Panel, omit `withBorder`** — the Panel's Card provides the border.

```typescript
<Panel overflow="auto">
  <PanelHeader title="Users" />
  <DataTable data={data} columns={columns} />
</Panel>
```

`PanelHeader` splits children into slots: `<SearchField>` children render inline in the title row (left of `trailingSlot`); all other children render in a row **below** the title (tabs, filters, breadcrumbs). See `references/Panel.md` for the full API.

### StickyStack

`StickyStack` provides a context for coordinated sticky layers that pin to the top of a scroll container as content scrolls. Wrap children with `<StickyLayer>` to register a sticky region. Panel uses StickyStack internally, so `PanelHeader` / `PanelFooter` and DataTable headers stack correctly within a Panel.

Available hooks for advanced cases:
- `useStickyLayer` — register a custom sticky layer
- `useActiveStickyLayer` — track which layer is currently active (used for scroll-to-layer effects)
- `useStickyScroll` / `useStickyScrollState` — observe scroll position and `hasScrollAbove` / `hasScrollBelow`
- `useStickyScrollContainer` — explicitly register the scroll container (needed for OverlayScrollbars' deferred viewport)

### ScrollFollow

`ScrollFollow` keeps its children pinned to the bottom of the surrounding scroll container as the content grows — chat threads, logs, streamed output. Drop it inside the scroll area and pass the content as children; it auto-detects the scroll container (the nearest `StickyStack` container such as a `Panel`, else the nearest scrollable ancestor), so there's nothing to wire up.

- `ScrollFollowButton` — a self-managing "scroll to bottom" button that appears when the user scrolls away from the bottom (render it alongside `ScrollFollow`).
- Hooks for advanced cases: `useScrollFollow` (the pinning behavior) and `useScrollController` (imperative scroll control, e.g. `toBottom`). Types: `ScrollFollowProps`, `ScrollFollowButtonProps`, `ScrollableTarget`, `ScrollController`, `UseScrollFollowOptions`, `UseScrollFollowResult`.

```typescript
<Panel overflow="auto">
  <PanelHeader title="Chat" />
  <ScrollFollow>
    {messages.map((m) => <Message key={m.id} {...m} />)}
  </ScrollFollow>
  <ScrollFollowButton />
</Panel>
```

### GaiaIcon

`GaiaIcon` renders the Gaia brand icon inside a circular bordered container. Sizes: `'sm'` (16px), `'md'` (24px, default), `'lg'` (40px). It takes no `name` — it's a fixed brand mark. Use it for AI/Gaia entry points (e.g. as a Button `leadingSlot`).

```typescript
<GaiaIcon size="sm" />
<Button leadingSlot={<GaiaIcon size="sm" />}>Ask Gaia</Button>
```

### When to Use Each

- **Box**: General-purpose layout container, flexbox layouts, spacing control
- **Card**: Grouping related content with visual elevation, contains sections or forms
- **Panel**: Full-page or sub-page layout with sticky header/footer + internal scrolling (DataTable stacking, scrollable side panels)
- **StickyStack**: Lower-level primitive when you need sticky layer coordination outside of Panel
- **Custom CSS**: Last resort only - most needs are handled by Box/Card props

## Common Types

Axiom components share a set of common types for consistency. For detailed information, see `references/common-types.md` .

**Key shared types:**

- **Variant**: `Primary`, `Secondary`, `Tertiary` - Visual style variants for emphasis
- **Intent**: `Regular`, `Destructive`, `Ai` - Semantic meaning of actions
- **Size**: `Xxxxs` through `Xxxl` - Predefined size scale (most components use subset like `Sm`, `Md`)
- **Color**: `Ai`, `Blue`, `Coral`, `Fuchsia`, `Green`, `Grey`, `Red`, `Orange`, `Purple`, `Teal`, `Yellow`
- **Elevation**: `Background`, `Low`, `Default`, `Mid`, `High` - Visual depth for containers
- **Placement**: `Bottom`, `Top`, `Left`, `Right` (with left/right modifiers) - Positioning for floating elements
- **Orientation**: `Horizontal`, `Vertical` - Layout direction

**Flexible value types:**

- **SizeValue**: Accepts `Size` enum, numbers (pixels), or CSS units (`px`, `em`, `rem`, `vh`, `vw`, `%`, `calc()`)
- **ColorValue**: Accepts `Color` enum, CSS variables (`var(--token)`), or hex codes (`#ffffff`)

### Using Enum Values

**Always use string-based enum values, not the enum constants:**

```typescript
// ✅ Correct - use string values
<Button variant="primary" size="md" intent="destructive" />

// ❌ Incorrect - don't use enum constants
import { ButtonVariant, ButtonSize, Intent } from '@gorgias/axiom'
<Button variant={ButtonVariant.Primary} size={ButtonSize.Md} intent={Intent.Destructive} />
```

## Design Tokens

Design tokens are the visual design atoms of the axiom system. They define colors, spacing, typography, and effects. For the full token catalog see `references/Tokens.md`; for the **design rules** on how to choose between them (and when each is wrong) see `references/foundations.md`.

**The hard rules from `foundations.md` — apply these whenever you pick a value:**

- **Never hex, never raw px.** Colors are always tokens (`var(--token)` in CSS, or the bare token name in a component `color` prop); spacing/sizing always rounds to the nearest of the 8 spacing tokens (`xxxs`…`xxxl`). Don't invent a 9th spacing value.
- **Accent purple is chirurgical.** `surface-accent-primary` is the *only* purple — primary actions, selected/checked state, links, focus rings, AI surfaces. In a complete page, **no more than 3 distinct elements** should use accent tokens. A Gorgias page is ~92% neutral.
- **Product surfaces are dense by default.** The user is an agent on their 200th ticket — favor density over whitespace. Reserve `lg`/`xl` gaps for marketing/onboarding/empty-state surfaces, not the helpdesk, settings, dashboards, or detail panes.
- **Max 2 text-style sizes per section**; page title = `heading-lg`, step down one tier per nesting level.
- **Depth comes from surface tone, not heavy shadows** — use a component's `elevation` prop (`<Card elevation="…">`, `<Panel elevation="…">`), never plain white + manual border + manual radius. **When Cards/Panels are nested or stacked, bump elevation one tier per level** (`bg` → `default` → `mid` → `high`) so the inner surface reads as raised; siblings on the same surface share a tier. See `references/foundations.md`.

### Token Categories

**Color Tokens:**

- **Core colors**: Base palette (grey, green, blue, purple, red, coral, orange, yellow, teal, fuchsia scales)
- **Semantic colors**: Theme-aware tokens organized by purpose (content, border, surface, elevation, interactive states)
- **Static colors**: Fixed colors that don't change with theme
- **Data visualization**: Colors for charts and data viz
- **Gradients**: Pre-defined gradient combinations
- **AI colors**: Gradient colors for AI features

**Spacing Tokens:**

- spacing-0 (0px) through spacing-xxxl (64px)
- Consistent scale: xxxxs (2px), xxxs (4px), xxs (6px), xs (8px), sm (12px), md (16px), lg (24px), xl (32px), xxl (48px), xxxl (64px)

**Typography Tokens:**

- Heading styles: typography-heading-xxl through typography-heading-sm
- Body text: typography-{bold|medium|regular|link|italic}-{md|sm|xs}
- All use Inter font family with consistent sizing and line heights

**Effects Tokens:**

- effects-shadow-container: Subtle shadow for containers
- effects-shadow-component: Light shadow for components
- effects-inner-shadow, effects-inner-light: Inner shadow effects

### Using Tokens in Components

**Prefer using tokens as component props** - many components accept `SizeValue` and `ColorValue` types that allow you to pass token values directly:

```typescript
// ✅ Good - Use tokens as component props
<Box
  p="md"              // spacing token via SizeValue
  gap="sm"            // spacing token via SizeValue
  w="100%"            // CSS unit via SizeValue
  maxWidth={1200}     // number (pixels) via SizeValue
>
  <Text
    size="sm"         // Size enum
    color="content-neutral-secondary"  // token name — omit the var(--) wrapper
  >
    Content
  </Text>
  <Icon
    name="check"
    color="success-500"  // Color enum
    size="md"            // Size enum
  />
</Box>

// ✅ Good - Use CSS variables for advanced cases
<Box style={{ borderColor: 'var(--border-neutral-default)' }}>
  Content
</Box>
```

**Component props using tokens:**

- **Box/Card**: `p`, `m`, `gap`, `w`, `h` and variants accept `SizeValue` (Size enum, numbers, CSS units)
- **Text**: `color` accepts `ColorValue` (Color enum, CSS variables, hex codes)
- **Icon**: `color` accepts `ColorValue`, `size` accepts Size enum
- **Button**: `size` accepts Size enum subset

**SizeValue type** accepts:

- Size enum: `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, etc.
- Numbers: Interpreted as pixels (e.g., `16` = `16px`)
- CSS units: `'100%'`, `'2rem'`, `'calc(100% - 32px)'`

**ColorValue type** accepts:

- Color enum: `'grey-600'`, `'success-500'`, `'error-500'`, etc.
- Token names: `'content-neutral-secondary'` — the bare token, **without** `var(--)`
- CSS variables: `'var(--content-neutral-default)'`
- Hex codes: `'#ffffff'`

> **Omit `var(--)` in component color props.** When passing a token to a
> component `color` prop (`Text`, `Icon`, `Dot`, …), pass the bare token name —
> the component wraps it in `var(--…)` for you. Use `color="content-neutral-secondary"`,
> not `color="var(--content-neutral-secondary)"`. Reserve the `var(--…)` form for
> raw `style={{}}` / CSS, where the wrapper is required.

**When to use CSS variables directly:**

- When using semantic tokens in custom styles
- When the component doesn't expose a prop for that token type
- For semantic color tokens like `content-*`, `surface-*`, `border-*`

```typescript
// Using semantic color tokens via CSS variables
const styles = {
    color: 'var(--content-neutral-default)',
    backgroundColor: 'var(--surface-neutral-primary)',
    borderColor: 'var(--border-neutral-default)',
}
```

### Best Practices

**Colors:**

- Use semantic tokens (content-_, surface-_, border-\*) over core colors
- Use Color enum values in component props when possible
- In component `color` props, pass the bare token name and omit `var(--)` (e.g. `color="content-neutral-secondary"`); keep `var(--…)` for raw `style`/CSS
- Match token purpose to usage (content for text, surface for backgrounds)
- Respect color hierarchy: default (primary), secondary, tertiary

**Spacing:**

- Use spacing tokens through Box/Card props (`p="md"`, `gap="sm"`)
- Avoid arbitrary values - stick to the defined spacing scale
- Common patterns: `'md'` (16px) for component padding, `'xs'`/`'sm'` (8-12px) for gaps, `'lg'`/`'xl'` (24-32px) for sections

**Typography:**

- Use complete typography tokens instead of mixing individual properties
- Choose appropriate sizes: heading-_ for headings, _-md for body, _-sm for secondary, _-xs for labels

**Effects:**

- shadow-container for modals, popovers, drawers
- shadow-component for cards, dropdowns, tooltips
- Don't stack multiple shadows

## Controlled vs Uncontrolled Components

Axiom components support both controlled and uncontrolled usage patterns via `ValueProps` and `VisibilityProps` .

**Default: Use uncontrolled as much as possible.**

### Uncontrolled (Recommended)

Use `defaultValue` or `defaultOpen` to set initial state. The component manages its own state:

```typescript
// Form field - uncontrolled
<TextField defaultValue="initial text" onChange={(value) => console.log(value)} />

// Modal - uncontrolled
<Modal defaultOpen={false} onOpenChange={(isOpen) => console.log(isOpen)}>
  {/* content */}
</Modal>
```

### Controlled

Use `value` or `isOpen` when you need to control the state externally:

```typescript
// Form field - controlled
const [value, setValue] = useState("text")
<TextField value={value} onChange={setValue} />

// Modal - controlled
const [isOpen, setIsOpen] = useState(false)
<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
  {/* content */}
</Modal>
```

**When to use controlled:**

- Need to synchronize state across multiple components
- Implementing complex validation logic
- Need to transform or validate input before updating state
- Building form libraries or abstractions

## Styling Guidelines

**Do not use CSS or custom styles unless it's a last resort.** Most styling needs are configurable via component props.

### ✅ Prefer Props Over CSS

```typescript
// ✅ Good - use Box with utility props
<Box p="md" gap="sm" flexDirection="column">
  <Text size="sm" color="grey-600">Content</Text>
</Box>

// ❌ Bad - avoid custom CSS/styles
<div style={{ padding: '16px', gap: '8px', display: 'flex', flexDirection: 'column' }}>
  <span style={{ fontSize: '14px', color: '#666' }}>Content</span>
</div>
```

### When Custom Styles Are Acceptable

- The design system truly doesn't support what you need
- You're creating a one-off layout that won't be reused
- You've exhausted all prop-based options (Box, Size, Color, spacing props, etc.)

If you find yourself needing custom styles frequently, consider:

1. Checking if there's a component prop you missed
2. Using Box component with layout props
3. Suggesting a design system enhancement

## Motion & Animation

**Axiom has no motion tokens yet** — there is no `motionTokens` export and no `--motion-*` CSS variable. Until they ship:

- Where a component already animates (Modal, SidePanel, Toast, Disclosure, Tooltip, Tabs), **don't override its timings** — it owns its motion contract.
- When you must add a transition, match the curve components already use: `cubic-bezier(0.9, 0, 0, 1)` at 250–300ms. Don't introduce new curves; never `transition: all … ease`.
- Animate only `transform` / `opacity`, and guard with `@media (prefers-reduced-motion: reduce)` in the component's own `.module.less` (there is no global handler).

The target design model (two curves: an 800ms `layout` curve for page-shape shifts, a ~300ms `micro` curve for component state) and the rationale live in `references/motion.md`.

## Custom Trigger Pattern

Many popover-based components (Select, MultiSelect, Menu, DatePicker, DateRangePicker, and their filter variants) accept a `trigger` prop to replace the default trigger element. The trigger can be a `ReactNode` or a render function receiving component-specific state:

```typescript
type TriggerProp<P> = ReactNode | ((props: P) => ReactNode)
```

### ReactNode Trigger

Pass an interactive element (Button, StatusButton, etc.) directly:

```typescript
<Select
    trigger={<Button trailingSlot="arrow-chevron-down">Pick one</Button>}
    items={options}
    aria-label="Options"
>
    {(option) => <ListItem label={option.name} />}
</Select>
```

### Render Function Trigger

Use a function to access component state (selection, open state, etc.):

```typescript
<Select
    trigger={({ selectedItem, isOpen }) => (
        <Button trailingSlot={isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'}>
            {selectedItem?.name ?? 'Select...'}
        </Button>
    )}
    items={options}
    aria-label="Options"
>
    {(option) => <ListItem label={option.name} />}
</Select>
```

### Non-Interactive Triggers

For non-interactive elements (div, span, Box), wrap with `SelectTrigger` to make them focusable:

```typescript
import { SelectTrigger } from '@gorgias/axiom'

<Select
    trigger={({ selectedText }) => (
        <SelectTrigger>
            <Box p="md">{selectedText || 'Custom trigger'}</Box>
        </SelectTrigger>
    )}
    items={options}
    aria-label="Options"
>
    {(option) => <ListItem label={option.name} />}
</Select>
```

Each component provides its own render props type (e.g., `SelectTriggerRenderProps`, `MultiSelectTriggerRenderProps`, `MenuTriggerRenderProps`) exposing relevant state like `isOpen`, `selectedItem`, `selectedItems`, `selectedText`, etc.

## Slot Props (leadingSlot / trailingSlot)

Many components accept `leadingSlot` and `trailingSlot` props using the shared `SlotProp` type. A slot accepts three kinds of values:

1. **Icon name string** (preferred) — automatically renders an `<Icon>` with the correct size/intent
2. **ReactNode** — any JSX element
3. **Render function** — `(props: RenderProps) => ReactNode` for dynamic content based on component state (e.g., `isLoading`, `isSelected`, `isDisabled`)

```typescript
type SlotProp<P = never> = [P] extends [never]
    ? IconName | ReactNode
    : IconName | ReactNode | ((props: P) => ReactNode)
```

```typescript
// ✅ Best - icon name string (component manages size/color)
<Button leadingSlot="add-plus">Add Item</Button>
<ListItem leadingSlot="check" label="Completed" />

// ✅ OK - Render function for dynamic slots
<Button leadingSlot={({ isLoading }) => isLoading ? <Loader /> : 'add-plus'}>
  Save
</Button>

// ❌ Avoid - Don't use <Icon /> in slots (component handles size/intent)
<Button leadingSlot={<Icon name="add-plus" />}>Add Item</Button>
```

Each component exports its own render props type (e.g., `ButtonRenderProps`, `TabRenderProps`, `ListItemRenderProps`). Check the component source or reference file for the available render props.

## Icon Usage Guidelines

**Use IconName string representation as much as possible. Only use the `<Icon />` component as standalone.**

**Only use `<Icon />` component when:**

- Rendering an icon standalone (not inside another component's slot)
- You need to customize icon-specific props like `size` or `color` (should not be done for slots, because the component will manage those)

```typescript
// ✅ Good - Standalone icon usage
<Icon name="warning-triangle" size="lg" color="red" />

// ✅ Good - Icon in custom layout
<Box flexDirection="row" gap="sm" alignItems="center">
  <Icon name="info" />
  <Text>Information message</Text>
</Box>
```

### Validate every icon name

A string passed to `name` / `leadingSlot` / `trailingSlot` / `icon` that *looks* like an icon name but isn't in the catalog silently falls through to the Material Icons fallback — wrong glyph or empty space with phantom padding. **The bug is invisible in code review.** Every icon string must appear **verbatim** in `packages/axiom/src/Icon/icons.ts`; grep it when unsure (`grep '"<name>"' packages/axiom/src/Icon/icons.ts`). Empty result = the icon does not exist; pick a related canonical name or tell the user — never improvise.

Top naming traps: `add-plus` (not `plus`/`add`), `close` (not `x`/`cancel`), `magnifying-glass` (not `search`), `edit-pencil` (not `edit`/`pencil`), `trash-empty` (not `trash`/`delete`), `arrow-chevron-down` (not `chevron-down`), `dots-meatballs-horizontal` (not `more-horizontal`). See `references/iconography.md` for the full list, the three icon styles (outlined / multicolor / mono-filled), and color rules.

## Testing Guidelines

**Use accessibility-based queries only.** Never use `data-testid` attributes.

### Query Priority

1. **ByRole** (preferred): `getByRole('button', { name: 'Submit' })`
2. **ByLabelText**: `getByLabelText('Email')`
3. **ByPlaceholderText**: `getByPlaceholderText('Enter email')`
4. **ByText**: `getByText('Welcome')`

```typescript
// ✅ Good - use accessible queries
const button = screen.getByRole('button', { name: 'Submit' })
const input = screen.getByLabelText('Email')

// ❌ Bad - don't use data-testid
const button = screen.getByTestId('submit-button')
```

### Component Testing Queries

Each component's reference file includes a "Testing Queries" section showing the accessible queries available for that component. Refer to these when writing tests.

## Component Discovery

When users ask "What components are available for X?":

1. Refer to the Component Categories section above
2. For detailed information about specific components in a category, read the relevant reference files
3. Suggest related components that might be useful together

## Building with Axiom

When helping users build UI with axiom:

1. **Start with layout**: Box for general layouts, Card for grouped content with elevation
2. **Add content components**: Text, Heading, Icon
3. **Add interactive components**: Button, form fields, overlays
4. **Apply common patterns**: Use shared types like Size, Intent, Variant for consistency
5. **Prefer uncontrolled components** unless there's a specific need for controlled state
6. **Use props for styling** instead of custom CSS

Example structure:

```typescript
import { Card, CardHeader, CardContent, Heading, Text, Button, Box } from '@gorgias/axiom'

<Card elevation="mid">
  <CardHeader>
    <Heading size="xl">Title</Heading>
  </CardHeader>
  <CardContent>
    <Box gap="md" flexDirection="column">
      <Text>Content here</Text>
      <Box gap="sm" flexDirection="row">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Action</Button>
      </Box>
    </Box>
  </CardContent>
</Card>
```

## Type Safety

All components are fully typed with TypeScript. When helping users:

1. Always include proper TypeScript types in examples
2. Reference the exported types (e.g., `ButtonProps`, `ModalProps`)
3. Show how to use discriminated unions (e.g., `Button` with `as="button"` vs `as="a"`)
4. Explain generic type parameters for components like `List<T>` and `Table<T>`
5. Use string values for enums, not enum constants
