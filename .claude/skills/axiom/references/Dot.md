# Dot

Small colored indicator commonly used for status badges or visual accents.

## Import

```typescript
import { Dot } from '@gorgias/axiom'
```

## Props

```typescript
type DotProps = {
    color?: ColorValue // Color of the dot (default: 'grey')
    size?: DotSize // Size of the dot (default: 'md')
}

// DotSize excludes smallest/largest: 'xxxxs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
type DotSize = Exclude<Size, 'xxxs' | 'xxs' | 'xs' | 'xxxl'>

// ColorValue accepts: Color enum, CSS variables, or hex codes
type ColorValue = Color | `var(--${string})` | `#${string}`
```

## Usage

### Basic Dot

```typescript
<Dot />
<Dot color="green" />
<Dot color="red" />
```

### With Color Values

```typescript
// Color enum
<Dot color="blue" />
<Dot color="green" />
<Dot color="red" />
<Dot color="orange" />

// CSS variable
<Dot color="var(--color-success)" />

// Hex code
<Dot color="#ff0000" />
```

### Sizes

```typescript
<Dot size="xxxxs" />
<Dot size="sm" />
<Dot size="md" />
<Dot size="lg" />
<Dot size="xl" />
<Dot size="xxl" />
```

### Status Indicators

```typescript
<Box flexDirection="row" alignItems="center" gap="sm">
  <Dot color="green" />
  <Text>Online</Text>
</Box>

<Box flexDirection="row" alignItems="center" gap="sm">
  <Dot color="orange" />
  <Text>Away</Text>
</Box>

<Box flexDirection="row" alignItems="center" gap="sm">
  <Dot color="red" />
  <Text>Offline</Text>
</Box>
```

## Common Patterns

### With Avatar Status

```typescript
<Avatar name="John Doe" statusSlot={<Dot color="green" size="sm" />} />
```

### In List Items

```typescript
<List items={items}>
  {(item) => (
    <ListItem
      leadingSlot={<Dot color={item.statusColor} />}
      label={item.name}
    />
  )}
</List>
```

### Notification Badge

```typescript
<Box position="relative">
  <Icon name="bell" />
  <Dot color="red" size="sm" style={{ position: 'absolute', top: 0, right: 0 }} />
</Box>
```

## Related Components

- **Avatar**: Often uses Dot for status indicators
- **Badge**: For more complex status displays
- **Tag**: For labeled status indicators

## Testing Queries

```typescript
// Query by data attribute
const dot = container.querySelector('[data-name="dot"]')

// Check styles
expect(dot).toHaveStyle('background: rgb(0, 255, 0)')
```
