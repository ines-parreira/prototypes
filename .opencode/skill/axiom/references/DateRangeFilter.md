# DateRangeFilter

Date range filter component for selecting start and end dates.

## Import

```typescript
import { parseZonedDateTime } from '@internationalized/date'

import { DateRangeFilter } from '@gorgias/axiom'
```

## Props

### DateRangeFilterProps

```typescript
type DateRangeFilterProps = {
    id: string // Unique filter identifier
    label: string // Filter label
    trigger?: (props) => ReactNode // Custom trigger
    timeZone?: string // Timezone. Default: local timezone
}
```

## Usage

### Basic DateRangeFilter

```typescript
<Filters>
  <DateRangeFilter
    id="period"
    label="Period"
  />
</Filters>
```

### With Timezone

```typescript
<DateRangeFilter
  id="dateRange"
  label="Date Range"
  timeZone="America/New_York"
/>
```

### Reading Filter Value

```typescript
const [filterValues, setFilterValues] = useState({})

// DateRangeFilter value format
const dateRangeValue = {
  start: parseZonedDateTime('2024-01-01T00:00:00[UTC]'),
  end: parseZonedDateTime('2024-01-31T23:59:59[UTC]'),
}

<Filters value={filterValues} onChange={setFilterValues}>
  <DateRangeFilter id="period" label="Period" />
</Filters>

// Apply filter to data
const filtered = data.filter(item => {
  if (!filterValues.period) return true

  const startDate = filterValues.period.start.toDate()
  const endDate = filterValues.period.end.toDate()
  const itemDate = new Date(item.date)

  return itemDate >= startDate && itemDate <= endDate
})
```

### With Presets

```typescript
<Filters>
  <DateRangeFilter
    id="period"
    label="Period"
    presets="relative"  // or "absolute"
  />
</Filters>
```

## Related Components

- **Filters**: Container for multiple filters
- **DateFilter**: Single date filter with operator
- **DateRangePicker**: Standalone date range picker
- **SelectFilter**: Single-selection filter

## Testing Queries

```typescript
// Find filter button
screen.getByRole('button', { name: 'Period' })

// Open filter
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'Period' }))

// Select date range
await user.click(screen.getByRole('button', { name: 'January 1, 2024' })) // Start
await user.click(screen.getByRole('button', { name: 'January 31, 2024' })) // End

// Apply preset
await user.click(screen.getByRole('button', { name: 'Last 7 days' }))

// Clear filter
const clearButton = screen.getByLabelText('Clear Period filter')
await user.click(clearButton)
```
