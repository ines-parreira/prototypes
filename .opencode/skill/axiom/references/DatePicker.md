# DatePicker

Date and time selection component with calendar popup and optional presets.

## Import

```typescript
import { now, parseZonedDateTime } from '@internationalized/date'

import {
    DatePicker,
    DatePickerPresets,
    getDatePickerPresets,
} from '@gorgias/axiom'
```

## Props

### DatePickerProps

DatePicker has two modes: with popover (default) and without popover (inline).

**With Popover (default):**

```typescript
type DatePickerProps = {
    // Value (controlled/uncontrolled)
    value?: ZonedDateTime | null // Currently selected date/time
    defaultValue?: ZonedDateTime | null // Initial value (uncontrolled)
    onChange?: (value: ZonedDateTime | null, source: ChangeEventSource) => void

    // Trigger
    placeholder?: string // Placeholder text. Default: 'Select date'
    trigger?: (props: DatePickerTriggerRenderProps) => ReactNode // Custom trigger
    triggerRef?: RefObject<HTMLElement> // Ref to trigger element

    // Popover
    placement?: 'bottom' | 'bottom-left' | 'bottom-right' // Default: 'bottom-right'
    shouldFlip?: boolean // Flip when insufficient space. Default: true

    // Visibility (controlled/uncontrolled)
    isOpen?: boolean // Whether popover is open (controlled)
    defaultOpen?: boolean // Initial open state (uncontrolled)
    onOpenChange?: (isOpen: boolean) => void // Open state change callback

    // Date/Time
    timeZone?: string // Timezone. Default: local timezone
    withTimePicker?: boolean // Include time selection. Default: false
    isDateUnavailable?: (date: DateValue) => boolean // Disable specific dates

    // Presets
    presets?:
        | 'today'
        | 'next-week'
        | 'next-month'
        | DatePickerPreset[]
        | ((props) => ReactNode)

    // State
    isDisabled?: boolean // Whether picker is disabled

    // Children
    children?: ReactNode | ((renderProps) => ReactNode) // Content below calendar
}

type ChangeEventSource = 'calendar' | 'time-picker' | 'preset' | 'trigger'

type DatePickerTriggerRenderProps = {
    ref: RefObject<HTMLButtonElement>
    isOpen: boolean
    isDisabled: boolean
    formattedValue: string // Formatted date string
}
```

**Without Popover (inline):**

```typescript
type DatePickerProps = {
  withoutPopover: true              // Render calendar inline
  value?: ZonedDateTime | null
  onChange?: (value: ZonedDateTime | null, source: ChangeEventSource) => void
  timeZone?: string
  withTimePicker?: boolean
  isDateUnavailable?: (date: DateValue) => boolean
  presets?: ...
  isDisabled?: boolean
  children?: ReactNode | ((renderProps) => ReactNode)
}
```

## Usage

### Basic DatePicker

```typescript
import { now } from '@internationalized/date'

const [date, setDate] = useState<ZonedDateTime | null>(null)

<DatePicker
  placeholder="Select a date"
  value={date}
  onChange={setDate}
/>
```

### With Initial Value

```typescript
import { now, getLocalTimeZone } from '@internationalized/date'

const [date, setDate] = useState(now(getLocalTimeZone()))

<DatePicker
  value={date}
  onChange={setDate}
/>
```

### With Time Picker

```typescript
<DatePicker
  placeholder="Select date and time"
  value={dateTime}
  onChange={setDateTime}
  withTimePicker
/>
```

### With Timezone

```typescript
<DatePicker
  placeholder="Select date"
  timeZone="America/New_York"
  value={date}
  onChange={setDate}
/>
```

### With Presets (Template)

```typescript
// Built-in preset templates
<DatePicker
  placeholder="Select date"
  value={date}
  onChange={setDate}
  presets="today"  // Today
/>

<DatePicker
  placeholder="Select date"
  value={date}
  onChange={setDate}
  presets="next-week"  // Next 7 days + This week + Today
/>

<DatePicker
  placeholder="Select date"
  value={date}
  onChange={setDate}
  presets="next-month"  // Next 30 days + This month + Today
/>
```

### With Custom Presets

```typescript
import { now, getLocalTimeZone } from '@internationalized/date'

const customPresets: DatePickerPreset[] = [
  {
    label: 'Now',
    value: now(getLocalTimeZone()),
  },
  {
    label: 'Tomorrow 9 AM',
    value: now(getLocalTimeZone())
      .add({ days: 1 })
      .set({ hour: 9, minute: 0, second: 0 }),
  },
  {
    label: 'Next Monday',
    value: now(getLocalTimeZone())
      .add({ days: (8 - now(getLocalTimeZone()).dayOfWeek) % 7 }),
  },
]

<DatePicker
  placeholder="Select date"
  value={date}
  onChange={setDate}
  presets={customPresets}
/>
```

