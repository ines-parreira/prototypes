# DateRangePicker

Date range selection component with calendar popup and optional presets.

## Import

```typescript
import { now, parseZonedDateTime } from '@internationalized/date'

import { DateRangePicker, getDateRangePickerPresets } from '@gorgias/axiom'
```

## Props

### DateRangePickerProps

```typescript
type DateRangePickerProps = {
    // Value (controlled/uncontrolled)
    value?: RangeValue<ZonedDateTime> | null // Currently selected date range
    defaultValue?: RangeValue<ZonedDateTime> | null // Initial value (uncontrolled)
    onChange?: (
        value: RangeValue<ZonedDateTime> | null,
        source: ChangeEventSource,
    ) => void

    // Trigger
    placeholder?: string // Placeholder text. Default: 'Select date range'
    trigger?: (props: DateRangePickerTriggerRenderProps) => ReactNode // Custom trigger

    // Popover
    placement?: 'bottom' | 'bottom-left' | 'bottom-right' // Default: 'bottom-right'

    // Visibility (controlled/uncontrolled)
    isOpen?: boolean // Whether popover is open (controlled)
    defaultOpen?: boolean // Initial open state (uncontrolled)
    onOpenChange?: (isOpen: boolean) => void // Open state change callback

    // Date
    timeZone?: string // Timezone. Default: local timezone
    isDateUnavailable?: (date: DateValue) => boolean // Disable specific dates

    // Presets
    presets?:
        | 'relative'
        | 'absolute'
        | DatePickerPreset[]
        | ((props) => ReactNode)

    // State
    isDisabled?: boolean // Whether picker is disabled

    // Children
    children?: ReactNode | ((renderProps) => ReactNode) // Content below calendar
}

type RangeValue<T> = {
    start: T // Start date of range
    end: T // End date of range
}

type ChangeEventSource = 'calendar' | 'preset' | 'trigger'

type DateRangePickerTriggerRenderProps = {
    ref: RefObject<HTMLButtonElement>
    isOpen: boolean
    isDisabled: boolean
    formattedValue: string // Formatted date range string
}
```

## Usage

### Basic DateRangePicker

```typescript
import { now, getLocalTimeZone } from '@internationalized/date'

const [range, setRange] = useState<RangeValue<ZonedDateTime> | null>(null)

<DateRangePicker
  placeholder="Select date range"
  value={range}
  onChange={setRange}
/>
```

### With Initial Value

```typescript
const currentTime = now(getLocalTimeZone())
const [range, setRange] = useState({
  start: currentTime.subtract({ days: 7 }),
  end: currentTime,
})

<DateRangePicker
  value={range}
  onChange={setRange}
/>
```

### With Timezone

```typescript
<DateRangePicker
  placeholder="Select date range"
  timeZone="America/New_York"
  value={range}
  onChange={setRange}
/>
```

### With Presets (Template)

```typescript
// Relative presets (Today, Yesterday, Last 7 days, etc.)
<DateRangePicker
  placeholder="Select date range"
  value={range}
  onChange={setRange}
  presets="relative"
/>

// Absolute presets (This week, Last week, This month, etc.)
<DateRangePicker
  placeholder="Select date range"
  value={range}
  onChange={setRange}
  presets="absolute"
/>
```

### With Custom Presets

```typescript
import { now, getLocalTimeZone } from '@internationalized/date'

const customPresets: DatePickerPreset[] = [
  {
    label: 'Last 7 days',
    value: {
      start: now(getLocalTimeZone()).subtract({ days: 7 }),
      end: now(getLocalTimeZone()),
    },
  },
  {
    label: 'Last 30 days',
    value: {
      start: now(getLocalTimeZone()).subtract({ days: 30 }),
      end: now(getLocalTimeZone()),
    },
  },
  {
    label: 'This year',
    value: {
      start: now(getLocalTimeZone()).set({ month: 1, day: 1 }),
      end: now(getLocalTimeZone()),
    },
  },
]

<DateRangePicker
  placeholder="Select date range"
  value={range}
  onChange={setRange}
  presets={customPresets}
/>
```

### Disable Specific Dates

```typescript
import { today, getLocalTimeZone, isWeekend } from '@internationalized/date'

// Disable weekends
<DateRangePicker
  placeholder="Select weekday range"
  value={range}
  onChange={setRange}
  isDateUnavailable={(date) => isWeekend(date, 'en-US')}
/>

// Disable future dates
const todayDate = today(getLocalTimeZone())
<DateRangePicker
  placeholder="Select past date range"
  value={range}
  onChange={setRange}
  isDateUnavailable={(date) => date.compare(todayDate) > 0}
/>
```

### Custom Trigger

