# Avatar

User profile image or initials with optional status indicator.

## Import

```typescript
import { Avatar } from '@gorgias/axiom'
```

## Props

### AvatarProps

```typescript
type AvatarProps = {
    // Required
    name: string // User's name for generating initials and alt text

    // Size
    size?: AvatarSize // Size of avatar (default: 'md')

    // Color
    color?: AvatarColor // Background gradient color for initials (default: 'grey')

    // Image
    url?: string // Optional URL for avatar image

    // Status
    status?: AvatarStatus // Deprecated: Use statusSlot instead
    statusSlot?: ReactNode // Custom status indicator (recommended)

    // Standard div props
    className?: string
    style?: CSSProperties
    // ... other div props
}

// Available sizes
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

// Available colors
type AvatarColor =
    | 'blue'
    | 'coral'
    | 'fuchsia'
    | 'green'
    | 'grey'
    | 'red'
    | 'orange'
    | 'purple'
    | 'teal'
    | 'yellow'

// Deprecated status (use statusSlot instead)
type AvatarStatus = 'away' | 'offline' | 'online'
```

## Usage

### Basic Avatar

```typescript
// With image URL
<Avatar name="John Doe" url="https://example.com/avatar.jpg" />

// Without image (shows initials)
<Avatar name="John Doe" />
```

### Sizes

```typescript
<Avatar name="John Doe" size="sm" />
<Avatar name="John Doe" size="md" />
<Avatar name="John Doe" size="lg" />
<Avatar name="John Doe" size="xl" />
<Avatar name="John Doe" size="xxl" />
```

### Colors

The `color` prop sets the gradient background when displaying initials:

```typescript
<Avatar name="John Doe" color="blue" />
<Avatar name="Jane Smith" color="green" />
<Avatar name="Bob Wilson" color="purple" />
<Avatar name="Alice Brown" color="coral" />
<Avatar name="Charlie Davis" color="fuchsia" />
<Avatar name="Eve Martinez" color="grey" />
<Avatar name="Frank Johnson" color="orange" />
<Avatar name="Grace Lee" color="red" />
<Avatar name="Henry Chen" color="teal" />
<Avatar name="Ivy Taylor" color="yellow" />
```

### With Status Indicator (New API)

```typescript
import { Avatar, AvatarStatusIndicator, Dot } from '@gorgias/axiom'

// Using AvatarStatusIndicator
<Avatar
  name="John Doe"
  statusSlot={<AvatarStatusIndicator color="green" />}
/>

// Using custom Dot
<Avatar
  name="Jane Smith"
  statusSlot={<Dot color="orange" size="sm" />}
/>

// Using any custom element
<Avatar
  name="Bob Wilson"
  statusSlot={<Icon name="check" size="xs" />}
/>
```

### With Status (Deprecated API)

```typescript
// Deprecated - use statusSlot instead
<Avatar name="John Doe" status="online" />
<Avatar name="Jane Smith" status="away" />
<Avatar name="Bob Wilson" status="offline" />
```

## Initials Generation

Avatar automatically generates initials from the `name` prop:

- Single name: First letter (e.g., "John" → "J")
- Multiple names: First letter of first and last name (e.g., "John Doe" → "JD")
- More than two names: First letter of first two names (e.g., "John Michael Doe" → "JM")

## Image Fallback

Avatar displays the image when a `url` is provided. If the image:

- Fails to load → Falls back to initials
- Is not provided → Shows initials immediately

## Common Patterns

### User Profile

```typescript
<Box flexDirection="row" alignItems="center" gap="sm">
  <Avatar
    name="John Doe"
    url="/avatars/john-doe.jpg"
    statusSlot={<AvatarStatusIndicator color="green" />}
  />
  <Box flexDirection="column">
    <Text weight="bold">John Doe</Text>
    <Text size="sm" color="var(--grey-600)">Online</Text>
  </Box>
</Box>
```

### User List

```typescript
<List items={users}>
  {(user) => (
    <ListItem
      leadingSlot={
        <Avatar
          name={user.name}
          url={user.avatarUrl}
          size="sm"
        />
      }
      label={user.name}
      description={user.email}
    />
  )}
</List>
```

### Avatar Group (Stacked)

Use the `AvatarGroup` component for stacking avatars with overlap and overflow handling:

```typescript
import { AvatarGroup } from '@gorgias/axiom'

<AvatarGroup max={5}>
  {users.map((user) => (
    <Avatar key={user.id} name={user.name} url={user.avatarUrl} />
  ))}
</AvatarGroup>
```

### With Different Status Colors

```typescript
function UserAvatar({ user }) {
  const statusColor = {
    online: 'green',
    away: 'orange',
    offline: 'grey',
    busy: 'red',
  }[user.status]

  return (
    <Avatar
      name={user.name}
      url={user.avatarUrl}
      statusSlot={<AvatarStatusIndicator color={statusColor} />}
    />
  )
}
```

## Related Components

- **Dot**: Simple status indicator
- **Image**: For larger profile images
- **Icon**: For icon-based avatars

## Testing Queries

```typescript
// Query by container
const avatar = container.querySelector('[data-name="avatar"]')

// Check class for size
expect(avatar).toHaveClass('md')

// Check background gradient
expect(avatar).toHaveStyle({ background: 'var(--gradient-blue)' })

// Check for image
const img = container.querySelector('img')
expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
expect(img).toHaveAttribute('alt', 'John Doe')

// Check for initials
expect(avatar).toHaveTextContent('JD')

// Check for status indicator
const statusDot = container.querySelector('[data-name="dot"]')
expect(statusDot).toBeInTheDocument()
```
