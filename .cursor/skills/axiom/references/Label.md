# Label

Standalone label component for form fields and other labeled elements.

## Import

```typescript
import { Label } from '@gorgias/axiom'
```

## Props

### LabelProps

Extends `TextProps` and `LabelHTMLAttributes<HTMLLabelElement>`.

```typescript
type LabelProps = {
    children?: ReactNode // Label text or content
    size?: 'sm' | 'md' // Label size. Default: 'md'
    variant?: TextVariant // Text variant. Default: 'medium'
    overflow?: 'ellipsis' | 'wrap' | 'break-word' // Overflow behavior
    isDisabled?: boolean // Whether label is disabled
    isRequired?: boolean // Whether field is required (shows asterisk)
    isInvalid?: boolean // Whether field is invalid
    as?: 'label' | 'span' // Element type. Default: 'label'
}
```

## Usage

### Basic Label

```typescript
<Label>Email address</Label>
```

### Required Label

Shows an asterisk next to the label text.

```typescript
<Label isRequired>Email address</Label>
```

### Disabled Label

```typescript
<Label isDisabled>Locked field</Label>
```

### Invalid Label

```typescript
<Label isInvalid>Error field</Label>
```

### Sizes

```typescript
<Label size="sm">Small label</Label>
<Label size="md">Medium label</Label>
```

### Text Variants

```typescript
<Label variant="regular">Regular weight</Label>
<Label variant="medium">Medium weight</Label>
<Label variant="bold">Bold weight</Label>
```

### Overflow Behavior

```typescript
// Truncate with ellipsis
<Label overflow="ellipsis">
  Very long label text that will be truncated with an ellipsis
</Label>

// Wrap text
<Label overflow="wrap">
  Long label text that will wrap to multiple lines
</Label>

// Break words
<Label overflow="break-word">
  VeryLongWordThatWillBreakToFitTheContainer
</Label>
```

### As Span

Use `as="span"` when the label needs to be inline or part of another element.

```typescript
<Label as="span">Inline label</Label>
```

### With Form Field

```typescript
<div>
  <Label htmlFor="email-input" isRequired>
    Email address
  </Label>
  <input id="email-input" type="email" />
</div>
```

### Empty Label

If children is empty, the component returns null and renders nothing.

```typescript
<Label>{undefined}</Label>  // Renders nothing
```

## States

Label supports multiple visual states:

- **Default**: Standard appearance
- **Disabled**: Reduced opacity
- **Invalid**: Error styling
- **Required**: Shows asterisk indicator

## Related Components

- **TextField**: Uses Label internally
- **DateField**: Uses Label internally
- **TimeField**: Uses Label internally
- **SelectField**: Uses Label internally
- **CheckBoxField**: Uses Label internally
- **Text**: For general text content

## Testing Queries

```typescript
// By text
screen.getByText('Email address')

// By label
screen.getByLabelText('required')

// Check for required indicator
expect(screen.getByText('*')).toBeInTheDocument()
expect(screen.getByLabelText('required')).toBeInTheDocument()

// Check states
const labelElement = screen.getByText('Email address').closest('label')
expect(labelElement).toHaveClass('isDisabled')
```
