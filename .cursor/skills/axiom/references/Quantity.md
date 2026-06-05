# Quantity

Numeric badge component for displaying counts, unread items, or notifications.

## Import

```typescript
import { Quantity, QuantityColor, QuantitySize } from '@gorgias/axiom'
```

## Props

### QuantityProps

```typescript
type QuantityProps = {
    quantity: number // The numeric value to display (required)
    color?: QuantityColor // Color variant (default: undefined/grey border)
    maxQuantity?: number // Maximum value to display. Shows "max+" when exceeded
    size?: QuantitySize // Size variant (default: 'md')
    compact?: boolean // Format numbers ≥ 1000 as "1k", "1.5k", "5k+", etc.
}
```

### QuantityColor

```typescript
type QuantityColor = 'grey' | 'blue' | 'red' | 'purple'
```

### QuantitySize

```typescript
type QuantitySize = 'sm' | 'md'
```

## Usage

### Basic Quantity

```typescript
// Default appearance
<Quantity quantity={5} />
```

### Different Numbers

```typescript
// Single digit
<Quantity quantity={3} />

// Double digits
<Quantity quantity={42} />

// Triple digits
<Quantity quantity={999} />

// Large numbers
<Quantity quantity={1234} />
```

### Color Variants

```typescript
// Default (grey border, no background)
<Quantity quantity={5} />

// Grey background
<Quantity quantity={8} color="grey" />

// Blue background
<Quantity quantity={12} color="blue" />

// Red background (useful for errors or urgent items)
<Quantity quantity={3} color="red" />

// Purple background
<Quantity quantity={15} color="purple" />
```

### Size Variants

```typescript
// Medium size (default)
<Quantity quantity={5} />
<Quantity quantity={5} size="md" />

// Small size
<Quantity quantity={5} size="sm" />

// Combine size with colors
<Quantity quantity={12} size="sm" color="red" />
<Quantity quantity={12} size="md" color="blue" />
```

### With Maximum Quantity

```typescript
// Display actual quantity when below max
<Quantity quantity={42} maxQuantity={99} />  // Shows "42"

// Display "max+" when quantity exceeds maximum
<Quantity quantity={150} maxQuantity={99} /> // Shows "99+"

// Common use case: limit display to 99
<Quantity quantity={9999} maxQuantity={99} /> // Shows "99+"

// Can be combined with colors
<Quantity quantity={250} maxQuantity={99} color="red" /> // Shows "99+" in red
```

### Compact Notation

```typescript
// Numbers below 1000 are unchanged
<Quantity quantity={999} compact />  // Shows "999"

// Numbers ≥ 1000 use SI suffix with up to 1 decimal
<Quantity quantity={1000} compact />  // Shows "1k"
<Quantity quantity={1500} compact />  // Shows "1.5k"
<Quantity quantity={5000} compact />  // Shows "5k"

// Combines with maxQuantity — overflow label also uses compact format
<Quantity quantity={9999} maxQuantity={5000} compact /> // Shows "5k+"

// A title attribute is set automatically when the display value differs
// from the raw number, so the full value is accessible on hover
<Quantity quantity={1500} compact /> // title="1500"
```

## Common Patterns

### Unread Count Badge

```typescript
function UnreadBadge({ count }) {
  if (count === 0) return null

  return (
    <Box flexDirection="row" alignItems="center" gap="sm">
      <Text>Unread messages</Text>
      <Quantity quantity={count} />
    </Box>
  )
}
```

### Notification Count

```typescript
function NotificationIcon({ count }) {
  return (
    <Box position="relative">
      <Icon name="bell" size="md" />
      {count > 0 && (
        <Box position="absolute" style={{ top: -4, right: -4 }}>
          <Quantity quantity={count} />
        </Box>
      )}
    </Box>
  )
}
```

### Tab with Count

```typescript
function TabWithCount({ label, count, isSelected }) {
  return (
    <Box flexDirection="row" gap="sm" alignItems="center">
      <Text weight={isSelected ? 'bold' : 'regular'}>{label}</Text>
      {count > 0 && <Quantity quantity={count} />}
    </Box>
  )
}

// Usage
<TabWithCount label="Inbox" count={15} isSelected />
<TabWithCount label="Spam" count={3} isSelected={false} />
```

### List with Counts

```typescript
function FolderList({ folders }) {
  return (
    <Box flexDirection="column">
      {folders.map((folder) => (
        <ListItem
          key={folder.id}
          leadingSlot={<Icon name="folder" />}
          label={folder.name}
          trailingSlot={
            folder.itemCount > 0 && (
              <Quantity quantity={folder.itemCount} />
            )
          }
        />
      ))}
    </Box>
  )
}
```

### Category Counts

```typescript
function CategoryFilter({ categories, selectedId }) {
  return (
    <Box flexDirection="column" gap="xs">
      {categories.map((category) => (
        <Box
          key={category.id}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          p="sm"
        >
          <Text weight={category.id === selectedId ? 'bold' : 'regular'}>
            {category.name}
          </Text>
          <Quantity quantity={category.count} />
        </Box>
      ))}
    </Box>
  )
}
```

### Shopping Cart Count

