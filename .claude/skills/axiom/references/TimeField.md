# TimeField

Form field component for time input with hour, minute, and optional second/period segments.

## Import

```typescript
import { TimeValue } from 'react-aria-components'

import { TimeField } from '@gorgias/axiom'
```

## Props

### TimeFieldProps

Extends `FieldProps<TimeValue | null>` and `InputProps`.

```typescript
type TimeFieldProps = {
    // Field props
    label?: string // Label text above field
    error?: string | ReactNode // Error message/element when validation fails
    caption?: string // Helper text below field
    isDisabled?: boolean // Whether field is disabled
    isRequired?: boolean // Whether field is required
    isInvalid?: boolean // Whether field is in error state

    // Value props (controlled/uncontrolled)
    value?: TimeValue | null // Current time value (controlled)
    defaultValue?: TimeValue | null // Initial time value (uncontrolled)
    onChange?: (value: TimeValue | null) => void // Value change callback

    // Input props
    size?: 'sm' | 'md' // Input size. Default: 'md'
    variant?: 'primary' | 'secondary' // Input variant. Default: 'primary'
    isFocused?: boolean // Force focused appearance

    // Ref
    inputRef?: RefObject<HTMLInputElement> // Ref to input element
}
```

## Usage

### Basic TimeField

```typescript
import { Time } from '@internationalized/date'

// Uncontrolled (recommended)
<TimeField
  label="Start time"
  onChange={(time) => console.log(time)}
/>

// Controlled
const [startTime, setStartTime] = useState<TimeValue | null>(null)
<TimeField
  label="Start time"
  value={startTime}
  onChange={setStartTime}
/>
```

### With Caption

```typescript
<TimeField
  label="Meeting time"
  caption="Enter the time in 12-hour format"
/>
```

### With Error

```typescript
<TimeField
  label="End time"
  error="End time must be after start time"
/>
```

### Required Field

```typescript
<TimeField
  label="Appointment time"
  isRequired
/>
```

### Disabled State

```typescript
<TimeField
  label="Locked time"
  isDisabled
/>
```

### Invalid State

```typescript
<TimeField
  label="Time"
  isInvalid
  error="This field is required"
/>
```

### Sizes

```typescript
<TimeField label="Small" size="sm" />
<TimeField label="Medium" size="md" />
```

### Variants

```typescript
<TimeField label="Primary" variant="primary" />
<TimeField label="Secondary" variant="secondary" />
```

### Focused State

```typescript
<TimeField
  label="Time"
  isFocused
/>
```

### Initial Value

```typescript
import { Time } from '@internationalized/date'

const initialTime = new Time(14, 30)  // 2:30 PM

<TimeField
  label="Start time"
  defaultValue={initialTime}
/>
```

### 24-Hour Format

```typescript
<TimeField
  label="Military time"
  hourCycle={24}
/>
```

## States

TimeField supports multiple visual states:

- **Default**: Standard appearance
- **Disabled**: Non-interactive with reduced opacity
- **Invalid**: Error styling without error message
- **Required**: Shows asterisk next to label
- **Error**: Invalid state with error message displayed
- **Focused**: Active input styling

## Related Components

- **DateField**: For date input with integrated picker
- **TextField**: For text input
- **NumberField**: For numeric input
- **Label**: Standalone label component

## Testing Queries

```typescript
// By label
screen.getByText('Test')

// By time segments
screen.getByRole('spinbutton', { name: /hour/ })
screen.getByRole('spinbutton', { name: /minute/ })
screen.getByRole('spinbutton', { name: /AM\/PM/ })

// Type in segments
const hourInput = screen.getByRole('spinbutton', { name: /hour/ })
const minuteInput = screen.getByRole('spinbutton', { name: /minute/ })
const amPmInput = screen.getByRole('spinbutton', { name: /AM\/PM/ })

await userEvent.click(hourInput)
await userEvent.keyboard('12')
await userEvent.click(minuteInput)
await userEvent.keyboard('30')
await userEvent.click(amPmInput)
await userEvent.keyboard('AM')

// Check value
expect(onChange).toHaveBeenCalledWith(
    expect.objectContaining({
        hour: 12,
        minute: 30,
        second: 0,
        millisecond: 0,
    }),
)

// Check states
expect(hourInput).toBeDisabled()
expect(minuteInput).toBeDisabled()
expect(amPmInput).toBeDisabled()
```
