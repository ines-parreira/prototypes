# DateFilter

Date filter component with operator selection (before/after/on).

## Import

```typescript
import { parseZonedDateTime } from '@internationalized/date'

import { DateFilter } from '@gorgias/axiom'
```

## Props

### DateFilterProps

```typescript
type DateFilterProps = {
    id: string // Unique filter identifier
    label: string // Filter label
    operator?: 'before' | 'after' | 'on' // Default operator
    trigger?: (props) => ReactNode // Custom trigger
    timeZone?: string // Timezone. Default: local timezone
}
```

## Usage

### Basic DateFilter

```typescript
<Filters>
  <DateFilter
    id="createdAt"
    label="Created"
  />
</Filters>
```

### With Default Operator

```typescript
<DateFilter
  id="dueDate"
  label="Due Date"
  operator="before"
/>

<DateFilter
  id="updatedAt"
  label="Updated"
  operator="after"
/>

<DateFilter
  id="completedAt"
  label="Completed"
  operator="on"
/>
```

### With Timezone

```typescript
<DateFilter
  id="scheduledAt"
  label="Scheduled"
  timeZone="America/New_York"
/>
```

### Reading Filter Value

```typescript
const [filterValues, setFilterValues] = useState({})

// DateFilter value format
const dateFilterValue = {
  operator: 'after',  // 'before', 'after', or 'on'
  value: parseZonedDateTime('2024-01-01T00:00:00[UTC]'),
}

<Filters value={filterValues} onChange={setFilterValues}>
  <DateFilter id="createdAt" label="Created" />
</Filters>

// Apply filter to data
const filtered = data.filter(item => {
  if (!filterValues.createdAt) return true

  const filterDate = filterValues.createdAt.value.toDate()
  const itemDate = new Date(item.createdAt)

  switch (filterValues.createdAt.operator) {
    case 'before':
      return itemDate < filterDate
    case 'after':
      return itemDate > filterDate
    case 'on':
      return itemDate.toDateString() === filterDate.toDateString()
    default:
      return true
  }
})
```

## Related Components

- **Filters**: Container for multiple filters
- **DateRangeFilter**: Date range filter
- **DatePicker**: Standalone date picker
- **SelectFilter**: Single-selection filter

## Testing Queries

```typescript
// Find filter button
screen.getByRole('button', { name: 'Created' })

// Open filter
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'Created' }))

// Select operator
await user.click(screen.getByRole('button', { name: 'after' }))

// Select date
await user.click(screen.getByRole('button', { name: 'January 15, 2024' }))

// Clear filter
const clearButton = screen.getByLabelText('Clear Created filter')
await user.click(clearButton)
```
