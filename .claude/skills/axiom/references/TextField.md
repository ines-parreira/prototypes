# TextField

Form field component for text input with label, input, and optional caption/error message.

## Import

```typescript
import { TextField } from '@gorgias/axiom'
```

## Props

### TextFieldProps

Extends `FieldProps<string>` and `InputProps`.

```typescript
type TextFieldProps = {
    // Field props (from FieldProps<string>)
    label?: string // Label text above field
    error?: string | ReactNode // Error message/element when validation fails
    caption?: string // Helper text below field
    isDisabled?: boolean // Whether field is disabled
    isRequired?: boolean // Whether field is required
    isInvalid?: boolean // Whether field is in error state

    // Value props (controlled/uncontrolled)
    value?: string // Current value (controlled)
    defaultValue?: string // Initial value (uncontrolled)
    onChange?: (value: string) => void // Value change callback

    // Input props
    type?: 'text' | 'password' | 'search' // Default: 'text'
    size?: 'sm' | 'md' // Default: 'md'
    variant?: 'primary' | 'secondary' // Default: 'primary'
    placeholder?: string // Placeholder text
    autoFocus?: boolean // Auto-focus on mount
    isFocused?: boolean // Force focused appearance

    // Slots
    leadingSlot?: IconName | ReactNode // Icon/content before text
    trailingSlot?: IconName | ReactNode // Icon/content after text

    // Ref
    inputRef?: RefObject<HTMLInputElement> // Ref to input element
}
```

## Usage

### Basic TextField

```typescript
// Uncontrolled (recommended)
<TextField
  label="Email"
  placeholder="Enter your email"
  defaultValue=""
  onChange={(value) => console.log(value)}
/>

// Controlled
const [email, setEmail] = useState('')
<TextField
  label="Email"
  value={email}
  onChange={setEmail}
/>
```

### With Caption

```typescript
<TextField
  label="Password"
  type="password"
  caption="Must be at least 8 characters"
/>
```

### With Error

```typescript
// String error
<TextField
  label="Email"
  error="Invalid email address"
/>

// Error with link
<TextField
  label="Email"
  error={<>Invalid email. <a href="/help">Learn more</a></>}
/>
```

### Required Field

```typescript
<TextField
  label="Name"
  isRequired
/>
```

### With Icons/Slots

```typescript
// Icon slots
<TextField
  label="Search"
  leadingSlot="search"
  trailingSlot="close"
/>

// Custom slots
<TextField
  label="Amount"
  leadingSlot={<Text>$</Text>}
  trailingSlot={<Text>USD</Text>}
/>
```

### Sizes

```typescript
<TextField label="Small" size="sm" />
<TextField label="Medium" size="md" />
```

### Variants

```typescript
<TextField label="Primary" variant="primary" />
<TextField label="Secondary" variant="secondary" />
```

### Input Types

```typescript
<TextField label="Text" type="text" />
<TextField label="Password" type="password" />
<TextField label="Search" type="search" />
```

### Disabled State

```typescript
<TextField label="Disabled" isDisabled />
```

### Invalid State

```typescript
<TextField
  label="Email"
  isInvalid
  error="This field is required"
/>
```

## States

TextField supports multiple visual states:

- **Default**: Standard appearance
- **Disabled**: Non-interactive with reduced opacity
- **Invalid**: Error styling without error message
- **Required**: Shows asterisk next to label
- **Error**: Invalid state with error message displayed

## Related Components

- **NumberField**: For numeric input with increment/decrement controls
- **SearchField**: Specialized text field for search with clear button
- **DateField**: For date input
- **TimeField**: For time input
- **SelectField**: For selecting from predefined options
- **Label**: Standalone label component

## Testing Queries

```typescript
// By role
screen.getByRole('textbox')
screen.getByRole('textbox', { name: 'Email' })

// By label
screen.getByLabelText('Email')

// By placeholder
screen.getByPlaceholderText('Enter your email')

// Check states
expect(screen.getByRole('textbox')).toBeDisabled()
expect(screen.getByRole('textbox')).toHaveAttribute('aria-disabled', 'true')

// Interact
const input = screen.getByRole('textbox')
fireEvent.change(input, { target: { value: 'test@example.com' } })
expect(input).toHaveValue('test@example.com')
```