```typescript
function CartButton({ itemCount }) {
  return (
    <Button variant="tertiary" leadingSlot="shopping-cart">
      Cart
      {itemCount > 0 && (
        <Box ml="xs">
          <Quantity quantity={itemCount} />
        </Box>
      )}
    </Button>
  )
}
```

### Status with Count

```typescript
function StatusCount({ status, count }) {
  const colors = {
    pending: 'orange',
    completed: 'green',
    failed: 'red',
  }

  return (
    <Box flexDirection="row" gap="sm" alignItems="center">
      <Tag color={colors[status]}>{status}</Tag>
      <Quantity quantity={count} />
    </Box>
  )
}
```

### Priority Counts with Colors

```typescript
function PriorityQueue({ items }) {
  const priorityConfig = {
    urgent: { label: 'Urgent', color: 'red' },
    high: { label: 'High Priority', color: 'purple' },
    normal: { label: 'Normal', color: 'blue' },
    low: { label: 'Low Priority', color: 'grey' },
  }

  return (
    <Box flexDirection="column" gap="sm">
      {Object.entries(priorityConfig).map(([priority, config]) => {
        const count = items.filter((item) => item.priority === priority).length
        if (count === 0) return null

        return (
          <Box
            key={priority}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text>{config.label}</Text>
            <Quantity quantity={count} color={config.color} />
          </Box>
        )
      })}
    </Box>
  )
}
```

### Multiple Quantities

```typescript
function MessageStats({ unread, flagged, archived }) {
  return (
    <Box flexDirection="row" gap="md" alignItems="center">
      <Box flexDirection="row" gap="xs" alignItems="center">
        <Text size="sm">Unread:</Text>
        <Quantity quantity={unread} />
      </Box>
      <Box flexDirection="row" gap="xs" alignItems="center">
        <Text size="sm">Flagged:</Text>
        <Quantity quantity={flagged} />
      </Box>
      <Box flexDirection="row" gap="xs" alignItems="center">
        <Text size="sm">Archived:</Text>
        <Quantity quantity={archived} />
      </Box>
    </Box>
  )
}
```

### Conditional Display

```typescript
function ConditionalQuantity({ count, threshold = 0 }) {
  // Only show if count exceeds threshold
  if (count <= threshold) return null

  return <Quantity quantity={count} />
}

// Usage
<ConditionalQuantity count={5} threshold={0} />  // Shows "5"
<ConditionalQuantity count={0} threshold={0} />  // Hides
<ConditionalQuantity count={15} threshold={10} /> // Shows "15"
```

### With Max Display

```typescript
function LimitedQuantity({ count, max = 99 }) {
  return <Quantity quantity={count} maxQuantity={max} />
}

// Usage
<LimitedQuantity count={42} />    // Shows "42"
<LimitedQuantity count={150} />   // Shows "99+"

// Or use directly without wrapper
<Quantity quantity={42} maxQuantity={99} />   // Shows "42"
<Quantity quantity={150} maxQuantity={99} />  // Shows "99+"
```

### View/Folder Count with Compact Notation

For counts that can reach into the thousands, use `compact` with `maxQuantity` to cap the display:

```typescript
function ViewCount({ count, max = 5000 }) {
  if (count === undefined) return null
  return <Quantity quantity={count} maxQuantity={max} compact />
}

// Usage
<ViewCount count={42} />     // Shows "42"
<ViewCount count={1500} />   // Shows "1.5k"  (title="1500")
<ViewCount count={9999} />   // Shows "5k+"   (title="9999")
```

## Visual Design

Quantity has:

- Small, compact badge appearance
- Bold, extra-small text for readability
- Default appearance with grey border (when no color is specified)
- Color variants: grey, blue, red, purple for semantic meaning
- Size variants: small (sm) and medium (md, default)
- Minimal padding for compact display
- Inline display (span element)

## Color Behavior

- **Default** (no color specified): Subtle appearance with grey border and no background
- **Color variants**: Apply semantic colors for different contexts:
    - `grey`: Neutral information with subtle background
    - `blue`: Informational counts
    - `red`: Errors, urgent items, or critical notifications
    - `purple`: Special or highlighted information

## Related Components

- **Badge**: Alternative badge component (if available)
- **Tag**: For labeled badges with more context
- **Text**: Base text component used internally
- **Icon**: Often paired with Quantity for visual context

## Testing Queries

```typescript
// Query by text content
screen.getByText('5')
screen.getByText('12')
screen.getByText('999')

// Query by data attribute
const quantity = container.querySelector('[data-name="quantity"]')
expect(quantity).toBeInTheDocument()

// Check color variant
const redQuantity = container.querySelector('[data-color="red"]')
expect(redQuantity).toBeInTheDocument()

const blueQuantity = container.querySelector('[data-color="blue"]')
expect(blueQuantity).toHaveTextContent('12')

// Check size variant
const smallQuantity = container.querySelector('[data-size="sm"]')
expect(smallQuantity).toBeInTheDocument()

const mediumQuantity = container.querySelector('[data-size="md"]')
expect(mediumQuantity).toBeInTheDocument()

// Check it's rendered as span
expect(quantity.tagName).toBe('SPAN')
```
