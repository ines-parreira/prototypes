# Calendar

Single-date selection calendar component without UI chrome.

## Import

```typescript
import { parseDate } from '@internationalized/date'

import { Calendar } from '@gorgias/axiom'
```

## Props

### CalendarProps

```typescript
type CalendarProps = {
    // Timezone
    timeZone: string // Required timezone for date display

    // Value (controlled)
    value?: CalendarDate // Currently selected date
    onChange?: (value: CalendarDate) => void // Date selection callback
}
```

**Note**: Calendar is controlled-only. For form fields with labels and error handling, use DateField or DatePicker instead.

## Usage

### Basic Calendar

```typescript
import { parseDate } from '@internationalized/date'
import { Calendar } from '@gorgias/axiom'

const [date, setDate] = useState(parseDate('2024-01-15'))

<Calendar
  timeZone="America/New_York"
  value={date}
  onChange={setDate}
/>
```

### Without Initial Selection

```typescript
const [date, setDate] = useState<CalendarDate | undefined>()

<Calendar
  timeZone="UTC"
  value={date}
  onChange={setDate}
/>
```

### Different Timezones

```typescript
// UTC
<Calendar
  timeZone="UTC"
  value={date}
  onChange={setDate}
/>

// Specific timezone
<Calendar
  timeZone="America/Los_Angeles"
  value={date}
  onChange={setDate}
/>

// User's timezone
<Calendar
  timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
  value={date}
  onChange={setDate}
/>
```

### Working with CalendarDate

```typescript
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
// Convert from JavaScript Date
import { fromDate } from '@internationalized/date'

// Parse from ISO string
const date = parseDate('2024-01-15')

// Get today's date
const todayDate = today(getLocalTimeZone())

// Create specific date
const specificDate = new CalendarDate(2024, 1, 15)

// Convert to JavaScript Date
const jsDate = date.toDate(timeZone)

const calendarDate = fromDate(new Date(), timeZone)
```

## Use Cases

Calendar is a low-level component primarily used:

1. **Internally by DatePicker**: Provides the calendar popup
2. **Custom date UIs**: When you need bare calendar functionality
3. **Inline date selection**: Displaying calendar directly in the UI

For most use cases, prefer:

- **DateField**: Text input with date validation
- **DatePicker**: Text input with calendar popup
- **DateFilter**: Date selection for filters

## Related Components

- **DatePicker**: Complete date picker with input field and calendar popup
- **RangeCalendar**: Calendar for selecting date ranges
- **DateRangePicker**: Date range picker with calendar popup
- **DateField**: Text input field for date entry
- **DateFilter**: Filter component for date selection

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

// Interact with calendar
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: '15' }))

// Check if date is selected
expect(
    screen.getByRole('button', { name: 'January 15, 2024' }),
).toHaveAttribute('aria-pressed', 'true')
```
