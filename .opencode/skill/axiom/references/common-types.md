# Common Types Reference

Shared TypeScript types and enums used across all @gorgias/axiom components.

## Import Path

```typescript
import { Color /* ... */, Intent, Size, Variant } from '@gorgias/axiom'
```

All common types are exported from the main package entry point.

## Visual Style Types

### Variant

Visual style variants for components indicating hierarchy and emphasis.

**Type:** `'primary'` | `'secondary'` | `'tertiary'`

- **`primary`**: Main action style with high emphasis
- **`secondary`**: Supporting action style with medium emphasis
- **`tertiary`**: Subtle action style with low emphasis

```typescript
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="tertiary">Learn More</Button>
```

### Intent

Semantic intent of an action or component.

**Type:** `'regular'` | `'destructive'` | `'ai'`

- **`regular`**: Standard, neutral actions
- **`destructive`**: Dangerous or irreversible actions (e.g., delete, remove)
- **`ai`**: AI-powered or automated actions

```typescript
<Button intent="regular">Edit</Button>
<Button intent="destructive">Delete</Button>
<Button intent="ai">Generate with AI</Button>
```

## Size Scale

### Size

Predefined size scale for consistent component sizing.

**Type:** `'xxxxs'` | `'xxxs'` | `'xxs'` | `'xs'` | `'sm'` | `'md'` | `'lg'` | `'xl'` | `'xxl'` | `'xxxl'`

Most components use a subset of this scale (typically `'sm'` | `'md'`).

```typescript
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<TextField size="lg" label="Large Input" />
```

### SizeValue

Flexible size value type that accepts Size enum, numbers (pixels), or CSS units.

**Type:** `Size | number | '${number}px' | '${number}em' | '${number}rem' | '${number}vh' | '${number}vw' | '${number}%' | 'calc(${string})'`

Used for spacing and sizing props on Box, Card, and other layout components.

```typescript
// Size enum
<Box p="md" gap="sm" />

// Number (pixels)
<Box w={400} h={300} />

// CSS units
<Box w="100%" maxWidth="1200px" />
<Box h="50vh" />
<Box gap="1.5rem" />
```

## Color Types

### Color

Predefined color palette for components supporting multiple color variants.

**Type:** `'ai'` | `'blue'` | `'coral'` | `'fuchsia'` | `'green'` | `'grey'` | `'red'` | `'orange'` | `'purple'` | `'teal'` | `'yellow'`

```typescript
<Tag color="blue">Status</Tag>
<Dot color="green" />
<Banner color="red">Error message</Banner>
```

### ColorValue

Flexible color value type accepting Color enum, CSS variables, or hex codes.

**Type:** `Color | 'var(--${string})' | '#${string}'`

```typescript
// Color enum
<Text color="var(--grey-600)">Text</Text>

// CSS variable
<Text color="var(--color-text-primary)">Text</Text>

// Hex code
<Text color="#1a1a1a">Text</Text>
```

## Layout Types

### Elevation

Elevation levels for creating visual depth and hierarchy between containers.

**Type:** `'default'` | `'mid'` | `'high'`

Uses shadows and background colors to establish layering relationships.

- **`default`**: Base level with minimal elevation
- **`mid`**: Medium elevation for moderate depth
- **`high`**: Highest elevation for maximum prominence

```typescript
<Card elevation="default">Base card</Card>
<Card elevation="mid">Elevated card</Card>
<Card elevation="high">Floating card</Card>
```

### Orientation

Layout orientation for components.

**Type:** `'horizontal'` | `'vertical'`

- **`horizontal`**: Elements arranged side-by-side
- **`vertical`**: Elements arranged top-to-bottom

```typescript
<ButtonGroup orientation="horizontal">
  <Button>One</Button>
  <Button>Two</Button>
</ButtonGroup>
```

### Direction

Directional options for components.

**Type:** `'left'` | `'right'`

```typescript
<SidePanel direction="right">Panel content</SidePanel>
```

### Placement

Positioning options for floating elements like popovers, tooltips, and dropdowns.

**Type:** `'bottom left'` | `'bottom'` | `'bottom right'` | `'left'` | `'right'` | `'top'` | `'top left'` | `'top right'`

Defines where an element should appear relative to its anchor.

```typescript
<Tooltip placement="top">Tooltip content</Tooltip>
<Select placement="bottom left" />
```

### SlotPosition

Position of supplementary content slots within a component.

**Type:** `'leading'` | `'trailing'`

- **`leading`**: Start position (left in LTR, right in RTL)
- **`trailing`**: End position (right in LTR, left in RTL)

```typescript
<TextField
  leadingSlot={<Icon name="search" />}
  trailingSlot={<Icon name="clear" />}
/>
```

## Slot Types

### SlotProp\<P = never\>

Flexible type for `leadingSlot` / `trailingSlot` props. Accepts an icon name, a ReactNode, or (when the generic `P` is provided) a render function that receives component state.

```typescript
type SlotProp<P = never> = [P] extends [never]
    ? IconName | ReactNode
    : IconName | ReactNode | ((props: P) => ReactNode)
```

