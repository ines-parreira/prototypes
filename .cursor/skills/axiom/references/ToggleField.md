# ToggleField

Form field component for boolean selection with a toggle/switch input.

## Import

```typescript
import { ToggleField } from '@gorgias/axiom'
```

## Props

### ToggleFieldProps

Extends `FieldProps<boolean>`.

```typescript
type ToggleFieldProps = {
    // Field props (from FieldProps<boolean>)
    label?: string // Label text displayed next to switch
    error?: string | ReactNode // Error message/element when validation fails
    caption?: string // Helper text below field
    isDisabled?: boolean // Whether field is disabled
    isRequired?: boolean // Whether field is required
    isInvalid?: boolean // Whether field is in error state

    // Value props (controlled/uncontrolled)
    value?: boolean // Current value (controlled)
    defaultValue?: boolean // Initial value (uncontrolled)
    onChange?: (value: boolean) => void // Value change callback
}
```

## Usage

### Basic ToggleField

```typescript
// Uncontrolled (recommended)
<ToggleField
  label="Enable notifications"
  defaultValue={false}
  onChange={(value) => console.log(value)}
/>

// Controlled
const [enabled, setEnabled] = useState(false)
<ToggleField
  label="Enable notifications"
  value={enabled}
  onChange={setEnabled}
/>
```

### With Caption

```typescript
<ToggleField
  label="Dark mode"
  caption="Switch between light and dark themes"
  defaultValue={false}
/>
```

### With Error

```typescript
<ToggleField
  label="Accept terms"
  error="You must accept the terms to continue"
  isInvalid
/>
```

### Required Field

```typescript
<ToggleField
  label="Accept privacy policy"
  isRequired
/>
```

### Disabled State

```typescript
<ToggleField
  label="Feature disabled"
  isDisabled
  value={true}
/>
```

## Visual States

ToggleField provides visual feedback for different states:

- **Off**: Switch on the left, gray background
- **On**: Switch on the right, colored background
- **Disabled**: Reduced opacity, non-interactive
- **Invalid/Error**: Error styling with message

## Common Patterns

### Feature Toggles

```typescript
function Settings() {
  const [notifications, setNotifications] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <Box flexDirection="column" gap="md">
      <ToggleField
        label="Push notifications"
        value={notifications}
        onChange={setNotifications}
      />
      <ToggleField
        label="Email alerts"
        value={emailAlerts}
        onChange={setEmailAlerts}
      />
      <ToggleField
        label="Dark mode"
        value={darkMode}
        onChange={setDarkMode}
      />
    </Box>
  )
}
```

### With Dependent Fields

```typescript
function AdvancedSettings() {
  const [advanced, setAdvanced] = useState(false)

  return (
    <>
      <ToggleField
        label="Show advanced options"
        value={advanced}
        onChange={setAdvanced}
      />
      {advanced && (
        <Box flexDirection="column" gap="sm" mt="md">
          <TextField label="Advanced setting 1" />
          <TextField label="Advanced setting 2" />
        </Box>
      )}
    </>
  )
}
```

## Related Components

- **CheckBoxField**: For boolean selection with checkbox UI
- **RadioGroup**: For single selection from multiple options
- **SelectField**: For single selection from dropdown

## Testing Queries

```typescript
// By role
screen.getByRole('switch')
screen.getByRole('switch', { name: 'Enable notifications' })

// By label
screen.getByLabelText('Enable notifications')

// Check state
const toggle = screen.getByRole('switch')
expect(toggle).toBeChecked()
expect(toggle).not.toBeChecked()
expect(toggle).toBeDisabled()

// Interact
const toggle = screen.getByRole('switch')
await user.click(toggle)
expect(onChange).toHaveBeenCalledWith(true)
```
