# OverflowList

Automatically manages overflowing content with expand/collapse functionality, hiding items that don't fit and showing a "Show more" button.

## Import

```typescript
import {
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
} from '@gorgias/axiom'
```

## Props

### OverflowListProps

Extends standard `div` props.

```typescript
type OverflowListProps = ComponentProps<'div'> & {
    // Children
    children: ReactNode // OverflowListItem and OverflowListShowMore components

    // Expansion (controlled/uncontrolled)
    isExpanded?: boolean // Controlled expanded state
    onExpandedChange?: (expanded: boolean) => void // Expansion change callback

    // Layout
    nonExpandedLineCount?: number // Lines to show before "Show more" (default: 1)
    gap?: Size | number | `${number}px` // Spacing between items (default: 0)
}
```

### OverflowListItemProps

Extends standard `div` props.

```typescript
type OverflowListItemProps = ComponentProps<'div'> & {
    children: ReactNode // Item content
}
```

### OverflowListShowMoreProps

```typescript
type OverflowListShowMoreProps = {
    // Content
    children?: ReactNode | ((context: OverflowListContext) => ReactNode) // Button content or render function

    // Slots
    leadingSlot?: ReactNode // Content before button text
    trailingSlot?: ReactNode // Content after button text
}

type OverflowListContext = {
    hiddenCount: number // Number of hidden items
    isExpanded: boolean // Current expansion state
}
```

### OverflowListShowLessProps

```typescript
type OverflowListShowLessProps = {
    // Content
    children?: ReactNode | ((context: OverflowListContext) => ReactNode) // Button content or render function

    // Slots
    leadingSlot?: ReactNode // Content before button text
    trailingSlot?: ReactNode // Content after button text
}
```

## Usage

### Basic Overflow List (Uncontrolled)

```typescript
<OverflowList>
  <OverflowListItem>
    <Tag>JavaScript</Tag>
  </OverflowListItem>
  <OverflowListItem>
    <Tag>TypeScript</Tag>
  </OverflowListItem>
  <OverflowListItem>
    <Tag>React</Tag>
  </OverflowListItem>
  <OverflowListItem>
    <Tag>Vue</Tag>
  </OverflowListItem>
  <OverflowListShowMore />
</OverflowList>
```

### With Custom Gap

```typescript
<OverflowList gap="sm">
  <OverflowListItem><Tag>Item 1</Tag></OverflowListItem>
  <OverflowListItem><Tag>Item 2</Tag></OverflowListItem>
  <OverflowListItem><Tag>Item 3</Tag></OverflowListItem>
  <OverflowListShowMore />
</OverflowList>
```

### Multi-Line Overflow

```typescript
<OverflowList nonExpandedLineCount={2} gap="sm">
  <OverflowListItem><Tag>Tag 1</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 2</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 3</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 4</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 5</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 6</Tag></OverflowListItem>
  <OverflowListShowMore />
</OverflowList>
```

### Controlled Expansion

```typescript
function ControlledOverflowList() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <OverflowList
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
      gap="xs"
    >
      <OverflowListItem><Tag>Item 1</Tag></OverflowListItem>
      <OverflowListItem><Tag>Item 2</Tag></OverflowListItem>
      <OverflowListItem><Tag>Item 3</Tag></OverflowListItem>
      <OverflowListItem><Tag>Item 4</Tag></OverflowListItem>
      <OverflowListShowMore />
      <OverflowListShowLess />
    </OverflowList>
  )
}
```

### Custom Show More Button

```typescript
<OverflowList>
  <OverflowListItem><Tag>Tag 1</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 2</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 3</Tag></OverflowListItem>

  <OverflowListShowMore>
    View All Tags
  </OverflowListShowMore>
</OverflowList>
```

### Show More with Hidden Count

```typescript
<OverflowList>
  <OverflowListItem><Tag>Tag 1</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 2</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 3</Tag></OverflowListItem>

  <OverflowListShowMore>
    {({ hiddenCount }) => `+${hiddenCount} more`}
  </OverflowListShowMore>
</OverflowList>
```

