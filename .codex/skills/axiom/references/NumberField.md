# NumberField

Form field component for numeric input with increment/decrement stepper buttons.

## Import

```typescript
import { NumberField } from '@gorgias/axiom'
```

## Props

### NumberFieldProps

Extends `FieldProps<number>` and `InputProps`.

```typescript
type NumberFieldProps = {
    // Field props (from FieldProps<number>)
    label?: string // Label text above field
    error?: string | ReactNode // Error message/element when validation fails
    caption?: string // Helper text below field
    isDisabled?: boolean // Whether field is disabled
    isRequired?: boolean // Whether field is required
    isInvalid?: boolean // Whether field is in error state

    // Value props (controlled/uncontrolled)
    value?: number // Current value (controlled)
    defaultValue?: number // Initial value (uncontrolled)
    onChange?: (value: number) => void // Value change callback

    // Input props
    size?: 'sm' | 'md' // Default: 'md'
    variant?: 'primary' | 'secondary' // Default: 'primary'
    placeholder?: string // Placeholder text
    autoFocus?: boolean // Auto-focus on mount
    isFocused?: boolean // Force focused appearance

    // Number-specific props
    minValue?: number // Minimum allowed value
    maxValue?: number // Maximum allowed value
    step?: number // Increment/decrement step amount
    formatOptions?: Intl.NumberFormatOptions // Number formatting options

    // Slots
    leadingSlot?: IconName | ReactNode // Icon/content before input
    trailingSlot?: IconName | ReactNode // Icon/content after input (overrides stepper buttons)

    // Ref
    inputRef?: RefObject<HTMLInputElement> // Ref to input element
}
```

## Usage

### Basic NumberField

```typescript
// Uncontrolled (recommended)
<NumberField
  label="Quantity"
  defaultValue={1}
  onChange={(value) => console.log(value)}
/>

// Controlled
const [quantity, setQuantity] = useState(1)
<NumberField
  label="Quantity"
  value={quantity}
  onChange={setQuantity}
/>
```

### With Min/Max Values

```typescript
<NumberField
  label="Age"
  minValue={0}
  maxValue={120}
  defaultValue={25}
/>
```

### With Step

```typescript
// Step by 5
<NumberField
  label="Price"
  step={5}
  minValue={0}
  defaultValue={10}
/>

// Decimal steps
<NumberField
  label="Rating"
  step={0.5}
  minValue={0}
  maxValue={5}
  defaultValue={4.5}
/>
```

### With Format Options

```typescript
// Currency formatting
<NumberField
  label="Amount"
  formatOptions={{
    style: 'currency',
    currency: 'USD'
  }}
  defaultValue={100}
/>

// Percentage
<NumberField
  label="Discount"
  formatOptions={{
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }}
  defaultValue={0.15}
/>
```

### With Caption and Error

```typescript
<NumberField
  label="Port Number"
  caption="Enter a port between 1024 and 65535"
  minValue={1024}
  maxValue={65535}
/>

<NumberField
  label="Quantity"
  error="Quantity must be greater than 0"
  minValue={1}
/>
```

### Required Field

```typescript
<NumberField
  label="Number of items"
  isRequired
/>
```

### With Leading Slot

```typescript
<NumberField
  label="Price"
  leadingSlot={<Text>$</Text>}
  defaultValue={100}
/>
```

### Custom Trailing Slot

```typescript
// Override stepper buttons
<NumberField
  label="Weight"
  trailingSlot={<Text>kg</Text>}
  defaultValue={75}
/>
```

### Sizes

```typescript
<NumberField label="Small" size="sm" />
<NumberField label="Medium" size="md" />
```

### Variants

```typescript
<NumberField label="Primary" variant="primary" />
<NumberField label="Secondary" variant="secondary" />
```

### Disabled State

```typescript
<NumberField label="Disabled" isDisabled defaultValue={10} />
```

## Stepper Buttons

NumberField includes increment/decrement buttons by default in the trailing slot. Users can:

- Click the up arrow to increment
- Click the down arrow to decrement
- Use arrow keys when focused
- Type values directly

The stepper buttons respect `minValue`, `maxValue`, and `step` constraints.

## Number Validation

- Only accepts numeric input
- Automatically filters out non-numeric characters
- Respects min/max bounds
- Applies step increments when using stepper buttons

## Related Components

- **TextField**: For text input
- **SearchField**: For search input
- **DateField**: For date input
- **TimeField**: For time input

## Testing Queries

```typescript
// By role
screen.getByRole('textbox')
screen.getByRole('textbox', { name: 'Quantity' })

// By label
screen.getByLabelText('Quantity')

// By placeholder
screen.getByPlaceholderText('Enter quantity')

// Increment/decrement buttons
screen.getByRole('button', { name: 'Increment' })
screen.getByRole('button', { name: 'Decrement' })

// Check states
expect(screen.getByRole('textbox')).toBeDisabled()

// Interact
const input = screen.getByRole('textbox')
await user.click(input)
await user.keyboard('123')
await user.keyboard('[Enter]')
expect(onChange).toHaveBeenCalledWith(123)
```
