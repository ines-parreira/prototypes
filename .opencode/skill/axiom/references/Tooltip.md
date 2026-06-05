# Tooltip

Component that displays contextual information on hover or focus.

## Import

```typescript
import { Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'
```

## Props

### TooltipProps

```typescript
type TooltipProps = {
    placement?:
        | 'top'
        | 'bottom'
        | 'left'
        | 'right'
        | 'top-start'
        | 'top-end'
        | 'bottom-start'
        | 'bottom-end' // Default: 'top'
    delay?: number // Show delay in ms. Default: 1000
    closeDelay?: number // Close delay in ms. Default: 333
    isOpen?: boolean // Whether tooltip is open (controlled)
    defaultOpen?: boolean // Whether tooltip is open initially
    onOpenChange?: (isOpen: boolean) => void // Open state change callback
    isDisabled?: boolean // Disable tooltip
    children: ReactNode // Trigger and content elements
}
```

## Usage

### Basic Tooltip

By default, tooltips trigger on hover and focus.

```typescript
<Tooltip>
  <Button>Hover me</Button>
  <TooltipContent title="Helpful information" />
</Tooltip>
```

### With Custom Trigger

Custom triggers must have an ARIA role or use semantic HTML and forward their ref.

```typescript
<Tooltip>
  <TooltipTrigger>
    <span role="button" tabIndex={0}>Custom trigger</span>
  </TooltipTrigger>
  <TooltipContent title="Tooltip content" />
</Tooltip>
```

### Tooltip Placement

```typescript
<Tooltip placement="top">
  <Button>Top</Button>
  <TooltipContent title="Positioned at top" />
</Tooltip>

<Tooltip placement="bottom">
  <Button>Bottom</Button>
  <TooltipContent title="Positioned at bottom" />
</Tooltip>

<Tooltip placement="left">
  <Button>Left</Button>
  <TooltipContent title="Positioned at left" />
</Tooltip>

<Tooltip placement="right">
  <Button>Right</Button>
  <TooltipContent title="Positioned at right" />
</Tooltip>
```

### With Description

```typescript
<Tooltip>
  <Button icon="info" />
  <TooltipContent
    title="Information"
    description="Additional details about this feature"
  />
</Tooltip>
```

### Custom Delays

```typescript
// Show immediately, close after 1 second
<Tooltip delay={0} closeDelay={1000}>
  <Button>Quick tooltip</Button>
  <TooltipContent title="Appears immediately" />
</Tooltip>
```

### Controlled Tooltip

```typescript
const [isOpen, setIsOpen] = useState(false)

<Tooltip isOpen={isOpen} onOpenChange={setIsOpen}>
  <Button onClick={() => setIsOpen(!isOpen)}>Click to toggle</Button>
  <TooltipContent title="Click-triggered tooltip" />
</Tooltip>
```

### Disabled Tooltip

```typescript
<Tooltip isDisabled>
  <Button>No tooltip</Button>
  <TooltipContent title="This won't show" />
</Tooltip>
```

### With Icon Button

```typescript
<Tooltip>
  <Button icon="settings" />
  <TooltipContent title="Settings" />
</Tooltip>
```

### On Links

```typescript
<Tooltip>
  <a href="/help">Need help?</a>
  <TooltipContent title="Opens help documentation" />
</Tooltip>
```

## Related Components

- **Button**: Common tooltip trigger
- **Icon**: Often used with tooltips

## Testing Queries

```typescript
// Trigger element
const button = screen.getByRole('button', { name: 'Hover me' })

// Hover to show tooltip
await userEvent.hover(button)
vi.advanceTimersByTime(1000) // Wait for delay

// Tooltip is visible
expect(screen.getByText('Helpful information')).toBeInTheDocument()

// Unhover to hide tooltip
await userEvent.unhover(button)
vi.advanceTimersByTime(333) // Wait for close delay

// Tooltip is hidden
expect(screen.queryByText('Helpful information')).not.toBeInTheDocument()
```