### With Show Less Button

```typescript
<OverflowList>
  <OverflowListItem><Tag>Tag 1</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 2</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 3</Tag></OverflowListItem>

  <OverflowListShowMore />
  <OverflowListShowLess>
    Show Less
  </OverflowListShowLess>
</OverflowList>
```

### With Leading/Trailing Slots

```typescript
<OverflowList>
  <OverflowListItem><Tag>Tag 1</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 2</Tag></OverflowListItem>
  <OverflowListItem><Tag>Tag 3</Tag></OverflowListItem>

  <OverflowListShowMore
    leadingSlot={<Icon name="arrow-chevron-down" />}
    trailingSlot={<Quantity quantity={5} />}
  >
    Show More
  </OverflowListShowMore>

  <OverflowListShowLess
    leadingSlot={<Icon name="arrow-chevron-up" />}
  >
    Show Less
  </OverflowListShowLess>
</OverflowList>
```

### Dynamic Items

```typescript
function DynamicOverflowList({ tags }) {
  return (
    <OverflowList gap="xs">
      {tags.map((tag) => (
        <OverflowListItem key={tag.id}>
          <Tag onClose={() => handleRemove(tag.id)}>
            {tag.label}
          </Tag>
        </OverflowListItem>
      ))}
      <OverflowListShowMore>
        {({ hiddenCount }) => `+${hiddenCount} more`}
      </OverflowListShowMore>
    </OverflowList>
  )
}
```

## Common Patterns

### Tag List with Overflow

```typescript
function TagList({ tags }) {
  return (
    <OverflowList gap="xs" nonExpandedLineCount={2}>
      {tags.map((tag) => (
        <OverflowListItem key={tag.id}>
          <Tag color={tag.color}>{tag.label}</Tag>
        </OverflowListItem>
      ))}
      <OverflowListShowMore>
        {({ hiddenCount }) => `+${hiddenCount}`}
      </OverflowListShowMore>
      <OverflowListShowLess>
        Show Less
      </OverflowListShowLess>
    </OverflowList>
  )
}
```

### Filter Chips

```typescript
function FilterChips({ filters, onRemove }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <OverflowList
      gap="sm"
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
    >
      {filters.map((filter) => (
        <OverflowListItem key={filter.id}>
          <Tag onClose={() => onRemove(filter.id)}>
            {filter.label}: {filter.value}
          </Tag>
        </OverflowListItem>
      ))}
      <OverflowListShowMore>
        {({ hiddenCount }) => `${hiddenCount} more filter${hiddenCount > 1 ? 's' : ''}`}
      </OverflowListShowMore>
      <OverflowListShowLess />
    </OverflowList>
  )
}
```

### Badge List

```typescript
function BadgeList({ badges }) {
  return (
    <OverflowList gap="xs">
      {badges.map((badge) => (
        <OverflowListItem key={badge.id}>
          <Box
            px="sm"
            py="xs"
            borderRadius="sm"
            backgroundColor="blue-50"
          >
            <Text size="sm" weight="medium">{badge.name}</Text>
          </Box>
        </OverflowListItem>
      ))}
      <OverflowListShowMore>
        {({ hiddenCount, isExpanded }) =>
          isExpanded ? 'Collapse' : `+${hiddenCount} more badges`
        }
      </OverflowListShowMore>
      <OverflowListShowLess>
        Show Fewer
      </OverflowListShowLess>
    </OverflowList>
  )
}
```

### User List with Avatars

```typescript
function UserAvatarList({ users }) {
  return (
    <OverflowList gap={0} nonExpandedLineCount={1}>
      {users.map((user, index) => (
        <OverflowListItem
          key={user.id}
          style={{ marginLeft: index > 0 ? '-8px' : 0 }}
        >
          <Avatar
            name={user.name}
            src={user.avatar}
            size="sm"
          />
        </OverflowListItem>
      ))}
      <OverflowListShowMore>
        {({ hiddenCount }) => (
          <Avatar size="sm">
            <Text size="xs">+{hiddenCount}</Text>
          </Avatar>
        )}
      </OverflowListShowMore>
    </OverflowList>
  )
}
```

