# List

Flexible collection component for displaying selectable, searchable lists of items with support for sections, async loading, and customizable rendering.

## Import

```typescript
import {
    List,
    ListFooter,
    ListHeader,
    ListHeaderItem,
    ListItem,
    ListSection,
} from '@gorgias/axiom'
```

## Props

### ListProps

```typescript
type ListProps<T extends object> = {
    // Required
    items: Iterable<T> // Collection of items to display
    children: (item: T) => ReactNode // Render function for each item
    'aria-label': string // Accessibility label for the list

    // Layout
    size?: ListSize // Size of list items (default: 'md')
    elevation?: ListElevation // Shadow elevation (default: 'high')
    minWidth?: number | string // Minimum width
    maxWidth?: number | string // Maximum width (default: 500)
    maxHeight?: number | string // Maximum height (enables scrolling)

    // Search
    isSearchable?: boolean // Enable search field
    searchValue?: string // Controlled search value
    onSearchChange?: (value: string) => void // Search change callback

    // Selection
    selectionMode?: ListSelectionMode // Selection mode (default: 'single')
    selectionBehavior?: ListSelectionBehavior // Selection behavior
    selectedKeys?: Selection // Controlled selected keys
    defaultSelectedKeys?: Selection // Initial selected keys (uncontrolled)
    onSelectionChange?: (keys: Selection) => void // Selection change callback
    disabledKeys?: Iterable<Key> // Keys of disabled items

    // Async Loading
    isLoading?: boolean // Show loading spinner
    onLoadMore?: () => void // Load more callback (enables async loading)

    // Additional content
    header?: ReactNode // Header content (use ListHeader)
    footer?: ReactNode // Footer content (use ListFooter)
}

// Size options
type ListSize = 'sm' | 'md'

// Elevation options
type ListElevation = 'high' | 'mid'

// Selection mode
type ListSelectionMode = 'single' | 'multiple'

// Selection behavior
type ListSelectionBehavior = 'replace' | 'toggle'
```

### ListItemProps

```typescript
type ListItemProps = {
    // Content
    label: string | ReactNode // Primary text (required)
    caption?: string | ReactNode // Secondary text

    // Slots
    leadingSlot?:
        | IconName
        | ReactNode
        | ((state: { isSelected: boolean }) => ReactNode)
    trailingSlot?: IconName | ReactNode

    // Style
    intent?: Intent // Visual intent (default: 'regular')

    // State
    isDisabled?: boolean // Whether item is disabled

    // Standard props
    id?: Key // Unique identifier
    textValue?: string // Text for search/accessibility
}
```

## Usage

### Basic List

```typescript
const items = [
  { id: '1', name: 'Cat', type: 'pet' },
  { id: '2', name: 'Dog', type: 'pet' },
  { id: '3', name: 'Lion', type: 'wild' },
]

<List items={items} aria-label="Animals">
  {(item) => <ListItem label={item.name} />}
</List>
```

### With Captions

```typescript
<List items={items} aria-label="Animals">
  {(item) => (
    <ListItem
      label={item.name}
      caption={item.type}
    />
  )}
</List>
```

### With Icons

```typescript
<List items={items} aria-label="Tasks">
  {(item) => (
    <ListItem
      leadingSlot="check"
      trailingSlot="arrow-right"
      label={item.name}
    />
  )}
</List>
```

### Searchable List

```typescript
// Uncontrolled search (automatic filtering)
<List items={items} aria-label="Animals" isSearchable>
  {(item) => <ListItem label={item.name} caption={item.type} />}
</List>

// Controlled search (manual filtering)
function SearchableList() {
  const [searchValue, setSearchValue] = useState('')

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <List
      items={filteredItems}
      aria-label="Animals"
      isSearchable
      searchValue={searchValue}
      onSearchChange={setSearchValue}
    >
      {(item) => <ListItem label={item.name} />}
    </List>
  )
}
```

### Single Selection

```typescript
function SingleSelectList() {
  const [selectedKeys, setSelectedKeys] = useState(new Set())

  return (
    <List
      items={items}
      aria-label="Animals"
      selectionMode="single"
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
    >
      {(item) => <ListItem label={item.name} />}
    </List>
  )
}
```

### Multiple Selection

```typescript
function MultiSelectList() {
  const [selectedKeys, setSelectedKeys] = useState(new Set())

  return (
    <List
      items={items}
      aria-label="Animals"
      selectionMode="multiple"
      selectionBehavior="toggle"
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
    >
      {(item) => (
        <ListItem
          leadingSlot={({ isSelected }) => (
            <CheckBoxField value={isSelected} />
          )}
          label={item.name}
        />
      )}
    </List>
  )
}
```

### With Sections

```typescript
const sections = [
  {
    name: 'Pets',
    items: [
      { id: '1', name: 'Cat' },
      { id: '2', name: 'Dog' },
    ],
  },
  {
    name: 'Wild Animals',
    items: [
      { id: '3', name: 'Lion' },
      { id: '4', name: 'Tiger' },
    ],
  },
]

<List items={sections} aria-label="Animals">
  {(section) => (
    <ListSection
      id={section.name}
      name={section.name}
      items={section.items}
    >
      {(item) => <ListItem label={item.name} />}
    </ListSection>
  )}
</List>
```

### With Header and Footer

