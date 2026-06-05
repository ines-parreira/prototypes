# MultiSelect

Multiple-selection dropdown component with searchable and async loading support.

## Import

```typescript
import { ListItem, ListSection, MultiSelect } from '@gorgias/axiom'
```

## Props

### MultiSelectProps\<T, S\>

The MultiSelect component is a generic component. `T` is the selectable item type, `S` is the render item type (defaults to `T`, use a different type for sections/grouping).

```typescript
type MultiSelectProps<T extends object, S extends object = T> = {
    // Items
    items: Iterable<T> // Collection of selectable items
    keyName?: string // Property name for unique key. Default: 'id'

    // Render
    children: (option: S) => ReactNode // Render function for each option (uses S type for sections)
    placeholder?: string // Placeholder when no options selected. Default: 'Select items'
    trigger?: (props: MultiSelectTriggerRenderProps<T>) => ReactNode // Custom trigger render function

    // Selection
    selectedItems?: T[] | null // Currently selected items (controlled)
    onSelect?: (value: T[]) => void // Callback when selection changes
    selectionBehavior?: 'replace' | 'toggle' // Default: 'toggle'

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

type MultiSelectTriggerRenderProps<T> = {
    ref: RefObject<HTMLButtonElement> // Ref to attach to trigger
    isOpen: boolean // Whether dropdown is open
    isDisabled: boolean // Whether select is disabled
    selectedItems: T[] // Currently selected items
    selectedText: string // Comma-separated selected item labels
}
```

## Usage

### Basic MultiSelect

```typescript
type Option = { id: string; name: string }

const options: Option[] = [
  { id: '1', name: 'Cat' },
  { id: '2', name: 'Dog' },
  { id: '3', name: 'Kangaroo' },
]

// Controlled
const [selected, setSelected] = useState<Option[]>([])

<MultiSelect
  items={options}
  selectedItems={selected}
  onSelect={setSelected}
  aria-label="Animals"
>
  {(option) => <ListItem label={option.name} />}
</MultiSelect>
```

### With Initial Selection

```typescript
const [selected, setSelected] = useState<Option[]>([
  { id: '1', name: 'Cat' },
  { id: '2', name: 'Dog' },
])

<MultiSelect
  items={options}
  selectedItems={selected}
  onSelect={setSelected}
  aria-label="Animals"
>
  {(option) => <ListItem label={option.name} />}
</MultiSelect>
```

### With Placeholder

```typescript
<MultiSelect
  items={tags}
  placeholder="Choose tags"
  aria-label="Tags"
>
  {(tag) => <ListItem label={tag.name} />}
</MultiSelect>
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

<MultiSelect
  items={filteredItems}
  isSearchable
  searchValue={searchValue}
  onSearchChange={setSearchValue}
  aria-label="Search items"
>
  {(item) => <ListItem label={item.name} />}
</MultiSelect>
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

<MultiSelect items={sections} aria-label="Animals">
  {(section) => (
    <ListSection
      id={section.id}
      name={section.name}
      items={section.items}
    >
      {(option) => <ListItem label={option.name} />}
    </ListSection>
  )}
</MultiSelect>
```

### With Custom Trigger

```typescript
<MultiSelect
  items={options}
  trigger={({ selectedText, selectedItems }) => (
    <Button trailingSlot="arrow-chevron-down">
      {selectedItems.length > 0
        ? `${selectedItems.length} selected`
        : 'Select tags'}
    </Button>
  )}
  aria-label="Tags"
>
  {(option) => <ListItem label={option.label} />}
</MultiSelect>
```

### With Rich List Items

```typescript
<MultiSelect items={users} aria-label="Users">
  {(user) => (
    <ListItem
      label={user.name}
      description={user.email}
      leadingSlot={<Avatar name={user.name} src={user.avatar} />}
    />
  )}
</MultiSelect>
```

### With Header and Footer

```typescript
<MultiSelect
  items={options}
  aria-label="Options"
  header={
    <ListHeader>
      <ListHeaderItem>Choose multiple options</ListHeaderItem>
    </ListHeader>
  }
  footer={
    <ListFooter>
      <Button size="sm" onClick={handleClearAll}>
        Clear All
      </Button>
    </ListFooter>
  }
>
  {(option) => <ListItem label={option.name} />}
</MultiSelect>
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

<MultiSelect
  items={items}
  isLoading={isLoading}
  onLoadMore={loadMore}
  aria-label="Items"
>
  {(item) => <ListItem label={item.name} />}
</MultiSelect>
```

