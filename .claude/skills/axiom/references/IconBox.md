# IconBox

Small square container with rounded corners that wraps an icon. Used to visually represent features, products, or categories with a styled background.

## Import

```typescript
import { IconBox } from '@gorgias/axiom'
```

## Props

```typescript
type IconBoxProps = {
    /** Icon name to render inside the box */
    icon: IconName
    /** Accessibility alt text for the icon (default: '') */
    alt?: string
    /** Visual style of the container (default: 'primary') */
    variant?: IconBoxVariant
    /** Color scheme (default: 'grey') */
    color?: IconBoxColor
    /** Size of the box and its icon (default: 'md') */
    size?: IconBoxSize
}

// 'primary' — filled background
// 'secondary' — outlined with border, no background fill
type IconBoxVariant = 'primary' | 'secondary'

// Available color schemes (each maps to a surface + border + icon color pair)
type IconBoxColor = 'grey' | 'accent' | 'blue' | 'coral' | 'purple' | 'teal' | 'yellow'

// 'xs' | 'sm' | 'md'
type IconBoxSize = 'xs' | 'sm' | 'md'
```

## Usage

### Basic

```typescript
<IconBox icon="inbox" />
<IconBox icon="inbox" color="accent" />
```

### Primary variant (filled background)

```typescript
// Neutral fill
<IconBox icon="inbox" variant="primary" color="grey" />

// Accent fill — white icon on purple background
<IconBox icon="inbox" variant="primary" color="accent" />
```

### Secondary variant (outlined)

```typescript
// Neutral border
<IconBox icon="inbox" variant="secondary" color="grey" />

// Accent border — accent-colored icon
<IconBox icon="inbox" variant="secondary" color="accent" />
```

### With accessible alt text

```typescript
// Decorative (default — hidden from screen readers)
<IconBox icon="inbox" />

// Meaningful label
<IconBox icon="inbox" alt="Inbox feature" />
```

## Common Patterns

### Feature list

```typescript
const features = [
    { icon: 'inbox', label: 'Inbox', color: 'accent' },
    { icon: 'analytics', label: 'Analytics', color: 'grey' },
]

{features.map((f) => (
    <Box key={f.label} flexDirection="row" alignItems="center" gap="sm">
        <IconBox icon={f.icon} color={f.color} />
        <Text>{f.label}</Text>
    </Box>
))}
```

### Navigation item

```typescript
<Box flexDirection="row" alignItems="center" gap="sm">
    <IconBox icon="settings" variant="secondary" color="grey" />
    <Text>Settings</Text>
</Box>
```

### Highlighted feature

```typescript
<Box flexDirection="row" alignItems="center" gap="sm">
    <IconBox icon="star" variant="primary" color="accent" />
    <Box>
        <Text weight="semibold">Premium feature</Text>
        <Text color="grey" size="sm">Available on Pro plan</Text>
    </Box>
</Box>
```

## Related Components

- **Icon**: The bare icon without a container
- **Avatar**: Circular container for user/entity representations
- **Tag**: Compact label with optional color and icon slot

## Testing Queries

```typescript
// Query by data attribute
const box = container.querySelector('[data-name="icon-box"]')

// Check variant and color
expect(box).toHaveAttribute('data-variant', 'primary')
expect(box).toHaveAttribute('data-color', 'accent')

// Check icon is rendered
screen.getByRole('img', { name: 'inbox' })
```
