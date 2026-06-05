# Overlay

Lower-level backdrop component for modal and panel overlays with focus management.

## Import

```typescript
import { Overlay } from '@gorgias/axiom'
```

## Props

### OverlayProps

Extends `ModalOverlayProps` from React Aria.

```typescript
type OverlayProps = {
    children: ReactNode // Content displayed over backdrop
    isTransparent?: boolean // Render transparent backdrop. Default: false
    isOpen?: boolean // Whether overlay is open
    onOpenChange?: (isOpen: boolean) => void // Open state change callback
    isDismissable?: boolean // Can dismiss with Esc/outside click
}
```

## Usage

### Basic Overlay

```typescript
const [isOpen, setIsOpen] = useState(false)

<Overlay isOpen={isOpen} onOpenChange={setIsOpen}>
  <div>Content displayed over dimmed backdrop</div>
</Overlay>
```

### Transparent Overlay

```typescript
<Overlay isOpen={isOpen} onOpenChange={setIsOpen} isTransparent>
  <div>Content without dimmed backdrop</div>
</Overlay>
```

### Non-Dismissable Overlay

```typescript
<Overlay isOpen={isOpen} onOpenChange={setIsOpen} isDismissable={false}>
  <div>Cannot close with Esc or outside click</div>
</Overlay>
```

## Notes

- Overlay is a lower-level component typically used internally by Modal and SidePanel
- For most use cases, prefer using Modal or SidePanel instead
- Provides backdrop layer with focus management
- Handles click-outside and Escape key dismissal

## Related Components

- **Modal**: Centered dialog using Overlay
- **SidePanel**: Slide-out panel using Overlay

## Testing Queries

```typescript
// Check overlay is visible
expect(screen.getByText('Overlay content')).toBeInTheDocument()

// Close by pressing Escape (if dismissable)
fireEvent.keyDown(document, { key: 'Escape' })
```
