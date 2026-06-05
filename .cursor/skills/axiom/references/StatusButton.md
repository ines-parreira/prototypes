# StatusButton

Compact button styled with status colors, typically used for displaying and interacting with status information.

## Import

```typescript
import { StatusButton } from '@gorgias/axiom'
```

## Props

### StatusButtonProps

```typescript
type StatusButtonProps = {
    // Color
    color?: StatusButtonColor // Color variant (default: 'grey')

    // State
    isDisabled?: boolean // Whether button is disabled

    // Slots
    leadingSlot?: IconName | ReactNode // Icon/content before text
    trailingSlot?: IconName | ReactNode // Icon/content after text

    // Content
    children: ReactNode // Button text content (required)

    // Event handlers
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void

    // Other
    id?: string
    className?: string
    style?: CSSProperties
    'aria-label'?: string
    type?: 'button' | 'submit' | 'reset'
}

// Available colors
type StatusButtonColor =
    | 'blue'
    | 'green'
    | 'grey'
    | 'red'
    | 'orange'
    | 'purple'
    | 'teal'
    | 'fuchsia'
```

## Usage

### Basic StatusButton

```typescript
<StatusButton>Active</StatusButton>
<StatusButton color="green">Online</StatusButton>
<StatusButton color="red">Offline</StatusButton>
```

### With Colors

```typescript
<StatusButton color="blue">In Progress</StatusButton>
<StatusButton color="green">Completed</StatusButton>
<StatusButton color="grey">Pending</StatusButton>
<StatusButton color="red">Failed</StatusButton>
<StatusButton color="orange">Warning</StatusButton>
<StatusButton color="purple">Draft</StatusButton>
<StatusButton color="teal">Active</StatusButton>
<StatusButton color="fuchsia">Featured</StatusButton>
```

### With Leading Slot

```typescript
<StatusButton leadingSlot="check" color="green">
  Verified
</StatusButton>

<StatusButton leadingSlot="warning-triangle" color="orange">
  Pending
</StatusButton>

<StatusButton leadingSlot={<Icon name="star" />} color="purple">
  Featured
</StatusButton>
```

### With Trailing Slot

```typescript
<StatusButton trailingSlot="arrow-chevron-down" color="blue">
  More Options
</StatusButton>

<StatusButton trailingSlot="external-link">
  View Details
</StatusButton>
```

### With Both Slots

```typescript
<StatusButton
  leadingSlot="check"
  trailingSlot="arrow-chevron-down"
  color="green"
>
  Completed Tasks
</StatusButton>
```

### With Click Handler

```typescript
<StatusButton
  color="blue"
  onClick={() => console.log('Status clicked')}
>
  View Status
</StatusButton>
```

### Disabled State

```typescript
<StatusButton isDisabled>
  Disabled
</StatusButton>

<StatusButton color="green" isDisabled>
  Not Available
</StatusButton>
```

## Common Patterns

### Status Indicators

```typescript
function OrderStatus({ status }: { status: string }) {
  const statusConfig = {
    pending: { color: 'orange', icon: 'clock', label: 'Pending' },
    processing: { color: 'blue', icon: 'loader', label: 'Processing' },
    completed: { color: 'green', icon: 'check', label: 'Completed' },
    failed: { color: 'red', icon: 'x', label: 'Failed' },
  }

  const config = statusConfig[status]

  return (
    <StatusButton
      color={config.color}
      leadingSlot={config.icon}
    >
      {config.label}
    </StatusButton>
  )
}
```

### With Dropdown

```typescript
<Box flexDirection="row" gap="sm">
  <StatusButton
    color="green"
    leadingSlot="check"
    trailingSlot="arrow-chevron-down"
    onClick={handleOpenMenu}
  >
    Active
  </StatusButton>
  {isMenuOpen && (
    <Menu>
      <MenuItem>Change to Pending</MenuItem>
      <MenuItem>Change to Inactive</MenuItem>
    </Menu>
  )}
</Box>
```

### In Lists

```typescript
<List items={items}>
  {(item) => (
    <ListItem
      label={item.name}
      trailingSlot={
        <StatusButton color={item.statusColor}>
          {item.status}
        </StatusButton>
      }
    />
  )}
</List>
```

### As Filter Button

```typescript
function StatusFilter() {
  const [filter, setFilter] = useState('all')

  return (
    <Box flexDirection="row" gap="sm">
      <StatusButton
        color={filter === 'all' ? 'blue' : 'grey'}
        onClick={() => setFilter('all')}
      >
        All
      </StatusButton>
      <StatusButton
        color={filter === 'active' ? 'green' : 'grey'}
        onClick={() => setFilter('active')}
      >
        Active
      </StatusButton>
      <StatusButton
        color={filter === 'inactive' ? 'red' : 'grey'}
        onClick={() => setFilter('inactive')}
      >
        Inactive
      </StatusButton>
    </Box>
  )
}
```

## Visual Design

StatusButton has a compact, pill-shaped design with:

- Colored background based on `color` prop
- Icon slots for visual context
- Hover and active states
- Disabled state with reduced opacity

## Related Components

- **Button**: For primary actions with more emphasis
- **Tag**: For non-interactive status labels
- **Badge**: For count indicators
- **FilterButton**: For filter toggles

## Testing Queries

```typescript
// By role
screen.getByRole('button')
screen.getByRole('button', { name: 'Active' })
screen.getByRole('button', { name: /completed/i })

// Check attributes
const button = screen.getByRole('button')
expect(button).toHaveAttribute('data-color', 'green')
expect(button).toHaveAttribute('type', 'button')

// Icons in slots
expect(screen.getByRole('img', { name: 'check' })).toBeInTheDocument()

// Interact
const button = screen.getByRole('button', { name: 'Active' })
await user.click(button)
expect(onClick).toHaveBeenCalled()

// Disabled state
expect(screen.getByRole('button')).toBeDisabled()
```