```typescript
<DateRangePicker
  value={range}
  onChange={setRange}
  trigger={({ ref, formattedValue, isOpen }) => (
    <Button
      ref={ref}
      trailingSlot={isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'}
    >
      {formattedValue || 'Pick a date range'}
    </Button>
  )}
/>
```

### Popover Placement

```typescript
// Bottom right (default)
<DateRangePicker
  placeholder="Select date range"
  placement="bottom-right"
  value={range}
  onChange={setRange}
/>

// Bottom left
<DateRangePicker
  placeholder="Select date range"
  placement="bottom-left"
  value={range}
  onChange={setRange}
/>

// Center bottom
<DateRangePicker
  placeholder="Select date range"
  placement="bottom"
  value={range}
  onChange={setRange}
/>
```

### Controlled Popover State

```typescript
const [isOpen, setIsOpen] = useState(false)

<Button onClick={() => setIsOpen(true)}>Open Picker</Button>

<DateRangePicker
  placeholder="Select date range"
  value={range}
  onChange={setRange}
  isOpen={isOpen}
  onOpenChange={setIsOpen}
/>
```

### Disabled State

```typescript
<DateRangePicker
  placeholder="Select date range"
  value={range}
  onChange={setRange}
  isDisabled
/>
```

### Track Change Source

```typescript
const handleChange = (
  value: RangeValue<ZonedDateTime> | null,
  source: ChangeEventSource
) => {
  setRange(value)
  console.log('Changed via:', source)  // 'calendar', 'preset', or 'trigger'
}

<DateRangePicker
  placeholder="Select date range"
  value={range}
  onChange={handleChange}
  presets="relative"
/>
```

### With Custom Content Below Calendar

```typescript
<DateRangePicker
  placeholder="Select date range"
  value={range}
  onChange={setRange}
>
  <Box p="md">
    <Text size="sm">Custom footer content</Text>
  </Box>
</DateRangePicker>
```

### Working with Date Ranges

```typescript
import {
    getLocalTimeZone,
    now,
    parseZonedDateTime,
} from '@internationalized/date'

// Create date range
const range = {
    start: parseZonedDateTime('2024-01-01T00:00:00[America/New_York]'),
    end: parseZonedDateTime('2024-01-31T23:59:59[America/New_York]'),
}

// Calculate range duration
const calculateDays = (range: RangeValue<ZonedDateTime>) => {
    return range.end.toDate().getTime() - range.start.toDate().getTime()
}

// Convert to JavaScript Dates
const jsStartDate = range.start.toDate()
const jsEndDate = range.end.toDate()

// Format for display
const formatRange = (range: RangeValue<ZonedDateTime>) => {
    const start = range.start.toDate().toLocaleDateString()
    const end = range.end.toDate().toLocaleDateString()
    return `${start} - ${end}`
}
```

### Limiting Range Duration

```typescript
const MAX_DAYS = 90

const handleChange = (newRange: RangeValue<ZonedDateTime> | null) => {
  if (!newRange) {
    setRange(null)
    return
  }

  const days = newRange.end.toDate().getTime() - newRange.start.toDate().getTime()
  const dayCount = Math.ceil(days / (1000 * 60 * 60 * 24))

  if (dayCount <= MAX_DAYS) {
    setRange(newRange)
  } else {
    console.error(`Range cannot exceed ${MAX_DAYS} days`)
  }
}

<DateRangePicker
  placeholder="Select date range (max 90 days)"
  value={range}
  onChange={handleChange}
/>
```

## Related Components

- **DatePicker**: Single date selection with calendar
- **RangeCalendar**: Low-level range calendar component
- **DateRangeFilter**: Filter component for date range selection
- **DateField**: Text input field for single date entry

## Testing Queries

```typescript
// Find trigger button
screen.getByRole('button', { name: /select date range/i })
screen.getByPlaceholderText('Select date range')

// Open date range picker
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: /select date range/i }))

// Find calendar
screen.getByRole('grid')

// Select date range
await user.click(screen.getByRole('button', { name: 'January 1, 2024' })) // Start
await user.click(screen.getByRole('button', { name: 'January 31, 2024' })) // End

// Find preset buttons
screen.getByRole('button', { name: 'Last 7 days' })
screen.getByRole('button', { name: 'Last 30 days' })

// Apply preset
await user.click(screen.getByRole('button', { name: 'Last 7 days' }))

// Check trigger shows range
expect(
    screen.getByRole('button', { name: /select date range/i }),
).toHaveTextContent('Jan 1, 2024 - Jan 31, 2024')

// Disabled state
expect(
    screen.getByRole('button', { name: /select date range/i }),
).toHaveAttribute('aria-disabled', 'true')
```
