# RangeCalendar

Date range selection calendar component for selecting start and end dates.

## Import

```typescript
import { parseDate } from '@internationalized/date'

import { RangeCalendar } from '@gorgias/axiom'
```

## Props

### RangeCalendarProps

```typescript
type RangeCalendarProps = {
    // Timezone
    timeZone: string // Required timezone for date display

    // Value (controlled)
    value?: RangeValue<CalendarDate> // Currently selected date range
    onChange?: (value: RangeValue<CalendarDate>) => void // Range selection callback
}

type RangeValue<T> = {
    start: T // Start date of range
    end: T // End date of range
}
```

**Note**: RangeCalendar is controlled-only. For form fields with labels, use DateRangePicker instead.

## Usage

### Basic RangeCalendar

```typescript
import { parseDate } from '@internationalized/date'
import { RangeCalendar } from '@gorgias/axiom'

const [range, setRange] = useState({
  start: parseDate('2024-01-01'),
  end: parseDate('2024-01-31'),
})

<RangeCalendar
  timeZone="America/New_York"
  value={range}
  onChange={setRange}
/>
```

### Without Initial Selection

```typescript
const [range, setRange] = useState<RangeValue<CalendarDate> | undefined>()

<RangeCalendar
  timeZone="UTC"
  value={range}
  onChange={setRange}
/>
```

### Different Timezones

```typescript
// UTC
<RangeCalendar
  timeZone="UTC"
  value={range}
  onChange={setRange}
/>

// Specific timezone
<RangeCalendar
  timeZone="Europe/London"
  value={range}
  onChange={setRange}
/>

// User's timezone
<RangeCalendar
  timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
  value={range}
  onChange={setRange}
/>
```

### Working with Date Ranges

```typescript
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'

// Parse date range
const range = {
    start: parseDate('2024-01-01'),
    end: parseDate('2024-01-31'),
}

// Current month range
const now = today(getLocalTimeZone())
const monthRange = {
    start: now.set({ day: 1 }),
    end: now.set({ day: now.calendar.getDaysInMonth(now) }),
}

// Last 7 days
const last7Days = {
    start: today(getLocalTimeZone()).subtract({ days: 7 }),
    end: today(getLocalTimeZone()),
}

// Convert to JavaScript Dates
const jsStartDate = range.start.toDate(timeZone)
const jsEndDate = range.end.toDate(timeZone)
```

### Calculating Range Duration

```typescript
const calculateDays = (range: RangeValue<CalendarDate>) => {
  return range.end.compare(range.start)
}

const [range, setRange] = useState<RangeValue<CalendarDate>>()

const handleRangeChange = (newRange: RangeValue<CalendarDate>) => {
  const days = calculateDays(newRange)
  console.log(`Selected ${days} days`)
  setRange(newRange)
}

<RangeCalendar
  timeZone="UTC"
  value={range}
  onChange={handleRangeChange}
/>
```

## Use Cases

RangeCalendar is a low-level component primarily used:

1. **Internally by DateRangePicker**: Provides the calendar popup
2. **Custom date range UIs**: When you need bare range calendar functionality
3. **Inline range selection**: Displaying calendar directly in the UI

For most use cases, prefer:

- **DateRangePicker**: Complete date range picker with calendar popup
- **DateRangeFilter**: Date range selection for filters

## Related Components

- **DateRangePicker**: Complete date range picker with calendar popup
- **Calendar**: Single-date selection calendar
- **DatePicker**: Single date picker with calendar popup
- **DateRangeFilter**: Filter component for date range selection

## Testing Queries

```typescript
// Find calendar grid
screen.getByRole('grid')

// Find specific date button
screen.getByRole('button', { name: '15' }) // Day 15
screen.getByRole('button', { name: 'January 15, 2024' })

// Find month/year navigation
screen.getByRole('button', { name: 'Previous' })
screen.getByRole('button', { name: 'Next' })

// Select date range
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'January 1, 2024' })) // Start
await user.click(screen.getByRole('button', { name: 'January 31, 2024' })) // End

// Check if dates in range are highlighted
const button15 = screen.getByRole('button', { name: 'January 15, 2024' })
expect(button15).toHaveAttribute('data-in-range', 'true')
```
