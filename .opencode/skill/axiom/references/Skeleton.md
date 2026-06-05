# Skeleton

Loading placeholder component that mimics the shape of content being loaded.

## Import

```typescript
import { Skeleton } from '@gorgias/axiom'
```

## Props

### SkeletonProps

Extends all props from `react-loading-skeleton`.

```typescript
type SkeletonProps = {
    // Dimensions
    width?: string | number // Width of skeleton (default: 100%)
    height?: string | number // Height of skeleton (default: 20)

    // Repetition
    count?: number // Number of skeleton lines to render (default: 1)

    // Appearance
    borderRadius?: string | number // Border radius (default: 4)
    circle?: boolean // Render as circle (ignores width/height ratio)

    // Styling
    className?: string // Custom CSS class
    style?: CSSProperties // Inline styles

    // Animation
    duration?: number // Animation duration in seconds (default: 1.5)
    enableAnimation?: boolean // Enable/disable animation (default: true)

    // Container
    containerClassName?: string // Class for wrapper container
    containerTestId?: string // Test ID for wrapper container

    // Inline display
    inline?: boolean // Render inline instead of block
}
```

## Usage

### Basic Skeleton

```typescript
// Single line with default dimensions
<Skeleton />

// Custom width
<Skeleton width={200} />

// Custom height
<Skeleton height={40} />

// Custom dimensions
<Skeleton width={300} height={60} />
```

### Multiple Lines

```typescript
// Render multiple skeleton lines
<Skeleton count={3} />

// Multiple lines with custom dimensions
<Skeleton count={5} width={500} height={20} />

// Simulate paragraph loading
<Box flexDirection="column" gap="sm">
  <Skeleton width="80%" />
  <Skeleton width="90%" />
  <Skeleton width="75%" />
</Box>
```

### Circle Skeleton

```typescript
// Avatar placeholder
<Skeleton circle width={40} height={40} />

// Large circle
<Skeleton circle width={100} height={100} />
```

### Custom Border Radius

```typescript
// Rounded corners
<Skeleton borderRadius={8} width={200} height={40} />

// Pill shape
<Skeleton borderRadius={20} width={120} height={40} />
```

### With Inline Display

```typescript
// Inline skeletons
<Text>
  Loading <Skeleton inline width={50} /> items...
</Text>
```

## Common Patterns

### Loading Card

```typescript
function CardSkeleton() {
  return (
    <Box
      p="md"
      borderRadius="md"
      style={{ border: '1px solid var(--color-border-primary)' }}
    >
      <Box flexDirection="row" gap="md" mb="md">
        <Skeleton circle width={40} height={40} />
        <Box flexDirection="column" gap="xs" flex={1}>
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </Box>
      </Box>
      <Skeleton count={3} />
    </Box>
  )
}
```

### Loading List

```typescript
function ListSkeleton({ itemCount = 5 }) {
  return (
    <Box flexDirection="column" gap="sm">
      {Array.from({ length: itemCount }).map((_, index) => (
        <Box key={index} flexDirection="row" gap="md" alignItems="center">
          <Skeleton circle width={32} height={32} />
          <Box flex={1}>
            <Skeleton width="70%" />
          </Box>
        </Box>
      ))}
    </Box>
  )
}
```

### Loading Table

```typescript
function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <Box flexDirection="column" gap="sm">
      {/* Header */}
      <Box flexDirection="row" gap="md">
        {Array.from({ length: columns }).map((_, i) => (
          <Box key={i} flex={1}>
            <Skeleton height={30} />
          </Box>
        ))}
      </Box>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} flexDirection="row" gap="md">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Box key={colIndex} flex={1}>
              <Skeleton height={20} />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}
```

### Loading Form

```typescript
function FormSkeleton() {
  return (
    <Box flexDirection="column" gap="lg">
      {/* Text input */}
      <Box flexDirection="column" gap="xs">
        <Skeleton width={100} height={16} />
        <Skeleton height={40} />
      </Box>

      {/* Text input */}
      <Box flexDirection="column" gap="xs">
        <Skeleton width={120} height={16} />
        <Skeleton height={40} />
      </Box>

      {/* Button */}
      <Skeleton width={120} height={40} borderRadius={8} />
    </Box>
  )
}
```

### Loading Profile

```typescript
function ProfileSkeleton() {
  return (
    <Box flexDirection="column" alignItems="center" gap="md">
      <Skeleton circle width={80} height={80} />
      <Skeleton width={150} height={24} />
      <Skeleton width={200} height={16} />
      <Box flexDirection="row" gap="sm" mt="md">
        <Skeleton width={100} height={36} borderRadius={8} />
        <Skeleton width={100} height={36} borderRadius={8} />
      </Box>
    </Box>
  )
}
```

### Conditional Loading

```typescript
function DataDisplay({ data, isLoading }) {
  if (isLoading) {
    return <Skeleton count={3} width={400} />
  }

  return (
    <Box flexDirection="column" gap="sm">
      {data.map((item) => (
        <Text key={item.id}>{item.name}</Text>
      ))}
    </Box>
  )
}
```

### Loading with Consistent Layout

```typescript
function UserCard({ user, isLoading }) {
  return (
    <Box flexDirection="row" gap="md" p="md">
      {isLoading ? (
        <>
          <Skeleton circle width={48} height={48} />
          <Box flexDirection="column" gap="xs" flex={1}>
            <Skeleton width="60%" />
            <Skeleton width="40%" />
          </Box>
        </>
      ) : (
        <>
          <Avatar name={user.name} size="lg" />
          <Box flexDirection="column">
            <Text weight="bold">{user.name}</Text>
            <Text size="sm" color="text-secondary">{user.email}</Text>
          </Box>
        </>
      )}
    </Box>
  )
}
```

## Visual Design

Skeleton has:

- Animated shimmer effect indicating loading state
- Default grey color matching design system
- Smooth animation that loops continuously
- Customizable dimensions and border radius
- Default 20px height and 4px border radius

## Performance Notes

- Skeleton is optimized for performance with CSS animations
- Multiple skeletons can be rendered without performance impact
- Uses native CSS animations (no JavaScript animation loops)
- Minimal re-renders during loading states

## Related Components

- **Spinner**: For small loading indicators
- **Box**: For layout and spacing around skeletons

## Testing Queries

```typescript
// Query skeleton by aria-label
const skeleton = screen.getByLabelText('Loading')
expect(skeleton).toBeInTheDocument()

// Query by data attribute
const skeleton = container.querySelector('[data-name="skeleton"]')
expect(skeleton).toBeInTheDocument()
```
