# Card

Container component with elevation styling for grouping related content. Extends Box with all layout and flexbox capabilities.

## Import

```typescript
import { Card, CardContent, CardFooter, CardHeader } from '@gorgias/axiom'
```

## Props

### CardProps

Extends `BoxProps` with elevation and interaction support.

```typescript
type CardProps = BoxProps & {
    elevation?: 'background' | 'low' | 'default' | 'mid' | 'high' // Default: undefined (no elevation)
    onClick?: () => void // Makes card interactive (renders as anchor)

    // Inherits all BoxProps:
    // - Spacing: p, pt, pr, pb, pl, m, mt, mr, mb, ml
    // - Sizing: w, h, width, height, minWidth, maxWidth, minHeight, maxHeight
    // - Flexbox: flexDirection, justifyContent, alignItems, gap, etc.
    children?: ReactNode
    className?: string
}
```

### CardHeaderProps

```typescript
type CardHeaderProps = {
    title?: string | ReactNode // Header title
    icon?: IconName | ReactNode // Icon before title
    description?: string | ReactNode // Description below title
} & FlexProps &
    LayoutProps
```

### CardContentProps

```typescript
type CardContentProps = {
    children?: ReactNode
} & FlexProps &
    LayoutProps
```

### CardFooterProps

```typescript
type CardFooterProps = {
    children?: ReactNode
} & FlexProps &
    LayoutProps
```

## Usage

### Basic Card

```typescript
<Card elevation="mid" p="md">
  <Text>Card content</Text>
</Card>
```

### With CardHeader, CardContent, CardFooter

```typescript
<Card elevation="mid" w={300}>
  <CardHeader
    title="Card Title"
    description="This is a description"
  />
  <CardContent>
    <Text>This is the main content of the card.</Text>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>
```

### With Icon

```typescript
<Card elevation="mid" w={300}>
  <CardHeader
    icon="settings"
    title="Card with Icon"
    description="Icon in the header"
  />
  <CardContent>
    <Text>Content goes here.</Text>
  </CardContent>
</Card>

// Custom icon ReactNode
<CardHeader
  icon={<Icon name="info" color="blue" />}
  title="Custom Icon"
/>
```

### Elevation Levels

```typescript
<Card>No elevation (omit the prop)</Card>
<Card elevation="background">Background elevation</Card>
<Card elevation="low">Low elevation</Card>
<Card elevation="default">Default elevation</Card>
<Card elevation="mid">Mid elevation</Card>
<Card elevation="high">High elevation</Card>
```

### Interactive Card

```typescript
// Renders as clickable anchor element
<Card elevation="mid" onClick={() => alert('clicked')} w={300}>
  <CardHeader
    icon="settings-ai"
    title="Interactive Card"
    description="Click anywhere on this card"
  />
  <CardContent>
    <Text>
      The content here should ideally consist of non-interactive
      elements only, to avoid breaking accessibility rules
    </Text>
  </CardContent>
</Card>
```

### With Multiple Footer Actions

```typescript
<Card elevation="mid" w={300}>
  <CardHeader
    title="Confirmation"
    description="Are you sure you want to proceed?"
  />
  <CardContent>
    <Text>This action cannot be undone.</Text>
  </CardContent>
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>
```

### Custom Layout with Box Props

```typescript
// Horizontal card layout
<Card elevation="mid" flexDirection="row" gap="md" p="md">
  <Image src="/avatar.png" w={64} h={64} />
  <Box flexDirection="column" gap="xs">
    <Heading size="md">User Name</Heading>
    <Text>User description</Text>
  </Box>
</Card>

// Card with custom sizing and spacing
<Card
  elevation="high"
  w="100%"
  maxWidth={600}
  p="xl"
  gap="md"
>
  <CardHeader title="Custom Layout" />
  <CardContent>
    <Text>Content with custom padding and gap</Text>
  </CardContent>
</Card>
```

## Composition

Card uses a composition pattern with sub-components:

- **CardHeader**: Title, icon, and description section
- **CardContent**: Main content area (grows to fill available space)
- **CardFooter**: Action buttons or footer content

All sub-components accept Box layout props for customization.

## Related Components

- **Box**: Base layout primitive that Card extends
- **Modal**: For overlay cards with focus management
- **Banner**: For inline messaging cards

## Testing Queries

```typescript
// Query by text content
screen.getByText('Card content')

// Query heading in CardHeader
screen.getByRole('heading', { name: 'Card Title' })

// Query icon in CardHeader
screen.getByRole('img', { hidden: true })

// Interactive card (renders as link)
const card = screen.getByText('Interactive Card')
fireEvent.click(card)

// Check elevation class
const card = screen.getByText('Card content')
expect(card).toHaveClass('mid')
```
