# CheckBoxField

Form field component for boolean selection with checkbox input.

## Import

```typescript
import { CheckBoxField } from '@gorgias/axiom'
```

## Props

### CheckBoxFieldProps

Extends `FieldProps<boolean>`.

```typescript
type CheckBoxFieldProps = {
    // Field props
    label?: string // Label text for the checkbox
    error?: string | ReactNode // Error message/element when validation fails
    caption?: string // Helper text below field
    isDisabled?: boolean // Whether field is disabled
    isRequired?: boolean // Whether field is required
    isInvalid?: boolean // Whether field is in error state

    // Value props (controlled/uncontrolled)
    value?: boolean // Current value (controlled)
    defaultValue?: boolean // Initial value (uncontrolled)
    onChange?: (value: boolean) => void // Value change callback

    // CheckBox specific
    isIndeterminate?: boolean // Whether checkbox is in indeterminate state
    direction?: 'left' | 'right' // Label position relative to checkbox. Default: 'left'

    // Accessibility
    'aria-label'?: string // Accessible label when label prop is not provided
}
```

## Usage

### Basic CheckBoxField

```typescript
// Uncontrolled (recommended)
<CheckBoxField
  label="I agree to the terms"
  defaultValue={false}
  onChange={(value) => console.log(value)}
/>

// Controlled
const [accepted, setAccepted] = useState(false)
<CheckBoxField
  label="I agree to the terms"
  value={accepted}
  onChange={setAccepted}
/>
```

### With Caption

```typescript
<CheckBoxField
  label="Enable notifications"
  caption="Receive email updates about your account"
/>
```

### With Error

```typescript
// String error
<CheckBoxField
  label="I agree to the terms"
  error="You must accept the terms to continue"
/>

// Error with link
<CheckBoxField
  label="I agree to the terms"
  error={<>You must accept the terms. <a href="/terms">Read terms</a></>}
/>
```

### Required Field

```typescript
<CheckBoxField
  label="I accept the terms and conditions"
  isRequired
/>
```

### Disabled State

```typescript
<CheckBoxField
  label="Disabled option"
  isDisabled
/>
```

### Invalid State

```typescript
<CheckBoxField
  label="I agree"
  isInvalid
  error="This field is required"
/>
```

### Indeterminate State

The indeterminate state is useful for "select all" checkboxes where some but not all items are selected.

```typescript
const [selectedItems, setSelectedItems] = useState([1, 3])
const allItems = [1, 2, 3, 4, 5]

<CheckBoxField
  label="Select all"
  value={selectedItems.length === allItems.length}
  isIndeterminate={selectedItems.length > 0 && selectedItems.length < allItems.length}
  onChange={(checked) => {
    setSelectedItems(checked ? allItems : [])
  }}
/>
```

### Label Direction

```typescript
// Label on the left (default)
<CheckBoxField
  label="Option 1"
  direction="left"
/>

// Label on the right
<CheckBoxField
  label="Option 2"
  direction="right"
/>
```

### Without Visible Label

When using `aria-label` without a visible label, ensure the checkbox is still accessible.

```typescript
<CheckBoxField
  aria-label="Accept terms and conditions"
  value={accepted}
  onChange={setAccepted}
/>
```

## States

CheckBoxField supports multiple visual states:

- **Default**: Standard appearance
- **Checked**: Selected state
- **Unchecked**: Unselected state
- **Indeterminate**: Partial selection state (for "select all" scenarios)
- **Disabled**: Non-interactive with reduced opacity
- **Invalid**: Error styling without error message
- **Required**: Shows asterisk next to label
- **Error**: Invalid state with error message displayed

## Related Components

- **ToggleField**: Switch-style boolean input
- **RadioGroup**: For mutually exclusive selections
- **TextField**: For text input
- **Label**: Standalone label component

## Testing Queries

```typescript
// By role and name
screen.getByRole('checkbox', { name: 'I agree' })

// By label text
screen.getByText('I agree')

// Check states
expect(screen.getByRole('checkbox', { name: 'I agree' })).toBeDisabled()
expect(screen.getByRole('checkbox', { name: 'I agree' })).toHaveAttribute(
    'checked',
)
expect(screen.getByRole('checkbox', { name: 'I agree' })).not.toHaveAttribute(
    'checked',
)

// Interact
const checkbox = screen.getByRole('checkbox', { name: 'I agree' })
await userEvent.click(checkbox)
expect(onChange).toHaveBeenCalledWith(true)
```
