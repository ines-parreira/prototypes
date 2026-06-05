# AvatarGroup

Multiple avatars displayed with visual overlap and automatic overflow handling.

## Import

```typescript
import { AvatarGroup } from '@gorgias/axiom'
```

## Props

### AvatarGroupProps

```typescript
type AvatarGroupProps = {
    // Required
    children: ReactNode // Avatar components to display

    // Overflow
    max?: number // Maximum avatars before showing overflow indicator (default: 5)

    // Layout
    direction?: 'left' | 'right' // Controls overflow indicator position (default: 'right')
    // 'right': overflow on left  → [+3] [Avatar] [Avatar]
    // 'left':  overflow on right → [Avatar] [Avatar] [+3]

    // Standard div props
    className?: string
    style?: CSSProperties
    // ... other div props
}
```

## Usage

### Basic

```typescript
<AvatarGroup>
    <Avatar name="Alice Johnson" color="blue" />
    <Avatar name="Bob Smith" color="green" />
    <Avatar name="Charlie Brown" color="purple" />
    <Avatar name="Diana Prince" color="teal" />
    <Avatar name="Ethan Hunt" color="orange" />
</AvatarGroup>
```

### With Overflow

When children exceed `max`, the extra avatars are hidden and a grey overflow indicator shows the count.

```typescript
<AvatarGroup max={5}>
    <Avatar name="Alice Johnson" color="blue" />
    <Avatar name="Bob Smith" color="green" />
    <Avatar name="Charlie Brown" color="purple" />
    <Avatar name="Diana Prince" color="teal" />
    <Avatar name="Ethan Hunt" color="orange" />
    <Avatar name="Fiona Apple" color="red" />
    <Avatar name="George Martin" color="coral" />
    <Avatar name="Henry Davis" color="fuchsia" />
    <Avatar name="Isla Fisher" color="yellow" />
    <Avatar name="Jack Ryan" color="grey" />
</AvatarGroup>
```

### With Images

```typescript
<AvatarGroup max={5}>
    <Avatar name="Alice Johnson" color="blue" url="https://example.com/alice.jpg" />
    <Avatar name="Bob Smith" color="green" url="https://example.com/bob.jpg" />
    <Avatar name="Charlie Brown" color="purple" url="https://example.com/charlie.jpg" />
    <Avatar name="Diana Prince" color="teal" url="https://example.com/diana.jpg" />
    <Avatar name="Ethan Hunt" color="orange" url="https://example.com/ethan.jpg" />
</AvatarGroup>
```

### Direction

```typescript
// Overflow on left (default)
<AvatarGroup direction="right" max={3}>
    <Avatar name="Alice Johnson" color="blue" />
    <Avatar name="Bob Smith" color="green" />
    <Avatar name="Charlie Brown" color="purple" />
    <Avatar name="Diana Prince" color="teal" />
    <Avatar name="Ethan Hunt" color="orange" />
</AvatarGroup>

// Overflow on right
<AvatarGroup direction="left" max={3}>
    <Avatar name="Alice Johnson" color="blue" />
    <Avatar name="Bob Smith" color="green" />
    <Avatar name="Charlie Brown" color="purple" />
    <Avatar name="Diana Prince" color="teal" />
    <Avatar name="Ethan Hunt" color="orange" />
</AvatarGroup>
```

## CSS Customisation

### Ring Color

Each avatar has a ring rendered via `box-shadow` to separate it from adjacent avatars. By default this matches the page background. When `AvatarGroup` is placed on a coloured surface, override `--avatar-group-ring-color` to match:

```css
.myContainer {
    background: #f472b6;
    --avatar-group-ring-color: #f472b6;
}
```

This also works with pseudo-states, which is the recommended approach when the colour changes on interaction:

```css
.myContainer {
    --avatar-group-ring-color: var(--white);
}
.myContainer:hover {
    --avatar-group-ring-color: var(--blue-100);
}
.myContainer:active {
    --avatar-group-ring-color: var(--blue-200);
}
```

The variable can be set on any ancestor element — it cascades down to the avatars automatically.

## Testing Queries

```typescript
// Query the group container
const group = container.querySelector('[data-name="avatar-group"]')

// Query all rendered avatars (includes overflow indicator if present)
const avatars = container.querySelectorAll('[data-name="avatar"]')
expect(avatars).toHaveLength(5)

// Check overflow indicator text
expect(screen.getByText('+4')).toBeInTheDocument()

// Check overflow position (direction="right" → overflow is first child)
const parent = container.firstChild as HTMLElement
const avatars = parent.querySelectorAll('[data-name="avatar"]')
expect(avatars[0].textContent).toBe('+2')
```

## Related Components

- **Avatar**: Individual avatar used as children
