# Separator

Visual divider component for separating content sections.

## Import

```typescript
import { Separator } from '@gorgias/axiom'
```

## Props

### SeparatorProps

```typescript
type SeparatorProps = {
    direction?: SeparatorDirection // Orientation (default: 'horizontal')
    variant?: SeparatorVariant // Line style (default: 'solid')
    className?: string // Custom CSS class
}

// Direction options
type SeparatorDirection = 'horizontal' | 'vertical'

// Variant options
type SeparatorVariant = 'solid' | 'dashed'
```

## Usage

### Basic Separator

```typescript
// Default horizontal separator
<Separator />
```

### Horizontal Separators

```typescript
// Solid line (default)
<Separator direction="horizontal" variant="solid" />

// Dashed line
<Separator direction="horizontal" variant="dashed" />
```

### Vertical Separators

```typescript
// Solid line
<Separator direction="vertical" variant="solid" />

// Dashed line
<Separator direction="vertical" variant="dashed" />
```

## Common Patterns

### Dividing Sections

```typescript
function ContentSections() {
  return (
    <Box flexDirection="column">
      <Box p="md">
        <Heading size="sm">Section 1</Heading>
        <Text>Content for section 1</Text>
      </Box>

      <Separator />

      <Box p="md">
        <Heading size="sm">Section 2</Heading>
        <Text>Content for section 2</Text>
      </Box>

      <Separator />

      <Box p="md">
        <Heading size="sm">Section 3</Heading>
        <Text>Content for section 3</Text>
      </Box>
    </Box>
  )
}
```

### In Lists

```typescript
function ListWithSeparators({ items }) {
  return (
    <Box flexDirection="column">
      {items.map((item, index) => (
        <>
          <ListItem key={item.id} label={item.name} />
          {index < items.length - 1 && <Separator />}
        </>
      ))}
    </Box>
  )
}
```

### Vertical Toolbar Divider

```typescript
function Toolbar() {
  return (
    <Box flexDirection="row" alignItems="center" gap="sm" p="sm">
      <Button variant="tertiary" leadingSlot="bold">Bold</Button>
      <Button variant="tertiary" leadingSlot="italic">Italic</Button>

      <Separator direction="vertical" />

      <Button variant="tertiary" leadingSlot="align-left">Left</Button>
      <Button variant="tertiary" leadingSlot="align-center">Center</Button>

      <Separator direction="vertical" />

      <Button variant="tertiary" leadingSlot="link">Link</Button>
    </Box>
  )
}
```

### In Menu

```typescript
function DropdownMenu() {
  return (
    <Box flexDirection="column" minWidth="200px">
      <MenuItem label="Profile" />
      <MenuItem label="Settings" />

      <Separator />

      <MenuItem label="Help" />
      <MenuItem label="Feedback" />

      <Separator variant="dashed" />

      <MenuItem label="Logout" />
    </Box>
  )
}
```

### Card Dividers

```typescript
function InfoCard() {
  return (
    <Card>
      <Box p="md">
        <Heading size="sm">Account Information</Heading>
        <Text>View and edit your account details</Text>
      </Box>

      <Separator />

      <Box p="md">
        <Text weight="bold">Email</Text>
        <Text>user@example.com</Text>
      </Box>

      <Separator />

      <Box p="md">
        <Text weight="bold">Plan</Text>
        <Text>Pro Plan</Text>
      </Box>
    </Card>
  )
}
```

### Grid with Dividers

```typescript
function StatsGrid({ stats }) {
  return (
    <Box>
      {stats.map((stat, index) => (
        <Box key={stat.id} flexDirection="row">
          <Box flex={1} p="md">
            <Text size="sm" color="text-secondary">{stat.label}</Text>
            <Heading size="md">{stat.value}</Heading>
          </Box>
          {index < stats.length - 1 && <Separator direction="vertical" />}
        </Box>
      ))}
    </Box>
  )
}
```

### Footer Divider

```typescript
function PageWithFooter() {
  return (
    <Box flexDirection="column" minHeight="100vh">
      <Box flex={1} p="lg">
        {/* Main content */}
      </Box>

      <Separator />

      <Box p="md" alignItems="center">
        <Text size="sm" color="text-secondary">
          © 2024 Company Name
        </Text>
      </Box>
    </Box>
  )
}
```

### Sidebar Divider

```typescript
function SidebarNav() {
  return (
    <Box flexDirection="row">
      <Box width="200px" p="md">
        {/* Sidebar content */}
      </Box>

      <Separator direction="vertical" />

      <Box flex={1} p="md">
        {/* Main content */}
      </Box>
    </Box>
  )
}
```

### Dashed Section Break

```typescript
function Article() {
  return (
    <Box flexDirection="column" gap="lg">
      <Box>
        <Heading size="md">Introduction</Heading>
        <Text>Lorem ipsum dolor sit amet...</Text>
      </Box>

      <Separator variant="dashed" />

      <Box>
        <Heading size="md">Main Content</Heading>
        <Text>Consectetur adipiscing elit...</Text>
      </Box>
    </Box>
  )
}
```

## Visual Design

Separator has:

- Thin line (1px) for subtle visual division
- Default grey color matching border colors
- Solid line by default, dashed option available
- Horizontal orientation by default
- Full width (horizontal) or full height (vertical) within parent container
- Semantic `separator` role for accessibility

## Layout Notes

- **Horizontal separators**: Full width of parent container
- **Vertical separators**: Full height of parent container (ensure parent has defined height)
- Use within flex containers for best results
- Consider spacing around separators with Box gap or padding props

## Related Components

- **Box**: For layout and spacing around separators
- **Card**: Often used with separators to divide sections
- **Menu**: Frequently contains separators between groups

## Testing Queries

```typescript
// Query by role
const separator = screen.getByRole('separator')
expect(separator).toBeInTheDocument()

// Check direction
expect(separator).toHaveAttribute('data-direction', 'horizontal')
expect(separator).toHaveAttribute('data-direction', 'vertical')

// Check variant
expect(separator).toHaveAttribute('data-variant', 'solid')
expect(separator).toHaveAttribute('data-variant', 'dashed')

// Query by data attribute
const separator = container.querySelector('[data-name="separator"]')
expect(separator).toBeInTheDocument()
```
