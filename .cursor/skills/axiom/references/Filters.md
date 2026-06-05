# Filters

Container component for managing collections of filter components with add/clear functionality.

## Import

```typescript
import {
    BooleanFilter,
    DateFilter,
    DateRangeFilter,
    Filters,
    MultiSelectFilter,
    SelectFilter,
} from '@gorgias/axiom'
```

## Props

### FiltersProps

```typescript
type FiltersProps = {
    // Value (controlled/uncontrolled)
    value?: Record<string, unknown> // Current filter values
    onChange?: (values: Record<string, unknown>) => void // Value change callback

    // Content
    children: ReactNode // Filter components
}
```

## Usage

### Basic Filters

```typescript
<Filters>
  <SelectFilter
    id="status"
    label="Status"
    items={statusOptions}
  >
    {(option) => <ListItem label={option.label} />}
  </SelectFilter>

  <DateFilter
    id="createdAt"
    label="Created"
  />

  <BooleanFilter
    id="archived"
    label="Archived"
  />
</Filters>
```

### Controlled Filters

```typescript
const [filterValues, setFilterValues] = useState({
  status: 'open',
  createdAt: { operator: 'after', value: '2024-01-01' },
  archived: true,
})

<Filters value={filterValues} onChange={setFilterValues}>
  <SelectFilter id="status" label="Status" items={statusOptions}>
    {(option) => <ListItem label={option.label} />}
  </SelectFilter>

  <DateFilter id="createdAt" label="Created" />

  <BooleanFilter id="archived" label="Archived" />
</Filters>
```

### With Multiple Filter Types

```typescript
<Filters>
  {/* Select single option */}
  <SelectFilter
    id="priority"
    label="Priority"
    items={priorities}
  >
    {(priority) => <ListItem label={priority.label} />}
  </SelectFilter>

  {/* Select multiple options */}
  <MultiSelectFilter
    id="tags"
    label="Tags"
    items={tags}
  >
    {(tag) => <ListItem label={tag.name} />}
  </MultiSelectFilter>

  {/* Select date with operator */}
  <DateFilter
    id="dueDate"
    label="Due Date"
    operator="before"
  />

  {/* Select date range */}
  <DateRangeFilter
    id="period"
    label="Period"
  />

  {/* Boolean toggle */}
  <BooleanFilter
    id="isComplete"
    label="Complete"
  />
</Filters>
```

### Reading Filter Values

```typescript
const handleFilterChange = (values: Record<string, unknown>) => {
  console.log('Status:', values.status)
  console.log('Tags:', values.tags)
  console.log('Due Date:', values.dueDate)
  console.log('Period:', values.period)
  console.log('Is Complete:', values.isComplete)
}

<Filters onChange={handleFilterChange}>
  {/* Filter components */}
</Filters>
```

### Clearing Filters

The Filters component automatically includes a "Clear all" button that clears all active filters.

```typescript
<Filters value={filterValues} onChange={setFilterValues}>
  <SelectFilter id="status" label="Status" items={statusOptions}>
    {(option) => <ListItem label={option.label} />}
  </SelectFilter>
  {/* "Clear all" button appears automatically when filters are active */}
</Filters>
```

### Adding Filters

The Filters component automatically includes an "Add filter" button that shows inactive filters.

```typescript
<Filters>
  <SelectFilter id="status" label="Status" items={statusOptions}>
    {(option) => <ListItem label={option.label} />}
  </SelectFilter>

  <SelectFilter id="priority" label="Priority" items={priorities}>
    {(option) => <ListItem label={option.label} />}
  </SelectFilter>

  <DateFilter id="createdAt" label="Created" />

  {/* "Add filter" button appears automatically to activate inactive filters */}
</Filters>
```

### Initial Active Filters

```typescript
// Only Status filter is initially active
const [filterValues, setFilterValues] = useState({
  status: 'open',
})

<Filters value={filterValues} onChange={setFilterValues}>
  <SelectFilter id="status" label="Status" items={statusOptions}>
    {(option) => <ListItem label={option.label} />}
  </SelectFilter>

  {/* These filters are initially inactive, shown in "Add filter" menu */}
  <SelectFilter id="priority" label="Priority" items={priorities}>
    {(option) => <ListItem label={option.label} />}
  </SelectFilter>

  <DateFilter id="createdAt" label="Created" />
</Filters>
```

