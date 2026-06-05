# Button

Primary action component for user interactions.

## Import

```typescript
import { Button } from '@gorgias/axiom'
```

## Props

### ButtonProps

The Button component supports two rendering modes via discriminated union:

**As Button (default):**

```typescript
type ButtonProps = {
    as?: 'button'
    size?: 'sm' | 'md' // Default: 'md'
    intent?: 'regular' | 'destructive' | 'ai' // Default: 'regular'
    variant?: 'primary' | 'secondary' | 'tertiary' // Default: 'primary'
    isLoading?: boolean // Default: false
    isDisabled?: boolean // Default: false
    onPress?: (e: PressEvent) => void
    onPressStart?: (e: PressEvent) => void
    onPressEnd?: (e: PressEvent) => void
    onPressUp?: (e: PressEvent) => void
    onPressChange?: (isPressed: boolean) => void
    onFocus?: (e: FocusEvent) => void
    onBlur?: (e: FocusEvent) => void
    onFocusChange?: (isFocused: boolean) => void
    onKeyDown?: (e: KeyboardEvent) => void
    onKeyUp?: (e: KeyboardEvent) => void
} & (ButtonWithLabel | IconButton)

type ButtonWithLabel = {
    children: ReactNode // Button text content
    leadingSlot?: IconName | ReactNode // Icon/content before text
    trailingSlot?: IconName | ReactNode // Icon/content after text
}

type IconButton = {
    icon: ReactNode // Icon-only button
}
```

**As Anchor:**

`href`, `target`, `rel`, and `onClick` are only accepted when `as="a"`. The button renders as an `AriaLink` and routes through `AxiomProvider.navigate` when configured (e.g. for client-side routing). For external links, pass `target` and `rel` explicitly — there are no defaults.

```typescript
type ButtonProps = {
    as: 'a'
    href: string  // required when as="a"
    target?: string  // pass explicitly (e.g. '_blank')
    rel?: string     // pass explicitly (e.g. 'noopener noreferrer')
    onClick?: MouseEventHandler
    // ... all other props same as button mode
}
```

## Usage

### Basic Button

```typescript
<Button>Click me</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="tertiary">Learn More</Button>
```

### Sizes

```typescript
<Button size="sm">Small Button</Button>
<Button size="md">Medium Button</Button>
```

### Intents

```typescript
<Button intent="regular">Save</Button>
<Button intent="destructive">Delete</Button>
<Button intent="ai">Generate</Button>
```

### With Icons

```typescript
// Icon slots with text
<Button leadingSlot="plus">Add Item</Button>
<Button trailingSlot="arrow-right">Next</Button>

// Icon-only button
<Button icon={<Icon name="settings" />} />

// Custom icon content
<Button leadingSlot={<Icon name="search" size="sm" />}>
  Search
</Button>
```

### Loading State

```typescript
<Button isLoading>Processing...</Button>
```

When `isLoading` is true, a spinner replaces button content and the button becomes disabled.

### Disabled State

```typescript
<Button isDisabled>Disabled Button</Button>
```

### As Link

```typescript
// Internal link — routes through AxiomProvider.navigate when configured
<Button as="a" href="/internal-page">
  Go to page
</Button>

// External link — pass target and rel explicitly
<Button
  as="a"
  href="https://example.com"
  target="_blank"
  rel="noopener noreferrer"
>
  Visit Site
</Button>
```

## Variants and Intents

Combine `variant` and `intent` for different visual styles:

```typescript
// Primary variants
<Button variant="primary" intent="regular">Primary Regular</Button>
<Button variant="primary" intent="destructive">Primary Destructive</Button>
<Button variant="primary" intent="ai">Primary AI</Button>

// Secondary variants
<Button variant="secondary" intent="regular">Secondary Regular</Button>
<Button variant="secondary" intent="destructive">Secondary Destructive</Button>

// Tertiary variants
<Button variant="tertiary" intent="regular">Tertiary Regular</Button>
<Button variant="tertiary" intent="destructive">Tertiary Destructive</Button>
```

## Related Components

- **ButtonGroup**: Group multiple buttons with consistent spacing
- **MultiButton**: Button with dropdown menu for additional actions
- **StatusButton**: Button with loading and success states

## Testing Queries

```typescript
// Standard button
screen.getByRole('button', { name: 'Click me' })

// Link button
screen.getByRole('link', { name: 'Visit Site' })

// Disabled state
expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()

// Pressing button
fireEvent.click(screen.getByRole('button', { name: 'Submit' }))
```
