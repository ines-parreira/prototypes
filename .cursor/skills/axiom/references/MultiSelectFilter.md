# MultiSelectFilter

Multi-selection filter component that combines FilterButton with MultiSelect dropdown.

## Import

```typescript
import { MultiSelectFilter } from '@gorgias/axiom'
import { ListItem } from '@gorgias/axiom'
```

## Props

### MultiSelectFilterProps<T>

```typescript
type MultiSelectFilterProps<T extends object> = {
    id: string // Unique filter identifier
    label: string // Filter label
    items: T[] // Selectable items
    operator?: string // Operator text (e.g., "includes", "excludes")
    children: (option: T) => ReactNode // Render function for options
    trigger?: (props) => ReactNode // Custom trigger
    keyName?: string // Property name for unique key. Default: 'id'
}
```

## Usage

### Basic MultiSelectFilter

```typescript
<Filters>
  <MultiSelectFilter
    id="tags"
    label="Tags"
    items={[
      { id: '1', name: 'Bug' },
      { id: '2', name: 'Feature' },
      { id: '3', name: 'Enhancement' },
    ]}
  >
    {(tag) => <ListItem label={tag.name} />}
  </MultiSelectFilter>
</Filters>
```

### With Operator

```typescript
<MultiSelectFilter
  id="labels"
  label="Labels"
  operator="includes"
  items={labels}
>
  {(label) => <ListItem label={label.name} />}
</MultiSelectFilter>
```

### With Rich Items

```typescript
<MultiSelectFilter
  id="assignees"
  label="Assignees"
  items={users}
>
  {(user) => (
    <ListItem
      label={user.name}
      description={user.email}
      leadingSlot={<Avatar src={user.avatar} />}
    />
  )}
</MultiSelectFilter>
```

### With Custom Key

```typescript
<MultiSelectFilter
  id="categories"
  label="Categories"
  keyName="categoryId"
  items={categories}
>
  {(cat) => <ListItem label={cat.name} />}
</MultiSelectFilter>
```

## Related Components

- **Filters**: Container for multiple filters
- **SelectFilter**: Single-selection filter
- **DateFilter**: Date filter with operator
- **MultiSelect**: Standalone multi-select component

## Testing Queries

```typescript
// Find filter button
screen.getByRole('button', { name: 'Tags' })

// Open filter
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'Tags' }))

// Select multiple options
await user.click(screen.getByRole('option', { name: 'Bug' }))
await user.click(screen.getByRole('option', { name: 'Feature' }))

// Clear filter
const clearButton = screen.getByLabelText('Clear Tags filter')
await user.click(clearButton)
```
