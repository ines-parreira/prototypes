# SelectFilter

Single-selection filter component that combines FilterButton with Select dropdown.

## Import

```typescript
import { SelectFilter } from '@gorgias/axiom'
import { ListItem } from '@gorgias/axiom'
```

## Props

### SelectFilterProps<T>

```typescript
type SelectFilterProps<T extends object> = {
    id: string // Unique filter identifier
    label: string // Filter label
    items: T[] // Selectable items
    operator?: string // Operator text (e.g., "is", "is not")
    children: (option: T) => ReactNode // Render function for options
    trigger?: (props) => ReactNode // Custom trigger
    keyName?: string // Property name for unique key. Default: 'id'
}
```

## Usage

### Basic SelectFilter

```typescript
<Filters>
  <SelectFilter
    id="status"
    label="Status"
    items={[
      { id: '1', name: 'Open' },
      { id: '2', name: 'Closed' },
    ]}
  >
    {(option) => <ListItem label={option.name} />}
  </SelectFilter>
</Filters>
```

### With Operator

```typescript
<SelectFilter
  id="priority"
  label="Priority"
  operator="is"
  items={priorities}
>
  {(priority) => <ListItem label={priority.label} />}
</SelectFilter>
```

### With Rich Items

```typescript
<SelectFilter
  id="assignee"
  label="Assignee"
  items={users}
>
  {(user) => (
    <ListItem
      label={user.name}
      description={user.email}
      leadingSlot={<Avatar src={user.avatar} />}
    />
  )}
</SelectFilter>
```

### With Custom Key

```typescript
<SelectFilter
  id="category"
  label="Category"
  keyName="categoryId"
  items={categories}
>
  {(cat) => <ListItem label={cat.name} />}
</SelectFilter>
```

## Related Components

- **Filters**: Container for multiple filters
- **MultiSelectFilter**: Multi-selection filter
- **DateFilter**: Date filter with operator
- **Select**: Standalone select component

## Testing Queries

```typescript
// Find filter button
screen.getByRole('button', { name: 'Status' })

// Open filter
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'Status' }))

// Select option
await user.click(screen.getByRole('option', { name: 'Open' }))

// Clear filter
const clearButton = screen.getByLabelText('Clear Status filter')
await user.click(clearButton)
```
