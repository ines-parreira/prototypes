# Box

Fundamental layout primitive providing flexbox capabilities with utility props for spacing, sizing, and layout control.

## Import

```typescript
import { Box } from '@gorgias/axiom'
```

## Props

### BoxProps

Extends `LayoutProps` and `FlexProps`.

```typescript
type BoxProps = {
    children?: ReactNode
    className?: string

    // Spacing props (shorthand)
    p?: SizeValue // padding (all sides)
    pt?: SizeValue // paddingTop
    pr?: SizeValue // paddingRight
    pb?: SizeValue // paddingBottom
    pl?: SizeValue // paddingLeft
    m?: SizeValue // margin (all sides)
    mt?: SizeValue // marginTop
    mr?: SizeValue // marginRight
    mb?: SizeValue // marginBottom
    ml?: SizeValue // marginLeft

    // Spacing props (full names)
    padding?: SizeValue
    paddingTop?: SizeValue
    paddingRight?: SizeValue
    paddingBottom?: SizeValue
    paddingLeft?: SizeValue
    margin?: SizeValue
    marginTop?: SizeValue
    marginRight?: SizeValue
    marginBottom?: SizeValue
    marginLeft?: SizeValue

    // Sizing props (shorthand)
    w?: SizeValue // width
    h?: SizeValue // height

    // Sizing props (full names)
    width?: SizeValue
    height?: SizeValue
    minWidth?: SizeValue
    maxWidth?: SizeValue
    minHeight?: SizeValue
    maxHeight?: SizeValue

    // Flexbox props
    display?: CSSProperties['display'] // Default: 'flex'
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    flexWrap?: CSSProperties['flexWrap']
    justifyContent?:
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'space-between'
        | 'space-around'
        | 'space-evenly'
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
    alignSelf?: CSSProperties['alignSelf']
    flex?: CSSProperties['flex']
    flexGrow?: CSSProperties['flexGrow']
    flexShrink?: CSSProperties['flexShrink']
    flexBasis?: CSSProperties['flexBasis']
    gap?: SizeValue
    rowGap?: SizeValue
    columnGap?: SizeValue

    // Data attributes
    'data-*'?: unknown
}

// SizeValue accepts: Size enum ('sm', 'md', etc.), numbers (pixels), or CSS units
type SizeValue =
    | Size
    | number
    | `${number}px`
    | `${number}em`
    | `${number}rem`
    | `${number}vh`
    | `${number}vw`
    | `${number}%`
    | `calc(${string})`
```

## Usage

### Basic Container

```typescript
<Box p="md" gap="sm">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Box>
```

### Flexbox Layouts

```typescript
// Horizontal layout
<Box flexDirection="row" gap="md" alignItems="center">
  <Icon name="check" />
  <Text>Success</Text>
</Box>

// Vertical stack
<Box flexDirection="column" gap="sm">
  <Heading size="lg">Title</Heading>
  <Text>Content here</Text>
  <Button>Action</Button>
</Box>

// Space between
<Box flexDirection="row" justifyContent="space-between" alignItems="center">
  <Text>Left</Text>
  <Button>Right</Button>
</Box>

// Centered content
<Box flexDirection="column" justifyContent="center" alignItems="center" h="100vh">
  <Text>Centered</Text>
</Box>
```

### Spacing

```typescript
// Shorthand spacing
<Box p="lg" m="md">Content</Box>
<Box pt="sm" pb="lg" pl="md" pr="md">Content</Box>

// Full name spacing
<Box padding="lg" margin="md">Content</Box>

// Mixed size values
<Box p="md" pt={24} pb="2rem">Content</Box>
```

### Sizing

```typescript
// Shorthand sizing
<Box w="100%" h={400}>Content</Box>

// Full name sizing
<Box width="100%" maxWidth="1200px" minHeight="400px">
  Content
</Box>

// Responsive sizing
<Box w="100%" maxWidth="1200px" m="auto">
  Centered container
</Box>

// Mixed size values
<Box w="100%" h="50vh">Full width, half viewport height</Box>
```

### Gap

```typescript
// Uniform gap
<Box gap="md" flexDirection="column">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</Box>

// Row/column specific gap
<Box rowGap="lg" columnGap="sm" flexWrap="wrap">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</Box>
```

### Display Override

```typescript
// Override default flex display
<Box display="block" p="md">
  Block-level box
</Box>

<Box display="inline-flex" gap="sm">
  Inline flex box
</Box>
```

### Complex Layouts

```typescript
// Card-like layout
<Box
  p="lg"
  gap="md"
  flexDirection="column"
  maxWidth="600px"
  m="auto"
>
  <Box flexDirection="row" justifyContent="space-between" alignItems="center">
    <Heading size="lg">Header</Heading>
    <Button icon={<Icon name="close" />} />
  </Box>
  <Box flexDirection="column" gap="sm">
    <Text>Body content</Text>
  </Box>
  <Box flexDirection="row" gap="sm" justifyContent="flex-end">
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </Box>
</Box>

// Grid-like layout with flexbox
<Box flexDirection="row" flexWrap="wrap" gap="md">
  <Box w="calc(50% - 8px)">Column 1</Box>
  <Box w="calc(50% - 8px)">Column 2</Box>
  <Box w="calc(50% - 8px)">Column 3</Box>
  <Box w="calc(50% - 8px)">Column 4</Box>
</Box>
```

## Size Value Types

Box accepts `SizeValue` for all spacing and sizing props:

```typescript
// Size enum (from common types)
<Box p="sm" gap="md" />

// Numbers (interpreted as pixels)
<Box p={16} gap={24} />

// CSS units
<Box p="1rem" w="100%" h="50vh" />
<Box maxWidth="1200px" gap="2em" />

// Calc expressions
<Box w="calc(100% - 32px)" />
```

## Testing Queries

```typescript
// Box doesn't have a semantic role, query by test attributes or children
const box = container.querySelector('[data-name="box"]')

// Or query children inside
within(container).getByText('Content inside box')

// Test styles
expect(box).toHaveStyle('display: flex')
expect(box).toHaveStyle('padding: 16px')
expect(box).toHaveStyle('flexDirection: column')
```

## Related Components

- **Card**: Box with elevation styling for grouped content
- **PageHeader**: Specialized layout for page headers
- **All form fields**: Use Box for custom form layouts

## Best Practices

1. **Use Box instead of custom CSS** - Box props cover most layout needs
2. **Prefer shorthand props** - Use `p`, `m`, `w`, `h` for brevity
3. **Use Size enum values** - `"sm"`, `"md"`, `"lg"` for consistency with design system
4. **Combine with other layout components** - Nest Box components for complex layouts
5. **Default is flex** - No need to specify `display="flex"`, it's the default

## Common Patterns

```typescript
// Vertical stack with spacing
<Box flexDirection="column" gap="md">...</Box>

// Horizontal row with alignment
<Box flexDirection="row" alignItems="center" gap="sm">...</Box>

// Full-width container with max-width
<Box w="100%" maxWidth="1200px" m="auto">...</Box>

// Padded container
<Box p="lg">...</Box>

// Space between layout
<Box flexDirection="row" justifyContent="space-between">...</Box>
```
