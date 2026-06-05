# Tag

Compact label component for displaying categories, statuses, or removable items.

## Import

```typescript
import { Tag } from '@gorgias/axiom'
```

## Props

### TagProps

Can be used in two modes: static label or closable tag with dismiss functionality.

```typescript
// Common props for all Tag variants
type CommonTagProps = {
    color?: TagColor // Background color (default: grey)
    size?: TagSize // Size of tag (default: 'md')
    leadingSlot?: IconName | ReactNode // Icon/content before text
    children: ReactNode // Tag content (text or icon)
}

// Static tag (no close button)
type DefaultTagProps = CommonTagProps & {
    onClose?: undefined // Omit to render as static label
    // ... standard div props
    className?: string
    style?: CSSProperties
}

// Closable tag (with close button)
type CloseTagProps = CommonTagProps & {
    onClose: () => void // Callback when close button clicked
    // ... React Aria Button props
    isDisabled?: boolean
    onPress?: () => void
}

type TagProps = DefaultTagProps | CloseTagProps

// Available colors
type TagColor =
    | 'blue'
    | 'green'
    | 'grey'
    | 'red'
    | 'orange'
    | 'purple'
    | 'teal'
    | 'fuchsia'

// Available sizes
type TagSize = 'sm' | 'md'
```

## Usage

### Basic Tag

```typescript
// Static tag (no close button)
<Tag>Default</Tag>
<Tag color="blue">Information</Tag>
<Tag color="green">Success</Tag>
```

### With Colors

```typescript
<Tag color="blue">Blue Tag</Tag>
<Tag color="green">Green Tag</Tag>
<Tag color="grey">Grey Tag</Tag>
<Tag color="red">Red Tag</Tag>
<Tag color="orange">Orange Tag</Tag>
<Tag color="purple">Purple Tag</Tag>
<Tag color="teal">Teal Tag</Tag>
<Tag color="fuchsia">Fuchsia Tag</Tag>
```

### Sizes

```typescript
<Tag size="sm">Small Tag</Tag>
<Tag size="md">Medium Tag</Tag>
```

### With Leading Slot

```typescript
// Icon name (string)
<Tag leadingSlot="user">User Profile</Tag>

// Icon component
<Tag leadingSlot={<Icon name="star" />}>Featured</Tag>

// Dot indicator
<Tag leadingSlot={<Dot color="green" />}>Online</Tag>

// Avatar
<Tag leadingSlot={<Avatar name="Alex Bones" size="xs" />}>
  Alex Bones
</Tag>
```

### Icon-Only Tag

```typescript
// Pass Icon as children (no text)
<Tag>
  <Icon name="cloud" />
</Tag>

<Tag color="blue">
  <Icon name="star" />
</Tag>
```

### Closable Tag

```typescript
// With close button
<Tag onClose={() => removeTag()}>
  Removable
</Tag>

<Tag color="blue" onClose={() => removeTag()}>
  Close Me
</Tag>

// With leading slot and close
<Tag
  color="green"
  leadingSlot={<Dot color="green" />}
  onClose={() => removeTag()}
>
  Active Filter
</Tag>
```

## Common Patterns

### Status Tags

```typescript
function StatusTag({ status }: { status: string }) {
  const statusConfig = {
    active: { color: 'green', label: 'Active' },
    pending: { color: 'orange', label: 'Pending' },
    inactive: { color: 'grey', label: 'Inactive' },
    error: { color: 'red', label: 'Error' },
  }

  const config = statusConfig[status]

  return (
    <Tag color={config.color}>
      {config.label}
    </Tag>
  )
}
```

### Category Tags

```typescript
function CategoryTag({ category, onRemove }) {
  return (
    <Tag
      color="blue"
      leadingSlot="tag"
      onClose={onRemove}
    >
      {category.name}
    </Tag>
  )
}
```

### Filter Tags

```typescript
function FilterTags({ filters, onRemoveFilter }) {
  return (
    <Box flexDirection="row" gap="sm" flexWrap="wrap">
      {filters.map((filter) => (
        <Tag
          key={filter.id}
          color="purple"
          onClose={() => onRemoveFilter(filter.id)}
        >
          {filter.label}
        </Tag>
      ))}
    </Box>
  )
}
```

### User Tags

```typescript
function UserTag({ user, isRemovable, onRemove }) {
  return (
    <Tag
      color="blue"
      leadingSlot={<Avatar name={user.name} size="xs" />}
      onClose={isRemovable ? onRemove : undefined}
    >
      {user.name}
    </Tag>
  )
}
```

### Tag List

```typescript
function TagList({ tags }) {
  return (
    <Box flexDirection="row" gap="xs" flexWrap="wrap">
      {tags.map((tag) => (
        <Tag key={tag.id} color={tag.color} size="sm">
          {tag.label}
        </Tag>
      ))}
    </Box>
  )
}
```

### Feature Tags

```typescript
function FeatureTags() {
  return (
    <Box flexDirection="row" gap="sm">
      <Tag color="purple" leadingSlot="star">New</Tag>
      <Tag color="orange" leadingSlot="zap">Beta</Tag>
      <Tag color="green" leadingSlot="check">Verified</Tag>
    </Box>
  )
}
```

## Visual Design

Tag has a compact, pill-shaped design with:

- Colored background based on `color` prop
- Text automatically styled with small size and no wrap
- Optional leading slot for icons, dots, or avatars
- Optional close button for dismissible tags
- Automatic padding and spacing

## Related Components

- **StatusButton**: For interactive status indicators with button behavior
- **Badge**: For count indicators
- **Dot**: For simple status indicators
- **Avatar**: Can be used in leadingSlot for user tags

## Testing Queries

```typescript
// Query text content
screen.getByText('Tag Label')
screen.getByText('User Profile')

// Query close button (for closable tags)
const closeButton = screen.getByRole('button')
expect(closeButton).toBeInTheDocument()

// Query icons
screen.getByRole('img', { name: 'star' })
screen.getByRole('img', { name: 'close' })
screen.getByRole('img', { name: 'user' })

// Check color attribute
const tag = screen.getByText('Tag Label').parentElement
expect(tag).toHaveAttribute('data-color', 'blue')
expect(tag).toHaveAttribute('data-color', 'default')

// Interact with close button
const closeButton = screen.getByRole('button')
await user.click(closeButton)
expect(onClose).toHaveBeenCalledTimes(1)

// Query by data attribute
const tag = container.querySelector('[data-name="tag"]')
expect(tag).toBeInTheDocument()
```