### With Overflow

Filters automatically uses OverflowList to handle many filters, showing excess filters in a menu.

```typescript
<Filters>
  {filters.map(filter => (
    <SelectFilter
      key={filter.id}
      id={filter.id}
      label={filter.label}
      items={filter.options}
    >
      {(option) => <ListItem label={option.label} />}
    </SelectFilter>
  ))}
  {/* Filters that don't fit are moved to overflow menu */}
</Filters>
```

### Filter Value Formats

Different filter types use different value formats:

```typescript
const filterValues = {
  // SelectFilter - selected item's ID or value
  status: 'open',

  // MultiSelectFilter - array of selected item IDs or values
  tags: ['urgent', 'bug'],

  // DateFilter - object with operator and date
  createdAt: {
    operator: 'after',
    value: parseZonedDateTime('2024-01-01T00:00:00[UTC]'),
  },

  // DateRangeFilter - object with start and end dates
  period: {
    start: parseZonedDateTime('2024-01-01T00:00:00[UTC]'),
    end: parseZonedDateTime('2024-01-31T23:59:59[UTC]'),
  },

  // BooleanFilter - boolean value
  archived: true,
}

<Filters value={filterValues} onChange={setFilterValues}>
  {/* Filter components */}
</Filters>
```

### Programmatically Set Filters

```typescript
const [filterValues, setFilterValues] = useState({})

// Add a filter
const addStatusFilter = () => {
  setFilterValues({ ...filterValues, status: 'open' })
}

// Remove a filter
const removeStatusFilter = () => {
  const { status, ...rest } = filterValues
  setFilterValues(rest)
}

// Clear all filters
const clearAll = () => {
  setFilterValues({})
}

<Button onClick={addStatusFilter}>Add Status Filter</Button>
<Button onClick={removeStatusFilter}>Remove Status Filter</Button>
<Button onClick={clearAll}>Clear All</Button>

<Filters value={filterValues} onChange={setFilterValues}>
  <SelectFilter id="status" label="Status" items={statusOptions}>
    {(option) => <ListItem label={option.label} />}
  </SelectFilter>
</Filters>
```

### Applying Filters to Data

```typescript
const [filterValues, setFilterValues] = useState({})
const [data, setData] = useState(allData)

useEffect(() => {
  let filtered = [...allData]

  if (filterValues.status) {
    filtered = filtered.filter(item => item.status === filterValues.status)
  }

  if (filterValues.tags?.length > 0) {
    filtered = filtered.filter(item =>
      filterValues.tags.some(tag => item.tags.includes(tag))
    )
  }

  if (filterValues.archived !== undefined) {
    filtered = filtered.filter(item => item.archived === filterValues.archived)
  }

  setData(filtered)
}, [filterValues])

<Filters value={filterValues} onChange={setFilterValues}>
  {/* Filter components */}
</Filters>
```

## Filter Components

Filters works with these filter components:

- **SelectFilter**: Single-selection dropdown filter
- **MultiSelectFilter**: Multi-selection dropdown filter
- **DateFilter**: Date filter with operator (before/after/on)
- **DateRangeFilter**: Date range filter with start and end dates
- **BooleanFilter**: Boolean toggle filter

Each filter component must have:

- `id`: Unique identifier used as the key in filter values
- `label`: Display label shown in filter button and add menu

## Related Components

- **SelectFilter**: Single-selection filter
- **MultiSelectFilter**: Multi-selection filter
- **DateFilter**: Date filter with operator
- **DateRangeFilter**: Date range filter
- **BooleanFilter**: Boolean toggle filter
- **FilterButton**: Low-level filter button component
- **OverflowList**: Handles overflow of many filters

## Testing Queries

```typescript
// Find filter buttons
screen.getByRole('button', { name: 'Status' })
screen.getByRole('button', { name: 'Tags' })

// Find add filter button
screen.getByRole('button', { name: /add filter/i })

// Find clear all button
screen.getByRole('button', { name: /clear all/i })

// Open filter
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'Status' }))

// Apply filter (depends on filter type)
await user.click(screen.getByRole('option', { name: 'Open' }))

// Clear filter
await user.click(screen.getByRole('button', { name: /clear all/i }))

// Add a filter
await user.click(screen.getByRole('button', { name: /add filter/i }))
await user.click(screen.getByRole('menuitem', { name: 'Priority' }))
```