```typescript
<List
  items={items}
  aria-label="Animals"
  header={
    <ListHeader>
      <ListHeaderItem
        label="All Animals"
        caption={`${items.length} items`}
      />
    </ListHeader>
  }
  footer={
    <ListFooter>
      <Button variant="tertiary" size="sm">
        View All
      </Button>
    </ListFooter>
  }
>
  {(item) => <ListItem label={item.name} />}
</List>
```

### Async Loading (Infinite Scroll)

```typescript
function AsyncList() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const loadMore = async () => {
    setIsLoading(true)
    const newItems = await fetchMoreItems()
    setItems((prev) => [...prev, ...newItems])
    setIsLoading(false)
  }

  return (
    <List
      items={items}
      aria-label="Items"
      isLoading={isLoading}
      onLoadMore={loadMore}
      maxHeight={400}
    >
      {(item) => <ListItem label={item.name} />}
    </List>
  )
}
```

### With Different Intents

```typescript
<List items={tasks} aria-label="Tasks">
  {(task) => (
    <ListItem
      label={task.name}
      intent={task.intent}  // 'regular', 'ai', 'destructive'
      leadingSlot={task.icon}
    />
  )}
</List>
```

### Disabled Items

```typescript
<List items={items} aria-label="Items">
  {(item) => (
    <ListItem
      label={item.name}
      isDisabled={item.isDisabled}
    />
  )}
</List>
```

## Common Patterns

### User Selection List

```typescript
function UserList({ users, onSelect }) {
  return (
    <List
      items={users}
      aria-label="Users"
      selectionMode="single"
      onSelectionChange={(keys) => {
        const selectedId = Array.from(keys)[0]
        const user = users.find((u) => u.id === selectedId)
        onSelect(user)
      }}
    >
      {(user) => (
        <ListItem
          leadingSlot={<Avatar name={user.name} size="sm" />}
          label={user.name}
          caption={user.email}
        />
      )}
    </List>
  )
}
```

### Filterable List with Search

```typescript
function FilterableList({ items }) {
  const [searchValue, setSearchValue] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchValue.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <>
      <Box flexDirection="row" gap="sm" mb="sm">
        <Button
          variant={categoryFilter === 'all' ? 'primary' : 'tertiary'}
          size="sm"
          onClick={() => setCategoryFilter('all')}
        >
          All
        </Button>
        <Button
          variant={categoryFilter === 'active' ? 'primary' : 'tertiary'}
          size="sm"
          onClick={() => setCategoryFilter('active')}
        >
          Active
        </Button>
      </Box>

      <List
        items={filteredItems}
        aria-label="Items"
        isSearchable
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        maxHeight={400}
      >
        {(item) => <ListItem label={item.name} caption={item.category} />}
      </List>
    </>
  )
}
```

### Bulk Actions with Multi-Select

```typescript
function BulkActionList({ items, onDelete }) {
  const [selectedKeys, setSelectedKeys] = useState(new Set())

  const handleDelete = () => {
    const selectedIds = Array.from(selectedKeys)
    onDelete(selectedIds)
    setSelectedKeys(new Set())
  }

  return (
    <>
      {selectedKeys.size > 0 && (
        <Box flexDirection="row" gap="sm" mb="sm">
          <Text>{selectedKeys.size} selected</Text>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Delete Selected
          </Button>
        </Box>
      )}

      <List
        items={items}
        aria-label="Items"
        selectionMode="multiple"
        selectionBehavior="toggle"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
      >
        {(item) => (
          <ListItem
            leadingSlot={({ isSelected }) => (
              <CheckBoxField value={isSelected} />
            )}
            label={item.name}
          />
        )}
      </List>
    </>
  )
}
```

## Visual Design

List has:

- Elevation shadow for visual depth (high or mid)
- Rounded corners
- Scrollable container when maxHeight is set
- Built-in search field when searchable
- Loading spinner for async loading
- Empty state ("No results found") when no items match

## Related Components

- **ListItem**: Individual list item component
- **ListSection**: Section grouping for lists
- **ListHeader**: Header container for lists
- **ListFooter**: Footer container for lists
- **ListHeaderItem**: Clickable header item
- **OverflowList**: For lists with overflow behavior
- **Menu**: For dropdown menus
- **Select**: For dropdown selection

## Testing Queries

```typescript
// Query list container
const list = container.querySelector('[data-name="list"]')
expect(list).toBeInTheDocument()

// Query list items
const items = screen.getAllByRole('option')
expect(items).toHaveLength(3)

// Query specific item
const item = screen.getByRole('option', { name: 'Cat' })
expect(item).toBeInTheDocument()

// Query search field (when searchable)
const searchbox = screen.getByRole('searchbox')
expect(searchbox).toBeInTheDocument()

// Check selection
const item = screen.getByRole('option', { name: 'Cat' })
expect(item).toHaveAttribute('aria-selected', 'true')

// Check disabled
const item = screen.getByRole('option', { name: 'Dog' })
expect(item).toHaveAttribute('aria-disabled', 'true')

// Query loading spinner
const spinner = screen.getByRole('status')
expect(spinner).toBeInTheDocument()

// Query empty state
screen.getByText('No results found')

// Query icons in list items
screen.getAllByRole('img', { name: 'star' })

// Interact with list items
await user.click(screen.getByRole('option', { name: 'Cat' }))
expect(onSelectionChange).toHaveBeenCalled()

// Type in search field
await user.type(screen.getByRole('searchbox'), 'cat')
expect(screen.getByRole('searchbox')).toHaveValue('cat')
```
