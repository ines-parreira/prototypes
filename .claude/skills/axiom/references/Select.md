# Select

Single-selection dropdown component with searchable and async loading support.

## Import

```typescript
import { ListItem, ListSection, Select, SelectTrigger } from '@gorgias/axiom'
```

## Props

### SelectProps\<T, S\>

The Select component is a generic component. `T` is the selectable item type, `S` is the render item type (defaults to `T`, use a different type for sections/grouping).

```typescript
type SelectProps<T extends object, S extends object = T> = {
    // Items
    items: Iterable<T> // Collection of selectable items
    keyName?: string // Property name for unique key. Default: 'id'

    // Render
    children: (option: S) => ReactNode // Render function for each option (uses S type for sections)
    placeholder?: string // Placeholder when no option selected. Default: 'Select an item'
    trigger?: (props: SelectTriggerRenderProps<T>) => ReactNode // Custom trigger render function

    // Selection
    selectedItem?: T | null // Currently selected item (controlled)
    onSelect?: (value: T) => void // Callback when item is selected
    selectionBehavior?: 'replace' | 'toggle' // Default: 'replace'

    // Search
    isSearchable?: boolean // Enable search input. Default: false
    searchValue?: string // Search text (controlled)
    onSearchChange?: (value: string) => void // Search change callback

    // Visibility (controlled/uncontrolled)
    isOpen?: boolean // Whether dropdown is open (controlled)
    defaultOpen?: boolean // Initial open state (uncontrolled)
    onOpenChange?: (isOpen: boolean) => void // Open state change callback

    // Async Loading
    isLoading?: boolean // Show loading state
    onLoadMore?: () => void // Callback for infinite scroll

    // Layout
    placement?: SelectPlacement // Dropdown position. Default: 'Bottom'
    shouldFlip?: boolean // Flip when insufficient space. Default: true
    maxHeight?: number | string // Max height of dropdown
    minWidth?: number | string // Min width of dropdown
    maxWidth?: number | string // Max width of dropdown
    size?: 'sm' | 'md' // List item size. Default: 'md'

    // State
    isDisabled?: boolean // Whether select is disabled
    'aria-label'?: string // Accessible label (required if no visible label)
}

type SelectPlacement = 'bottom' | 'bottom-left' | 'bottom-right'

type SelectTriggerRenderProps<T> = {
    ref: RefObject<HTMLButtonElement> // Ref to attach to trigger
    isOpen: boolean // Whether dropdown is open
    isDisabled: boolean // Whether select is disabled
    selectedItem: T | null // Currently selected item
    selectedText: string // Display text of selected item
}
```

## Usage

### Basic Select

```typescript
type Option = { id: string; name: string }

const options: Option[] = [
  { id: '1', name: 'Cat' },
  { id: '2', name: 'Dog' },
  { id: '3', name: 'Kangaroo' },
]

// Controlled
const [selected, setSelected] = useState<Option | null>(null)

<Select
  items={options}
  selectedItem={selected}
  onSelect={setSelected}
  aria-label="Animals"
>
  {(option) => <ListItem label={option.name} />}
</Select>
```

### With Placeholder

```typescript
<Select
  items={countries}
  placeholder="Choose a country"
  aria-label="Country"
>
  {(country) => <ListItem label={country.name} />}
</Select>
```

### With Search

```typescript
const [searchValue, setSearchValue] = useState('')

// Filter items based on search
const filteredItems = useMemo(
  () => items.filter(item =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  ),
  [items, searchValue]
)

<Select
  items={filteredItems}
  isSearchable
  searchValue={searchValue}
  onSearchChange={setSearchValue}
  aria-label="Search items"
>
  {(item) => <ListItem label={item.name} />}
</Select>
```

### With Sections

```typescript
type Section = {
  id: string
  name: string
  items: Option[]
}

const sections: Section[] = [
  {
    id: '1',
    name: 'Pets',
    items: [
      { id: '1', name: 'Cat' },
      { id: '2', name: 'Dog' },
    ],
  },
  {
    id: '2',
    name: 'Wild animals',
    items: [{ id: '3', name: 'Kangaroo' }],
  },
]

<Select items={sections} aria-label="Animals">
  {(section) => (
    <ListSection
      id={section.id}
      name={section.name}
      items={section.items}
    >
      {(option) => <ListItem label={option.name} />}
    </ListSection>
  )}
</Select>
```

### With Custom Trigger

