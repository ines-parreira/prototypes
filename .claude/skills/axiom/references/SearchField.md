# SearchField

Form field component for search input with a magnifying glass icon and clear button.

## Import

```typescript
import { SearchField } from '@gorgias/axiom'
```

## Props

### SearchFieldProps

Extends `FieldProps<string>`.

```typescript
type SearchFieldProps = {
    // Value props (controlled/uncontrolled)
    value?: string // Current value (controlled)
    defaultValue?: string // Initial value (uncontrolled)
    onChange?: (value: string) => void // Value change callback

    // Search-specific callbacks
    onClear?: () => void // Callback when clear button is clicked
    onSubmit?: (value: string) => void // Callback when Enter is pressed

    // Input props
    placeholder?: string // Placeholder text
    autoFocus?: boolean // Auto-focus on mount (default: false)
    isDisabled?: boolean // Whether field is disabled
    size?: 'sm' | 'md' // Default: 'md'
    variant?: 'primary' | 'secondary' // Default: 'primary'

    // Accessibility
    'aria-label'?: string // Accessible label (default: 'Search')

    // Other
    className?: string // Additional CSS class
    inputRef?: RefObject<HTMLInputElement> // Ref to input element
}
```

## Usage

### Basic SearchField

```typescript
// Uncontrolled (recommended)
<SearchField
  placeholder="Search..."
  defaultValue=""
  onChange={(value) => console.log(value)}
/>

// Controlled
const [search, setSearch] = useState('')
<SearchField
  placeholder="Search..."
  value={search}
  onChange={setSearch}
/>
```

### With onClear Callback

```typescript
<SearchField
  placeholder="Search users..."
  onClear={() => {
    console.log('Search cleared')
    // Optionally reset search results
  }}
/>
```

### With onSubmit Callback

```typescript
<SearchField
  placeholder="Search products..."
  onSubmit={(value) => {
    console.log('Search submitted:', value)
    // Perform search action
    performSearch(value)
  }}
/>
```

### With Custom aria-label

```typescript
<SearchField
  placeholder="Filter items..."
  aria-label="Filter items"
/>
```

### Auto-focus

```typescript
<SearchField
  placeholder="Search..."
  autoFocus
/>
```

### Sizes

```typescript
<SearchField placeholder="Small search" size="sm" />
<SearchField placeholder="Medium search" size="md" />
```

### Variants

```typescript
<SearchField placeholder="Primary" variant="primary" />
<SearchField placeholder="Secondary" variant="secondary" />
```

### Disabled State

```typescript
<SearchField placeholder="Disabled" isDisabled />
```

## Features

### Search Icon

SearchField automatically includes a magnifying glass icon in the leading slot.

### Clear Button

A clear button appears in the trailing slot when:

- The field is not disabled
- The field has a value

Clicking the clear button:

- Clears the input value
- Calls `onChange` with empty string
- Calls `onClear` callback if provided
- Refocuses the input

### Submit on Enter

Pressing Enter while focused triggers the `onSubmit` callback with the current value.

## Common Patterns

### Debounced Search

```typescript
import { useDebouncedValue } from '@gorgias/utils'

function SearchableList() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  // Use debouncedSearch for filtering
  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  return (
    <>
      <SearchField value={search} onChange={setSearch} />
      <List items={filtered}>
        {(item) => <ListItem label={item.name} />}
      </List>
    </>
  )
}
```

### Search with Submit

```typescript
function SearchWithSubmit() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])

  const handleSubmit = async (value: string) => {
    const data = await fetchSearchResults(value)
    setResults(data)
  }

  return (
    <>
      <SearchField
        value={search}
        onChange={setSearch}
        onSubmit={handleSubmit}
        placeholder="Press Enter to search"
      />
      {results.map(result => <div key={result.id}>{result.title}</div>)}
    </>
  )
}
```

## Related Components

- **TextField**: For general text input
- **SelectField**: For selecting from options with search
- **MultiSelectField**: For multi-selection with search
- **List**: Often used with SearchField for filtering

## Testing Queries

```typescript
// By role
screen.getByRole('searchbox')
screen.getByRole('searchbox', { name: 'Search' })
screen.getByRole('searchbox', { name: 'Filter items' })

// By placeholder
screen.getByPlaceholderText('Search...')

// Clear button (when value exists)
screen.getByRole('button', { name: 'Clear search' })

// Check states
expect(screen.getByRole('searchbox')).toBeDisabled()

// Interact
const input = screen.getByRole('searchbox')
await user.type(input, 'test query')
expect(input).toHaveValue('test query')

// Submit
await user.type(input, '{Enter}')
expect(onSubmit).toHaveBeenCalledWith('test query')

// Clear
const clearButton = screen.getByRole('button', { name: 'Clear search' })
await user.click(clearButton)
expect(input).toHaveValue('')
```
