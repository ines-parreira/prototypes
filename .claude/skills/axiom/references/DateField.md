# DateField

Form field component for date input with an integrated calendar picker.

## Import

```typescript
import { ZonedDateTime } from '@internationalized/date'

import { DateField } from '@gorgias/axiom'
```

## Props

### DateFieldProps

Extends `FieldProps<ZonedDateTime | null, DatePickerChangeEventSource>`.

```typescript
type DateFieldProps = {
    // Field props
    label?: string // Label text above field
    error?: string | ReactNode // Error message/element when validation fails
    caption?: string // Helper text below field
    isDisabled?: boolean // Whether field is disabled
    isRequired?: boolean // Whether field is required
    isInvalid?: boolean // Whether field is in error state

    // Value props (controlled/uncontrolled)
    value?: ZonedDateTime | null // Current date value (controlled)
    defaultValue?: ZonedDateTime | null // Initial date value (uncontrolled)
    onChange?: (
        value: ZonedDateTime | null,
        source?: DatePickerChangeEventSource,
    ) => void

    // Date-specific props
    withTimePicker?: boolean // Include time selection in picker
    timeZone?: string // Timezone to use. Default: local timezone
    isDateUnavailable?: (date: DateValue) => boolean // Determine if date is unavailable

    // Picker props
    placement?: 'top' | 'bottom' | 'left' | 'right' // Picker placement. Default: 'bottom'
    shouldFlip?: boolean // Auto-flip when insufficient space. Default: true
    presets?:
        | DatePickerPresetTemplate
        | DatePickerPreset[]
        | ((props) => ReactNode) // Preset date options

    // Ref
    inputRef?: RefObject<HTMLInputElement> // Ref to input element
}
```

## Usage

### Basic DateField

```typescript
import { fromDate, getLocalTimeZone } from '@internationalized/date'

// Uncontrolled (recommended)
<DateField
  label="Start date"
  onChange={(date) => console.log(date)}
/>

// Controlled
const [startDate, setStartDate] = useState<ZonedDateTime | null>(null)
<DateField
  label="Start date"
  value={startDate}
  onChange={setStartDate}
/>
```

### With Caption

```typescript
<DateField
  label="Birth date"
  caption="Select your date of birth"
/>
```

### With Error

```typescript
<DateField
  label="End date"
  error="End date must be after start date"
/>
```

### Required Field

```typescript
<DateField
  label="Appointment date"
  isRequired
/>
```

### Disabled State

```typescript
<DateField
  label="Locked date"
  isDisabled
/>
```

### Invalid State

```typescript
<DateField
  label="Expiry date"
  isInvalid
  error="This field is required"
/>
```

### With Time Picker

```typescript
<DateField
  label="Appointment"
  withTimePicker
  onChange={(dateTime) => console.log(dateTime)}
/>
```

### Custom Timezone

```typescript
<DateField
  label="Meeting time"
  withTimePicker
  timeZone="America/New_York"
/>
```

### With Unavailable Dates

```typescript
import { isWeekend } from '@internationalized/date'

<DateField
  label="Appointment date"
  isDateUnavailable={(date) => isWeekend(date, 'en-US')}
/>
```

### With Presets

```typescript
// Using template presets
<DateField
  label="Report date"
  presets="relative"  // or "absolute"
/>

// Custom presets
<DateField
  label="Date range"
  presets={[
    { label: 'Today', value: now(getLocalTimeZone()) },
    { label: 'Tomorrow', value: now(getLocalTimeZone()).add({ days: 1 }) }
  ]}
/>

// Custom preset renderer
<DateField
  label="Custom date"
  presets={({ onSelect, close }) => (
    <Box padding="md">
      <Button onClick={() => {
        onSelect(now(getLocalTimeZone()))
        close()
      }}>
        Select Today
      </Button>
    </Box>
  )}
/>
```

### Picker Placement

```typescript
<DateField
  label="Date"
  placement="top"
  shouldFlip={false}
/>
```

### Initial Value

```typescript
import { fromDate, getLocalTimeZone } from '@internationalized/date'

const initialDate = fromDate(new Date(2025, 0, 1), getLocalTimeZone())

<DateField
  label="Start date"
  defaultValue={initialDate}
/>
```

## Related Components

- **TimeField**: For time input
- **DatePicker**: Standalone date picker popover
- **Calendar**: Standalone calendar component
- **DateRangePicker**: For selecting date ranges
- **TextField**: For text input
- **Label**: Standalone label component

## Testing Queries

```typescript
// By label
screen.getByText('Date')

// By date segments
screen.getByRole('spinbutton', { name: /day/ })
screen.getByRole('spinbutton', { name: /month/ })
screen.getByRole('spinbutton', { name: /year/ })

// Calendar button
screen.getByRole('button', { name: 'Calendar' })

// Type in segments
await userEvent.keyboard('{tab}')
await userEvent.keyboard('10') // month
await userEvent.keyboard('15') // day
await userEvent.keyboard('2025') // year

// Check value
expect(value?.day).toEqual(15)
expect(value?.month).toEqual(10)
expect(value?.year).toEqual(2025)
```