### With Custom Preset Rendering

```typescript
const [selectedPreset, setSelectedPreset] = useState<DatePickerPreset | null>(null)

<DatePicker
  placeholder="Select date"
  value={date}
  onChange={setDate}
  presets={({ onApply, state }) => {
    const items = getDatePickerPresets('next-week')
    return (
      <DatePickerPresets
        items={items}
        selectedItem={selectedPreset}
        onApply={(preset) => {
          setSelectedPreset(preset)
          onApply(preset)
        }}
      />
    )
  }}
/>
```

### Disable Specific Dates

```typescript
import { today, getLocalTimeZone, isWeekend } from '@internationalized/date'

// Disable weekends
<DatePicker
  placeholder="Select weekday"
  value={date}
  onChange={setDate}
  isDateUnavailable={(date) => isWeekend(date, 'en-US')}
/>

// Disable past dates
const todayDate = today(getLocalTimeZone())
<DatePicker
  placeholder="Select future date"
  value={date}
  onChange={setDate}
  isDateUnavailable={(date) => date.compare(todayDate) < 0}
/>
```

### Inline DatePicker (Without Popover)

```typescript
<DatePicker
  withoutPopover
  value={date}
  onChange={setDate}
/>

// With time picker inline
<DatePicker
  withoutPopover
  withTimePicker
  value={date}
  onChange={setDate}
/>
```

### Custom Trigger

```typescript
<DatePicker
  value={date}
  onChange={setDate}
  trigger={({ ref, formattedValue, isOpen }) => (
    <Button
      ref={ref}
      trailingSlot={isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'}
    >
      {formattedValue || 'Pick a date'}
    </Button>
  )}
/>
```

### Popover Placement

```typescript
// Bottom right (default)
<DatePicker
  placeholder="Select date"
  placement="bottom-right"
  value={date}
  onChange={setDate}
/>

// Bottom left
<DatePicker
  placeholder="Select date"
  placement="bottom-left"
  value={date}
  onChange={setDate}
/>

// Center bottom
<DatePicker
  placeholder="Select date"
  placement="bottom"
  value={date}
  onChange={setDate}
/>
```

### Controlled Popover State

```typescript
const [isOpen, setIsOpen] = useState(false)

<Button onClick={() => setIsOpen(true)}>Open Picker</Button>

<DatePicker
  placeholder="Select date"
  value={date}
  onChange={setDate}
  isOpen={isOpen}
  onOpenChange={setIsOpen}
/>
```

### Disabled State

```typescript
<DatePicker
  placeholder="Select date"
  value={date}
  onChange={setDate}
  isDisabled
/>
```

### Track Change Source

```typescript
const handleChange = (value: ZonedDateTime | null, source: ChangeEventSource) => {
  setDate(value)
  console.log('Changed via:', source)  // 'calendar', 'time-picker', 'preset', or 'trigger'
}

<DatePicker
  placeholder="Select date"
  value={date}
  onChange={handleChange}
  withTimePicker
  presets="today"
/>
```

### With Custom Content Below Calendar

```typescript
<DatePicker
  placeholder="Select date"
  value={date}
  onChange={setDate}
>
  <Box p="md">
    <Text size="sm">Custom footer content</Text>
  </Box>
</DatePicker>
```

### Working with ZonedDateTime

```typescript
import {
    getLocalTimeZone,
    now,
    parseZonedDateTime,
    toCalendarDate,
} from '@internationalized/date'

// Get current date/time
const currentDateTime = now(getLocalTimeZone())

// Parse from ISO string
const dateTime = parseZonedDateTime('2024-01-15T09:00:00[America/New_York]')

// Convert to JavaScript Date
const jsDate = dateTime.toDate()

// Convert to CalendarDate (date only, no time)
const calendarDate = toCalendarDate(dateTime)

// Format for display
const formatted = dateTime.toDate().toLocaleString()
```

## Related Components

- **DateField**: Text input field for date entry (no calendar popup)
- **DateRangePicker**: Date range selection with calendar
- **Calendar**: Low-level calendar component
- **DateFilter**: Filter component for date selection

## Testing Queries

```typescript
// Find trigger button
screen.getByRole('button', { name: /select date/i })
screen.getByPlaceholderText('Select a date')

// Open date picker
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: /select date/i }))

// Find calendar
screen.getByRole('grid')

// Select a date
await user.click(screen.getByRole('button', { name: 'January 15, 2024' }))

// Find preset buttons
screen.getByRole('button', { name: 'Today' })
screen.getByRole('button', { name: 'Tomorrow' })

// Apply preset
await user.click(screen.getByRole('button', { name: 'Today' }))

// Disabled state
expect(screen.getByRole('button', { name: /select date/i })).toHaveAttribute(
    'aria-disabled',
    'true',
)
```
