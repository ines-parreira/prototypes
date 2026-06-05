# Pagination

Navigation controls for paginated content with previous/next buttons and optional items-per-page selector.

## Import

```typescript
import { Pagination } from '@gorgias/axiom'
```

## Props

### PaginationProps

```typescript
type PaginationProps = {
    // Required
    hasNextPage: boolean // Whether next page is available
    hasPreviousPage: boolean // Whether previous page is available

    // Actions
    onPageChange?: (direction: 'next' | 'previous') => void // Page navigation callback
    onItemsPerPageChange?: (itemsPerPage: number) => void // Items per page change callback

    // Items per page
    options?: number[] // Available items per page options (default: [10, 20, 50, 100])
    hasLinesPerPage?: boolean // Show items per page selector (default: true)

    // State
    isDisabled?: boolean // Disable all controls (default: false)
}
```

## Usage

### Basic Pagination

```typescript
function PaginatedList() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <>
      {/* Your paginated content */}

      <Pagination
        hasNextPage={currentPage < totalPages}
        hasPreviousPage={currentPage > 1}
        onPageChange={(direction) => {
          if (direction === 'next') {
            setCurrentPage((prev) => prev + 1)
          } else {
            setCurrentPage((prev) => prev - 1)
          }
        }}
      />
    </>
  )
}
```

### With Items Per Page Selection

```typescript
function PaginatedListWithOptions() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayedItems = allItems.slice(startIndex, endIndex)

  return (
    <>
      {displayedItems.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}

      <Pagination
        hasNextPage={endIndex < allItems.length}
        hasPreviousPage={currentPage > 1}
        onPageChange={(direction) => {
          setCurrentPage((prev) =>
            direction === 'next' ? prev + 1 : prev - 1
          )
        }}
        onItemsPerPageChange={(count) => {
          setItemsPerPage(count)
          setCurrentPage(1)  // Reset to first page
        }}
      />
    </>
  )
}
```

### Custom Options

```typescript
<Pagination
  hasNextPage={hasMore}
  hasPreviousPage={page > 1}
  options={[5, 15, 25, 50]}
  onPageChange={handlePageChange}
  onItemsPerPageChange={handleItemsPerPageChange}
/>
```

### Without Items Per Page Selector

```typescript
<Pagination
  hasNextPage={currentPage < totalPages}
  hasPreviousPage={currentPage > 1}
  onPageChange={handlePageChange}
  hasLinesPerPage={false}
/>
```

### Disabled State

```typescript
<Pagination
  hasNextPage={true}
  hasPreviousPage={true}
  onPageChange={handlePageChange}
  isDisabled={isLoading}
/>
```

## Common Patterns

### API Pagination

```typescript
function ApiPaginatedList() {
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const { data, isLoading } = useQuery({
    queryKey: ['items', page, itemsPerPage],
    queryFn: () => fetchItems(page, itemsPerPage),
  })

  return (
    <Box flexDirection="column" gap="md">
      {data?.items.map((item) => (
        <ListItem key={item.id} label={item.name} />
      ))}

      <Pagination
        hasNextPage={data?.hasMore ?? false}
        hasPreviousPage={page > 1}
        isDisabled={isLoading}
        onPageChange={(direction) => {
          setPage((prev) => (direction === 'next' ? prev + 1 : prev - 1))
        }}
        onItemsPerPageChange={(count) => {
          setItemsPerPage(count)
          setPage(1)
        }}
      />
    </Box>
  )
}
```

### Infinite Scroll Fallback

```typescript
function HybridPaginatedList() {
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [items, setItems] = useState([])

  return (
    <Box flexDirection="column" gap="md">
      <Box flexDirection="column" maxHeight="500px" overflow="auto">
        {items.map((item) => (
          <ListItem key={item.id} label={item.name} />
        ))}
      </Box>

      <Pagination
        hasNextPage={items.length >= itemsPerPage}
        hasPreviousPage={page > 1}
        onPageChange={(direction) => {
          if (direction === 'next') {
            loadNextPage()
          } else {
            loadPreviousPage()
          }
        }}
        onItemsPerPageChange={(count) => {
          setItemsPerPage(count)
          refreshData(count)
        }}
      />
    </Box>
  )
}
```

### Table Pagination

