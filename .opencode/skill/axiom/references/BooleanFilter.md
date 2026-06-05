# BooleanFilter

Boolean toggle filter component for true/false filtering.

## Import

```typescript
import { BooleanFilter } from '@gorgias/axiom'
```

## Props

### BooleanFilterProps

```typescript
type BooleanFilterProps = {
    id: string // Unique filter identifier
    label: string // Filter label
    operator?: string // Operator text (e.g., "is")
    trigger?: (props) => ReactNode // Custom trigger
}
```

## Usage

### Basic BooleanFilter

```typescript
<Filters>
  <BooleanFilter
    id="archived"
    label="Archived"
  />
</Filters>
```

### With Operator

```typescript
<BooleanFilter
  id="completed"
  label="Completed"
  operator="is"
/>

<BooleanFilter
  id="active"
  label="Active"
  operator="is"
/>
```

### Multiple Boolean Filters

```typescript
<Filters>
  <BooleanFilter id="archived" label="Archived" />
  <BooleanFilter id="starred" label="Starred" />
  <BooleanFilter id="unread" label="Unread" />
  <BooleanFilter id="hasAttachment" label="Has Attachment" />
</Filters>
```

### Reading Filter Value

```typescript
const [filterValues, setFilterValues] = useState({})

// BooleanFilter value is simply true or false
<Filters value={filterValues} onChange={setFilterValues}>
  <BooleanFilter id="archived" label="Archived" />
</Filters>

// Apply filter to data
const filtered = data.filter(item => {
  if (filterValues.archived === undefined) return true
  return item.archived === filterValues.archived
})
```

### Behavior

The BooleanFilter toggles between three states:

1. **Inactive** (not applied): Filter is not shown, no filtering
2. **True**: Filter button shows "true", filters for true values
3. **False**: Filter button shows "false", filters for false values

Clicking the filter button cycles through: Inactive → True → False → True → ...

Clicking the clear button (×) removes the filter entirely.

```typescript
// Click to activate and set to true
<BooleanFilter id="archived" label="Archived" />
// Shows: "Archived: true"

// Click again to toggle to false
// Shows: "Archived: false"

// Click clear (×) to remove filter
// Filter is hidden from view
```

### Initial State

```typescript
// Start with filter active (true)
const [filterValues, setFilterValues] = useState({
  archived: true,
})

<Filters value={filterValues} onChange={setFilterValues}>
  <BooleanFilter id="archived" label="Archived" />
</Filters>

// Start with filter active (false)
const [filterValues, setFilterValues] = useState({
  completed: false,
})

<Filters value={filterValues} onChange={setFilterValues}>
  <BooleanFilter id="completed" label="Completed" />
</Filters>
```

## Related Components

- **Filters**: Container for multiple filters
- **SelectFilter**: Single-selection filter
- **ToggleField**: Form field for boolean input
- **CheckBoxField**: Form field for boolean selection

## Testing Queries

```typescript
// Find filter button
screen.getByRole('button', { name: 'Archived' })

// Toggle filter value
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'Archived' }))

// Check filter value
expect(screen.getByText('true')).toBeInTheDocument()

// Click again to toggle
await user.click(screen.getByRole('button', { name: 'Archived' }))
expect(screen.getByText('false')).toBeInTheDocument()

// Clear filter
const clearButton = screen.getByLabelText('Clear Archived filter')
await user.click(clearButton)
expect(
    screen.queryByRole('button', { name: 'Archived' }),
).not.toBeInTheDocument()
```
