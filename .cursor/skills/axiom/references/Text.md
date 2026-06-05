# Text

Typography component for rendering body text with various sizes, weights, and styles.

## Import

```typescript
import { Text } from '@gorgias/axiom'
```

## Props

### TextProps

```typescript
type TextProps<E extends TextAs = 'span'> = {
    children: ReactNode // Content to display
    variant?: 'regular' | 'bold' | 'medium' | 'italic' // Default: 'regular'
    align?: 'left' | 'start' | 'center' | 'justify' | 'right' | 'end' // Default: 'left'
    size?: 'xs' | 'sm' | 'md' // Default: 'md'
    as?: 'p' | 'span' // Default: 'span'
    overflow?: 'ellipsis' // Truncate with ellipsis
    wrap?: 'wrap' | 'nowrap' | 'balance' | 'pretty' // Default: 'wrap'
    className?: string
} & Omit<React.ComponentPropsWithoutRef<E>, 'className' | 'style'>
```

## Usage

### Basic Text

```typescript
// Default: regular md span
<Text>Hello text!</Text>
```

### Sizes

```typescript
<Text size="xs">Extra small text</Text>
<Text size="sm">Small text</Text>
<Text size="md">Medium text</Text>
```

### Variants

```typescript
<Text variant="regular">Regular weight</Text>
<Text variant="medium">Medium weight</Text>
<Text variant="bold">Bold weight</Text>
<Text variant="italic">Italic style</Text>
```

### Alignment

```typescript
<Text align="left">Left aligned</Text>
<Text align="center">Center aligned</Text>
<Text align="right">Right aligned</Text>
<Text align="justify">Justified text</Text>
<Text align="start">Start aligned (RTL-aware)</Text>
<Text align="end">End aligned (RTL-aware)</Text>
```

### HTML Element (as)

```typescript
// Render as span (default, inline)
<Text as="span">Inline text</Text>

// Render as paragraph (block-level)
<Text as="p">Paragraph text</Text>
```

### Overflow Ellipsis

```typescript
// Truncate with ellipsis when text overflows
<Text overflow="ellipsis">
  This is a very long text that will be truncated with an ellipsis
</Text>
```

### Text Wrapping

```typescript
<Text wrap="wrap">Text wraps normally</Text>
<Text wrap="nowrap">Text stays on single line</Text>
<Text wrap="balance">Balanced line lengths</Text>
<Text wrap="pretty">Avoid orphaned words</Text>
```

### Combining Props

```typescript
// Bold, large, centered paragraph
<Text
  as="p"
  variant="bold"
  size="md"
  align="center"
>
  Important message
</Text>

// Small, italic, truncated span
<Text
  variant="italic"
  size="sm"
  overflow="ellipsis"
>
  Additional details...
</Text>
```

## Variants

Text supports four style variants:

- **regular**: Standard font weight (400) - Default
- **medium**: Medium font weight (500) for moderate emphasis
- **bold**: Heavy font weight (700) for strong emphasis
- **italic**: Slanted text style for subtle emphasis

Note: `bold` and `italic` variants render with semantic HTML elements (`<strong>` and `<em>`).

## Text Wrapping Behavior

- **wrap**: Normal wrapping across multiple lines (default)
- **nowrap**: Prevents wrapping, keeps text on single line
- **balance**: Balances text across lines for uniform length
- **pretty**: Avoids orphaned words at end of blocks

## Related Components

- **Heading**: For headings and titles (h1-h5)
- **Label**: For form field labels

## Testing Queries

```typescript
// Query by text content
screen.getByText('Hello text!')

// Check element type
const text = screen.getByText('Hello text!')
expect(text.tagName).toBe('SPAN')

// Check styles
expect(text).toHaveClass('typography-regular-md')
expect(text).toHaveStyle('text-align: left')

// For bold variant
const boldText = screen.getByText('Bold text')
expect(boldText.tagName).toBe('STRONG')

// For italic variant
const italicText = screen.getByText('Italic text')
expect(italicText.tagName).toBe('EM')

// As paragraph
const paragraph = screen.getByText('Paragraph text')
expect(paragraph.tagName).toBe('P')
```
