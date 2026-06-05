# MultiButton

Component for visually grouping multiple buttons together with connected borders, without selection behavior.

## Import

```typescript
import { MultiButton } from '@gorgias/axiom'
```

## Props

### MultiButtonProps

Extends `LayoutProps` from Box.

```typescript
type MultiButtonProps = {
    children: ReactNode // Button elements to group
    variant?: 'primary' | 'secondary' | 'tertiary' // Default: 'primary'
    size?: 'sm' | 'md' // Default: 'md'
} & LayoutProps
```

## Usage

### Basic MultiButton

```typescript
<MultiButton>
  <Button>Primary action</Button>
  <Button icon="arrow-chevron-down" />
</MultiButton>
```

### With Variant

```typescript
// Primary (default)
<MultiButton variant="primary">
  <Button>Save</Button>
  <Button icon="arrow-chevron-down" />
</MultiButton>

// Secondary
<MultiButton variant="secondary">
  <Button>Cancel</Button>
  <Button icon="close" />
</MultiButton>

// Tertiary
<MultiButton variant="tertiary">
  <Button>More</Button>
  <Button icon="arrow-chevron-down" />
</MultiButton>
```

### With Size

```typescript
// Medium (default)
<MultiButton size="md">
  <Button>Action</Button>
  <Button icon="arrow-chevron-down" />
</MultiButton>

// Small
<MultiButton size="sm">
  <Button>Small action</Button>
  <Button icon="arrow-chevron-down" />
</MultiButton>
```

### Multiple Buttons

```typescript
<MultiButton>
  <Button>Option 1</Button>
  <Button>Option 2</Button>
  <Button icon="arrow-chevron-down" />
</MultiButton>
```

### With Dropdown Pattern

```typescript
// Common pattern: main action + dropdown button
<MultiButton>
  <Button onPress={() => handleSave()}>
    Save
  </Button>
  <Button
    icon="arrow-chevron-down"
    onPress={() => openMenu()}
  />
</MultiButton>
```

### Custom Styling with LayoutProps

```typescript
<MultiButton variant="secondary" w={300}>
  <Button>Action</Button>
  <Button icon="arrow-chevron-down" />
</MultiButton>
```

## Behavior

- **Visual grouping only**: MultiButton does not handle selection state (unlike ButtonGroup)
- **Connected borders**: Buttons share borders for cohesive appearance
- **Variant/size inheritance**: Applies variant and size to all child buttons
- **Independent click handlers**: Each button maintains its own `onPress` handler

## Related Components

- **Button**: Individual button component
- **ButtonGroup**: For single-selection radio group behavior
- **Menu**: Often paired with MultiButton for dropdown actions

## Testing Queries

```typescript
// Query buttons by role
screen.getByRole('button', { name: 'Primary action' })
screen.getByRole('button', { name: 'arrow-chevron-down' })

// Multiple buttons
const buttons = screen.getAllByRole('button')
expect(buttons).toHaveLength(2)

// Click individual buttons
await user.click(screen.getByRole('button', { name: 'Save' }))
```
