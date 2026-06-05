# SidePanel

Slide-out panel component for secondary workflows and details views. Slides in from either the left or right side of the screen.

## Import

```typescript
import {
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SidePanel,
    SidePanelPlacement,
} from '@gorgias/axiom'
```

## Props

### SidePanelProps

```typescript
type SidePanelProps = {
    placement?: 'left' | 'right' // Side the panel slides in from. Default: 'right'
    size?: 'sm' | 'md' | 'lg' | 'xl' // Panel width. Default: 'md'
    width?: string // Custom width (e.g., '400px', '50%')
    isDismissable?: boolean // Can dismiss with Esc/outside click. Default: true
    isOpen?: boolean // Whether panel is open (controlled)
    defaultOpen?: boolean // Whether panel is open initially (uncontrolled)
    onOpenChange?: (isOpen: boolean) => void // Open state change callback
    withoutOverlay?: boolean // Hide backdrop overlay. Default: false
    withoutPadding?: boolean // Remove default padding. Default: false
    children: ReactNode // Panel content
}
```

## Usage

### Basic SidePanel

```typescript
const [isOpen, setIsOpen] = useState(false)

<>
  <Button onClick={() => setIsOpen(true)}>Open Panel</Button>

  <SidePanel isOpen={isOpen} onOpenChange={setIsOpen}>
    <OverlayHeader title="User Details" onClose={() => setIsOpen(false)} />
    <OverlayContent>
      <Box direction="column" gap="md">
        <Text>Name: John Doe</Text>
        <Text>Email: john@example.com</Text>
      </Box>
    </OverlayContent>
  </SidePanel>
</>
```

### Panel Sizes

```typescript
<SidePanel isOpen={isOpen} onOpenChange={setIsOpen} size="sm">
  <OverlayHeader title="Small Panel" />
  <OverlayContent>Compact panel</OverlayContent>
</SidePanel>

<SidePanel isOpen={isOpen} onOpenChange={setIsOpen} size="md">
  <OverlayHeader title="Medium Panel" />
  <OverlayContent>Standard panel</OverlayContent>
</SidePanel>

<SidePanel isOpen={isOpen} onOpenChange={setIsOpen} size="lg">
  <OverlayHeader title="Large Panel" />
  <OverlayContent>Wide panel</OverlayContent>
</SidePanel>

<SidePanel isOpen={isOpen} onOpenChange={setIsOpen} size="xl">
  <OverlayHeader title="Extra Large Panel" />
  <OverlayContent>Maximum width panel</OverlayContent>
</SidePanel>
```

### Custom Width

```typescript
<SidePanel isOpen={isOpen} onOpenChange={setIsOpen} width="600px">
  <OverlayHeader title="Custom Width Panel" />
  <OverlayContent>Panel with custom 600px width</OverlayContent>
</SidePanel>
```

### Without Padding

```typescript
<SidePanel isOpen={isOpen} onOpenChange={setIsOpen} withoutPadding>
  <OverlayHeader title="No Padding" />
  <Box padding="xl">
    <Text>Custom padding control</Text>
  </Box>
</SidePanel>
```

### Form in Panel

```typescript
<SidePanel isOpen={isOpen} onOpenChange={setIsOpen} size="lg">
  <OverlayHeader title="Edit Settings" onClose={() => setIsOpen(false)} />
  <OverlayContent>
    <Box direction="column" gap="md">
      <TextField label="Name" value={name} onChange={setName} />
      <TextField label="Email" value={email} onChange={setEmail} />
      <ToggleField label="Enable notifications" value={notify} onChange={setNotify} />
    </Box>
  </OverlayContent>
  <OverlayFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSave}>
      Save Changes
    </Button>
  </OverlayFooter>
</SidePanel>
```

### Left Placement

```typescript
<SidePanel isOpen={isOpen} onOpenChange={setIsOpen} placement="left">
  <OverlayHeader title="Left Panel" />
  <OverlayContent>
    <Text>Panel slides in from the left</Text>
  </OverlayContent>
</SidePanel>
```

### Without Overlay Backdrop

```typescript
<SidePanel isOpen={isOpen} onOpenChange={setIsOpen} withoutOverlay>
  <OverlayHeader title="No Backdrop" />
  <OverlayContent>
    <Text>Panel without dimmed backdrop</Text>
  </OverlayContent>
</SidePanel>
```

### Non-Dismissable Panel

```typescript
<SidePanel isOpen={isOpen} onOpenChange={setIsOpen} isDismissable={false}>
  <OverlayHeader title="Loading..." />
  <OverlayContent>
    <Skeleton height="40px" />
    <Text>Processing your request...</Text>
  </OverlayContent>
</SidePanel>
```

## Related Components

- **Modal**: Centered dialog overlay
- **Overlay**: Lower-level backdrop component
- **OverlayHeader**: Header section for Modal/SidePanel
- **OverlayContent**: Content section for Modal/SidePanel
- **OverlayFooter**: Footer section for Modal/SidePanel

## Testing Queries

```typescript
// Panel is not visible when closed
expect(screen.queryByText('Panel content')).not.toBeInTheDocument()

// Open panel
await userEvent.click(screen.getByRole('button', { name: 'Open' }))

// Panel is visible when open
expect(screen.getByText('Panel content')).toBeInTheDocument()

// Close panel
await userEvent.click(screen.getByRole('button', { name: 'Close' }))
```