### Expandable Pill List

```typescript
function PillList({ items }) {
  return (
    <Card>
      <CardContent>
        <Box flexDirection="column" gap="sm">
          <Text weight="bold">Categories</Text>
          <OverflowList gap="xs" nonExpandedLineCount={2}>
            {items.map((item) => (
              <OverflowListItem key={item.id}>
                <Button variant="tertiary" size="sm">
                  {item.label}
                </Button>
              </OverflowListItem>
            ))}
            <OverflowListShowMore
              trailingSlot={<Icon name="arrow-chevron-down" size="sm" />}
            >
              Show All
            </OverflowListShowMore>
            <OverflowListShowLess
              trailingSlot={<Icon name="arrow-chevron-up" size="sm" />}
            >
              Show Less
            </OverflowListShowLess>
          </OverflowList>
        </Box>
      </CardContent>
    </Card>
  )
}
```

### With External Control

```typescript
function ExternallyControlledList() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Box flexDirection="column" gap="md">
      <Box flexDirection="row" gap="sm">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(true)}
        >
          Expand All
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(false)}
        >
          Collapse All
        </Button>
      </Box>

      <OverflowList
        isExpanded={isExpanded}
        onExpandedChange={setIsExpanded}
        gap="sm"
      >
        {items.map((item) => (
          <OverflowListItem key={item.id}>
            <Tag>{item.label}</Tag>
          </OverflowListItem>
        ))}
        <OverflowListShowMore />
        <OverflowListShowLess />
      </OverflowList>
    </Box>
  )
}
```

## Behavior Notes

- Automatically calculates which items fit within the specified line count
- Shows "Show more" button when items overflow
- Shows "Show less" button only when expanded AND items don't all fit
- In uncontrolled mode, automatically collapses when all items fit
- Uses ResizeObserver to recalculate on container resize
- Uses IntersectionObserver to track item visibility
- Debounces resize calculations (50ms) for performance

## Visual Design

OverflowList has:

- Flexible wrapping layout
- Configurable gap spacing between items
- Hidden items use `visibility: hidden` and `display: none`
- Show more/less buttons rendered inline with items
- Multi-line support with configurable line count
- Smooth expand/collapse transitions

## Related Components

- **OverflowListItem**: Individual item wrapper
- **OverflowListShowMore**: Show more button
- **OverflowListShowLess**: Show less button
- **Tag**: Common use case for overflow lists
- **List**: Alternative for static lists

## Testing Queries

```typescript
// Query container
const container = container.querySelector('[data-name="overflow-list"]')
expect(container).toBeInTheDocument()

// Check expansion state
expect(container).toHaveAttribute('aria-expanded', 'false')
expect(container).toHaveAttribute('aria-expanded', 'true')

// Query items
screen.getByText('Tag 1')
screen.getByText('Tag 2')
screen.getByText('Tag 3')

// Query show more button
const showMoreBtn = container.querySelector(
    'button[aria-label*="Show"][aria-label*="more"]',
)
expect(showMoreBtn).toBeInTheDocument()

// Query show less button (when expanded)
const showLessBtn = screen.getByRole('button', { name: /show less/i })
expect(showLessBtn).toBeInTheDocument()

// Interact with buttons
await user.click(showMoreBtn)
expect(onExpandedChange).toHaveBeenCalledWith(true)

await user.click(showLessBtn)
expect(onExpandedChange).toHaveBeenCalledWith(false)

// Check button content with hidden count
screen.getByText('+3 more')
screen.getByText(/View.*more/i)

// Query slots
screen.getByTestId('leading-icon')
screen.getByTestId('trailing-icon')

// Check item visibility (via styles)
const item = screen.getByText('Hidden Item')
expect(item.parentElement).toHaveStyle({ visibility: 'hidden' })
expect(item.parentElement).toHaveStyle({ display: 'none' })
```