```typescript
// Interactive element (Button, StatusButton, etc.)
<Select
  items={options}
  trigger={({ selectedText }) => (
    <Button trailingSlot="arrow-chevron-down">
      {selectedText || 'Select priority'}
    </Button>
  )}
  aria-label="Priority"
>
  {(option) => <ListItem label={option.label} />}
</Select>

// Non-interactive element (requires SelectTrigger wrapper)
<Select
  items={options}
  trigger={({ selectedText }) => (
    <SelectTrigger>
      <Box p="md" style={{ border: '1px solid' }}>
        {selectedText || 'Custom trigger'}
      </Box>
    </SelectTrigger>
  )}
  aria-label="Custom"
>
  {(option) => <ListItem label={option.label} />}
</Select>
```

### With Rich List Items

```typescript
<Select items={users} aria-label="Users">
  {(user) => (
    <ListItem
      label={user.name}
      description={user.email}
      leadingSlot={<Avatar name={user.name} src={user.avatar} />}
    />
  )}
</Select>
```

### With Header and Footer

```typescript
<Select
  items={options}
  aria-label="Options"
  header={
    <ListHeader>
      <ListHeaderItem>Choose an option</ListHeaderItem>
    </ListHeader>
  }
  footer={
    <ListFooter>
      <Button size="sm" onClick={handleAddNew}>
        Add New
      </Button>
    </ListFooter>
  }
>
  {(option) => <ListItem label={option.name} />}
</Select>
```

### With Async Loading

```typescript
const [items, setItems] = useState<Item[]>([])
const [isLoading, setIsLoading] = useState(false)

const loadMore = async () => {
  setIsLoading(true)
  const newItems = await fetchMoreItems()
  setItems([...items, ...newItems])
  setIsLoading(false)
}

<Select
  items={items}
  isLoading={isLoading}
  onLoadMore={loadMore}
  aria-label="Items"
>
  {(item) => <ListItem label={item.name} />}
</Select>
```

### Custom Key Name

```typescript
type CustomItem = { customId: string; name: string }

const items: CustomItem[] = [
  { customId: 'abc', name: 'First' },
  { customId: 'def', name: 'Second' },
]

<Select
  items={items}
  keyName="customId"
  aria-label="Items"
>
  {(item) => <ListItem label={item.name} />}
</Select>
```

### Placement Options

```typescript
// Center below trigger (default)
<Select items={options} placement="bottom" aria-label="Options">
  {(option) => <ListItem label={option.name} />}
</Select>

// Aligned to left edge
<Select items={options} placement="bottom-left" aria-label="Options">
  {(option) => <ListItem label={option.name} />}
</Select>

// Aligned to right edge
<Select items={options} placement="bottom-right" aria-label="Options">
  {(option) => <ListItem label={option.name} />}
</Select>
```

### Sizes

```typescript
<Select items={options} size="sm" aria-label="Small">
  {(option) => <ListItem label={option.name} />}
</Select>

<Select items={options} size="md" aria-label="Medium">
  {(option) => <ListItem label={option.name} />}
</Select>
```

### Disabled State

```typescript
<Select
  items={options}
  isDisabled
  aria-label="Disabled"
>
  {(option) => <ListItem label={option.name} />}
</Select>
```

### Selection Behavior

```typescript
// Replace: Clicking selected item keeps it selected (default)
<Select
  items={options}
  selectionBehavior="replace"
  aria-label="Replace"
>
  {(option) => <ListItem label={option.name} />}
</Select>

// Toggle: Clicking selected item deselects it
<Select
  items={options}
  selectionBehavior="toggle"
  aria-label="Toggle"
>
  {(option) => <ListItem label={option.name} />}
</Select>
```

## Related Components

- **SelectField**: Complete form field with label, select, and error message
- **MultiSelect**: Multi-selection dropdown with chips
- **Menu**: Action menu without selection state
- **RadioGroup**: Radio button group for visible options
- **ListItem**: Item renderer for select options
- **ListSection**: Section grouping for select options

## Testing Queries

```typescript
// Find select trigger button
screen.getByRole('button', { name: 'Animals' })
screen.getByText('Select an item') // Default placeholder

// Open dropdown
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'Animals' }))

// Find options (after opening)
screen.getByRole('option', { name: 'Cat' })
screen.getByRole('option', { name: 'Dog' })
screen.getAllByRole('option') // All options

// Select an option
await user.click(screen.getByRole('option', { name: 'Cat' }))

// Check selected state
expect(screen.getByRole('button', { name: 'Animals' })).toHaveTextContent('Cat')

// Disabled state
expect(screen.getByRole('button', { name: 'Animals' })).toHaveAttribute(
    'aria-disabled',
    'true',
)

// Search input (when isSearchable)
screen.getByRole('searchbox')
await user.type(screen.getByRole('searchbox'), 'cat')
```