### Custom Key Name

```typescript
type CustomItem = { customId: string; name: string }

const items: CustomItem[] = [
  { customId: 'abc', name: 'First' },
  { customId: 'def', name: 'Second' },
]

<MultiSelect
  items={items}
  keyName="customId"
  aria-label="Items"
>
  {(item) => <ListItem label={item.name} />}
</MultiSelect>
```

### Selection Behavior

```typescript
// Toggle: Clicking item toggles selection (default)
<MultiSelect
  items={options}
  selectionBehavior="toggle"
  aria-label="Toggle"
>
  {(option) => <ListItem label={option.name} />}
</MultiSelect>

// Replace: Each click replaces entire selection
<MultiSelect
  items={options}
  selectionBehavior="replace"
  aria-label="Replace"
>
  {(option) => <ListItem label={option.name} />}
</MultiSelect>
```

### Placement Options

```typescript
// Center below trigger (default)
<MultiSelect items={options} placement="bottom" aria-label="Options">
  {(option) => <ListItem label={option.name} />}
</MultiSelect>

// Aligned to left edge
<MultiSelect items={options} placement="bottom-left" aria-label="Options">
  {(option) => <ListItem label={option.name} />}
</MultiSelect>

// Aligned to right edge
<MultiSelect items={options} placement="bottom-right" aria-label="Options">
  {(option) => <ListItem label={option.name} />}
</MultiSelect>
```

### Sizes

```typescript
<MultiSelect items={options} size="sm" aria-label="Small">
  {(option) => <ListItem label={option.name} />}
</MultiSelect>

<MultiSelect items={options} size="md" aria-label="Medium">
  {(option) => <ListItem label={option.name} />}
</MultiSelect>
```

### Disabled State

```typescript
<MultiSelect
  items={options}
  isDisabled
  aria-label="Disabled"
>
  {(option) => <ListItem label={option.name} />}
</MultiSelect>
```

### Clear All Selections

```typescript
const [selected, setSelected] = useState<Option[]>([])

// Clear all by setting empty array
<Button onClick={() => setSelected([])}>Clear All</Button>

<MultiSelect
  items={options}
  selectedItems={selected}
  onSelect={setSelected}
  aria-label="Options"
>
  {(option) => <ListItem label={option.name} />}
</MultiSelect>
```

### Limiting Selections

```typescript
const [selected, setSelected] = useState<Option[]>([])
const MAX_SELECTIONS = 3

const handleSelect = (newSelection: Option[]) => {
  if (newSelection.length <= MAX_SELECTIONS) {
    setSelected(newSelection)
  }
}

<MultiSelect
  items={options}
  selectedItems={selected}
  onSelect={handleSelect}
  aria-label="Options"
>
  {(option) => <ListItem label={option.name} />}
</MultiSelect>
```

## Related Components

- **MultiSelectField**: Complete form field with label, multi-select, and error message
- **Select**: Single-selection dropdown
- **CheckBoxField**: For fewer visible options
- **ListItem**: Item renderer for multi-select options
- **ListSection**: Section grouping for multi-select options

## Testing Queries

```typescript
// Find multi-select trigger button
screen.getByRole('button', { name: 'Animals' })
screen.getByText('Select items') // Default placeholder

// Open dropdown
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: 'Animals' }))

// Find options (after opening)
screen.getByRole('option', { name: 'Cat' })
screen.getByRole('option', { name: 'Dog' })
screen.getAllByRole('option') // All options

// Check if option is selected
const catOption = screen.getByRole('option', { name: 'Cat' })
expect(catOption).toHaveAttribute('aria-selected', 'true')

// Select multiple options
await user.click(screen.getByRole('option', { name: 'Cat' }))
await user.click(screen.getByRole('option', { name: 'Dog' }))

// Check trigger shows selected count
expect(screen.getByRole('button', { name: 'Animals' })).toHaveTextContent(
    'Cat, Dog',
)

// Deselect an option (toggle behavior)
await user.click(screen.getByRole('option', { name: 'Cat' }))
expect(catOption).toHaveAttribute('aria-selected', 'false')

// Disabled state
expect(screen.getByRole('button', { name: 'Animals' })).toHaveAttribute(
    'aria-disabled',
    'true',
)

// Search input (when isSearchable)
screen.getByRole('searchbox')
await user.type(screen.getByRole('searchbox'), 'cat')
```
