# FilterButton

Visual trigger button for filter components displaying label, value, and optional clear action.

## Import

```typescript
import { FilterButton, FilterValue, FilterValuesList } from '@gorgias/axiom'
```

## Props

### FilterButtonProps

```typescript
type FilterButtonProps = {
    label: string // Label text displayed on button
    children: ReactNode // Filter value content (FilterValue or FilterValuesList)
    onClick?: () => void // Callback when button is clicked
    onClear?: () => void // Callback when clear button is clicked (shows clear button)
}
```

## Usage

### Basic FilterButton

```typescript
<FilterButton label="Status">
  <FilterValue operator="is" value="Active" />
</FilterButton>
```

### With Clear Button

```typescript
<FilterButton
  label="Priority"
  onClick={handleOpen}
  onClear={handleClear}
>
  <FilterValue operator="is" value="High" />
</FilterButton>
```

### With Multiple Values

```typescript
<FilterButton
  label="Tags"
  onClick={handleOpen}
  onClear={handleClear}
>
  <FilterValuesList values={['urgent', 'bug', 'frontend']} />
</FilterButton>
```

### With FilterValue

```typescript
import { FilterValue } from '@gorgias/axiom'

<FilterButton label="Created">
  <FilterValue operator="after" value="Jan 1, 2024" />
</FilterButton>

<FilterButton label="Updated">
  <FilterValue operator="before" value="Dec 31, 2024" />
</FilterButton>

<FilterButton label="Due Date">
  <FilterValue operator="on" value="Mar 15, 2024" />
</FilterButton>
```

### With FilterValuesList

```typescript
import { FilterValuesList } from '@gorgias/axiom'

<FilterButton label="Status">
  <FilterValuesList values={['Open', 'In Progress']} />
</FilterButton>

<FilterButton label="Assignees">
  <FilterValuesList values={['John', 'Jane', 'Jim']} />
</FilterButton>
```

### Interactive Example

```typescript
const [isOpen, setIsOpen] = useState(false)
const [value, setValue] = useState('Active')

const handleClear = () => {
  setValue(null)
}

<FilterButton
  label="Status"
  onClick={() => setIsOpen(true)}
  onClear={value ? handleClear : undefined}
>
  {value ? (
    <FilterValue operator="is" value={value} />
  ) : (
    <Text size="sm" color="var(--grey-500)">Select...</Text>
  )}
</FilterButton>

{isOpen && (
  <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
    {/* Filter selection UI */}
  </Modal>
)}
```

## Sub-components

### FilterValue

Displays a single filter value with an operator.

```typescript
type FilterValueProps = {
  operator: 'is' | 'is not' | 'before' | 'after' | 'on' | 'between'
  value: string
}

<FilterValue operator="is" value="Active" />
<FilterValue operator="after" value="Jan 1, 2024" />
<FilterValue operator="between" value="Jan 1 - Jan 31" />
```

### FilterValuesList

Displays multiple filter values as a comma-separated list.

```typescript
type FilterValuesListProps = {
  values: string[]
  max?: number  // Max values to show before "+X more". Default: 2
}

<FilterValuesList values={['Open', 'In Progress', 'Closed']} />
// Displays: "Open, In Progress, +1 more"

<FilterValuesList values={['tag1', 'tag2', 'tag3']} max={3} />
// Displays: "tag1, tag2, tag3"
```

## Usage in Filter Components

FilterButton is typically used inside filter components like SelectFilter, DateFilter, etc.

```typescript
// Inside a custom filter component
<Filter id="status" label="Status">
  {({ value, isOpen, update }) => (
    <>
      <FilterButton
        label="Status"
        onClick={() => update({ isOpen: true })}
        onClear={() => update({ value: null, isActive: false })}
      >
        {value ? (
          <FilterValue operator="is" value={value} />
        ) : (
          <Text size="sm" color="var(--grey-500)">Any</Text>
        )}
      </FilterButton>

      {isOpen && (
        <Popover>
          {/* Filter selection UI */}
        </Popover>
      )}
    </>
  )}
</Filter>
```

## Related Components

- **Filters**: Container for managing multiple filters
- **SelectFilter**: Single-selection filter using FilterButton
- **MultiSelectFilter**: Multi-selection filter using FilterButton
- **DateFilter**: Date filter using FilterButton
- **DateRangeFilter**: Date range filter using FilterButton
- **BooleanFilter**: Boolean filter using FilterButton
- **FilterValue**: Single filter value display
- **FilterValuesList**: Multiple filter values display

## Testing Queries

```typescript
// Find filter button by label
screen.getByRole('button', { name: /status/i })
screen.getByText('Status')

// Find clear button
const clearButtons = screen.getAllByRole('button')
const clearButton = clearButtons.find((btn) =>
    btn.querySelector('[data-icon="close"]'),
)

// Click filter button
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: /status/i }))

// Click clear button
if (clearButton) {
    await user.click(clearButton)
}

// Check filter value
expect(screen.getByText('Active')).toBeInTheDocument()
expect(screen.getByText('is')).toBeInTheDocument()
```