When `P` is `never` (default), only `IconName | ReactNode` is accepted. When a component provides render props (e.g., `ButtonRenderProps`), a function `(props: P) => ReactNode` is also accepted for dynamic slot content.

```typescript
// Icon name string - preferred
<Button leadingSlot="plus">Add</Button>

// Render function with component state
<Button leadingSlot={({ isLoading }) => isLoading ? <Loader /> : 'plus'}>
  Save
</Button>
```

### TriggerProp\<P\>

Type for custom trigger props on popover-based components.

```typescript
type TriggerProp<P> = ReactNode | ((props: P) => ReactNode)
```

See the "Custom Trigger Pattern" section in SKILL.md for usage details.

## Form Field Types

### FieldProps<T, C = undefined>

Common props for form field components. Extends `ValueProps<T, C>`.

```typescript
type FieldProps<T, C = undefined> = ValueProps<T, C> & {
    label?: string // Label text above field
    error?: string | ReactNode // Error message when validation fails
    caption?: string // Helper text below field
    isDisabled?: boolean // Whether field is disabled
    isRequired?: boolean // Whether field is required
    isInvalid?: boolean // Whether field is in error state
}
```

### ValueProps<T, C = undefined>

Props for managing value state (controlled and uncontrolled).

```typescript
type ValueProps<T, C = undefined> = {
    value?: T // Current value (controlled)
    defaultValue?: T // Initial value (uncontrolled)
    onChange?: (value: T, context?: C) => void // Value change callback
}
```

**Usage:**

- **Uncontrolled** (default): Use `defaultValue` + optional `onChange`
- **Controlled**: Use `value` + `onChange`

```typescript
// Uncontrolled
<TextField defaultValue="initial" onChange={(val) => console.log(val)} />

// Controlled
const [value, setValue] = useState("")
<TextField value={value} onChange={setValue} />
```

### VisibilityProps

Props for managing visibility state of overlays (modals, popovers, etc.).

```typescript
type VisibilityProps = {
    isOpen?: boolean // Current open state (controlled)
    defaultOpen?: boolean // Initial open state (uncontrolled)
    onOpenChange?: (nextState: boolean) => void // State change callback
}
```

**Usage:**

- **Uncontrolled** (default): Use `defaultOpen` + optional `onOpenChange`
- **Controlled**: Use `isOpen` + `onOpenChange`

```typescript
// Uncontrolled
<Modal defaultOpen={false} onOpenChange={(open) => console.log(open)}>...</Modal>

// Controlled
const [isOpen, setIsOpen] = useState(false)
<Modal isOpen={isOpen} onOpenChange={setIsOpen}>...</Modal>
```

### RangeValue<T>

Represents a range with start and end values.

```typescript
type RangeValue<T> = {
    start: T
    end: T
}
```

Used for date ranges, numeric ranges, and other range-based components.

```typescript
type DateRange = RangeValue<Date>
const range: DateRange = {
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
}

<DateRangePicker defaultValue={range} />
```

## Box Layout Types

### LayoutProps

Combined layout props including spacing and sizing utilities.

**Type:** `SpacingProps & SizingProps`

### SpacingProps

Spacing props for margins and padding. All accept `SizeValue`.

**Shorthand props:**

- `m`, `mt`, `mr`, `mb`, `ml` - margin (all, top, right, bottom, left)
- `p`, `pt`, `pr`, `pb`, `pl` - padding (all, top, right, bottom, left)

**Full names:**

- `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`
- `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`

```typescript
<Box p="md" mt="lg" mb="sm">Content</Box>
<Box padding="lg" marginTop={24}>Content</Box>
```

### SizingProps

Sizing props for width and height. All accept `SizeValue`.

**Shorthand:**

- `w`, `h` - width, height

**Full names:**

- `width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`

```typescript
<Box w="100%" h={400}>Content</Box>
<Box width="100%" maxWidth="1200px">Content</Box>
```

### FlexProps

Flexbox-related props for layout control.

**Standard CSS flexbox:**

- `flex`, `flexDirection`, `flexWrap`, `flexGrow`, `flexShrink`, `flexBasis`
- `justifyContent`, `alignItems`, `alignSelf`
- `display`

**Gap utilities (accept `SizeValue`):**

- `gap` - spacing between flex items
- `columnGap`, `rowGap` - column/row spacing

```typescript
<Box
  flexDirection="row"
  justifyContent="space-between"
  alignItems="center"
  gap="md"
>
  <Text>Left</Text>
  <Button>Right</Button>
</Box>
```

## Data Attributes

### DataAttributes

Type for HTML data attributes.

**Type:** `{ [key: 'data-${string}']: unknown }`

Accepts any attribute name starting with `data-` and any value type. Used for component identification, styling hooks, and storing custom metadata.

```typescript
<Button data-name="submit-button" data-analytics-id="cta-primary">
  Submit
</Button>
```

## Usage Notes

1. **Always use string values for enums**, not enum constants
2. **SizeValue and ColorValue** provide flexibility while maintaining type safety
3. **ValueProps and VisibilityProps** support both controlled and uncontrolled patterns
4. **Box layout props** eliminate need for custom CSS in most cases
5. **FieldProps** standardize form field APIs across all input components