```typescript
function PaginatedTable({ data }) {
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const startIndex = (page - 1) * itemsPerPage
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage)

  return (
    <>
      <Table
        data={paginatedData}
        columns={columns}
      />

      <Box mt="md">
        <Pagination
          hasNextPage={startIndex + itemsPerPage < data.length}
          hasPreviousPage={page > 1}
          options={[10, 25, 50, 100]}
          onPageChange={(direction) => {
            setPage((prev) =>
              direction === 'next' ? prev + 1 : prev - 1
            )
          }}
          onItemsPerPageChange={(count) => {
            setItemsPerPage(count)
            setPage(1)
          }}
        />
      </Box>
    </>
  )
}
```

### With Page Info

```typescript
function PaginationWithInfo() {
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const totalItems = 157
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const startItem = (page - 1) * itemsPerPage + 1
  const endItem = Math.min(page * itemsPerPage, totalItems)

  return (
    <Box flexDirection="row" justifyContent="space-between" alignItems="center">
      <Text size="sm" color="text-secondary">
        Showing {startItem}-{endItem} of {totalItems} items
      </Text>

      <Pagination
        hasNextPage={page < totalPages}
        hasPreviousPage={page > 1}
        onPageChange={(direction) => {
          setPage((prev) =>
            direction === 'next' ? prev + 1 : prev - 1
          )
        }}
        onItemsPerPageChange={(count) => {
          setItemsPerPage(count)
          setPage(1)
        }}
      />
    </Box>
  )
}
```

### Search Results Pagination

```typescript
function SearchResults({ query }) {
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const { results, totalCount } = useSearch(query, page, itemsPerPage)

  // Reset to page 1 when query changes
  useEffect(() => {
    setPage(1)
  }, [query])

  return (
    <>
      <Box flexDirection="column" gap="sm">
        {results.map((result) => (
          <SearchResultItem key={result.id} result={result} />
        ))}
      </Box>

      {totalCount > itemsPerPage && (
        <Pagination
          hasNextPage={page * itemsPerPage < totalCount}
          hasPreviousPage={page > 1}
          onPageChange={(direction) => {
            setPage((prev) =>
              direction === 'next' ? prev + 1 : prev - 1
            )
          }}
          onItemsPerPageChange={(count) => {
            setItemsPerPage(count)
            setPage(1)
          }}
        />
      )}
    </>
  )
}
```

## Visual Design

Pagination has:

- Previous/next navigation buttons with chevron icons
- Items per page dropdown selector
- "items/page" label text
- Disabled state for navigation buttons when no more pages
- Compact horizontal layout
- Consistent spacing between elements

## Behavior Notes

- Previous button is disabled when `hasPreviousPage` is false
- Next button is disabled when `hasNextPage` is false
- All controls disabled when `isDisabled` is true
- Items per page selector defaults to first option in `options` array
- Current selection is not shown in dropdown options (filtered out)
- Chevron icon in selector changes based on open/closed state

## Related Components

- **Table**: Often used with pagination
- **List**: Can be paginated with this component
- **Button**: Navigation buttons
- **Select**: Items per page selector

## Testing Queries

```typescript
// Query pagination container
const pagination = container.querySelector('[data-name="pagination"]')
expect(pagination).toBeInTheDocument()

// Query navigation buttons
const prevButton = screen.getByLabelText('Previous page')
const nextButton = screen.getByLabelText('Next page')
expect(prevButton).toBeInTheDocument()
expect(nextButton).toBeInTheDocument()

// Query items per page selector
const selector = screen.getByLabelText('Items per page')
expect(selector).toBeInTheDocument()

// Check disabled state
expect(prevButton).toBeDisabled()
expect(nextButton).not.toBeDisabled()

// Interact with navigation
await user.click(nextButton)
expect(onPageChange).toHaveBeenCalledWith('next')

await user.click(prevButton)
expect(onPageChange).toHaveBeenCalledWith('previous')

// Interact with items per page selector
await user.click(selector)
const option50 = screen.getByRole('option', { name: '50' })
await user.click(option50)
expect(onItemsPerPageChange).toHaveBeenCalledWith(50)

// Query icons
screen.getByLabelText('arrow-chevron-left')
screen.getByLabelText('arrow-chevron-right')
screen.getByLabelText('arrow-chevron-down') // When closed
screen.getByLabelText('arrow-chevron-up') // When open

// Check text
screen.getByText('items/page')
screen.getByText('20') // Current selection
```
