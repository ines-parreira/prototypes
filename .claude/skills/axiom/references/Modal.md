# Modal

Centered dialog overlay component that focuses user attention on important content.

## Import

```typescript
import {
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
} from '@gorgias/axiom'
```

## Props

### ModalProps

```typescript
type ModalProps = {
    size?: 'sm' | 'md' | 'lg' | 'xl' // Modal width. Default: 'md'
    isDismissable?: boolean // Can dismiss with Esc/outside click. Default: true
    isOpen?: boolean // Whether modal is open (controlled)
    onOpenChange?: (isOpen: boolean) => void // Open state change callback
    withoutOverlay?: boolean // Hide backdrop overlay. Default: false
    children: ReactNode // Modal content
}
```

## Usage

### Basic Modal

```typescript
const [isOpen, setIsOpen] = useState(false)

<>
  <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

  <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
    <OverlayHeader title="Confirm Action" />
    <OverlayContent>
      <Text>Are you sure you want to proceed?</Text>
    </OverlayContent>
    <OverlayFooter>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </OverlayFooter>
  </Modal>
</>
```

### Modal Sizes

```typescript
// Small modal
<Modal isOpen={isOpen} onOpenChange={setIsOpen} size="sm">
  <OverlayHeader title="Small Modal" />
  <OverlayContent>
    <Text>Compact modal for simple messages.</Text>
  </OverlayContent>
</Modal>

// Medium modal (default)
<Modal isOpen={isOpen} onOpenChange={setIsOpen} size="md">
  <OverlayHeader title="Medium Modal" />
  <OverlayContent>
    <Text>Standard modal size.</Text>
  </OverlayContent>
</Modal>

// Large modal
<Modal isOpen={isOpen} onOpenChange={setIsOpen} size="lg">
  <OverlayHeader title="Large Modal" />
  <OverlayContent>
    <Text>Wider modal for more complex content.</Text>
  </OverlayContent>
</Modal>

// Extra large modal
<Modal isOpen={isOpen} onOpenChange={setIsOpen} size="xl">
  <OverlayHeader title="Extra Large Modal" />
  <OverlayContent>
    <Text>Maximum width modal.</Text>
  </OverlayContent>
</Modal>
```

### With Description

```typescript
<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
  <OverlayHeader
    title="Delete Item"
    description="This action cannot be undone."
  />
  <OverlayContent>
    <Text>Are you sure you want to delete this item?</Text>
  </OverlayContent>
  <OverlayFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" intent="destructive" onClick={handleDelete}>
      Delete
    </Button>
  </OverlayFooter>
</Modal>
```

### Form Modal

```typescript
<Modal isOpen={isOpen} onOpenChange={setIsOpen} size="lg">
  <OverlayHeader title="Create User" />
  <OverlayContent>
    <Box flexDirection="column" gap="md">
      <TextField label="Name" value={name} onChange={setName} />
      <TextField label="Email" value={email} onChange={setEmail} />
      <SelectField label="Role" items={roles} value={role} onChange={setRole}>
        {(role) => <ListItem label={role.name} />}
      </SelectField>
    </Box>
  </OverlayContent>
  <OverlayFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSave}>
      Create User
    </Button>
  </OverlayFooter>
</Modal>
```

### Non-Dismissable Modal

```typescript
<Modal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  isDismissable={false}
>
  <OverlayHeader title="Processing..." />
  <OverlayContent>
    <Text>Please wait while we process your request.</Text>
    <Skeleton height="40px" />
  </OverlayContent>
</Modal>
```

### Without Overlay Backdrop

```typescript
<Modal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  withoutOverlay
>
  <OverlayHeader title="Notification" />
  <OverlayContent>
    <Text>Modal without dimmed backdrop.</Text>
  </OverlayContent>
</Modal>
```

### Uncontrolled Modal

```typescript
<Modal defaultOpen>
  <OverlayHeader title="Welcome" />
  <OverlayContent>
    <Text>This modal is open by default.</Text>
  </OverlayContent>
</Modal>
```

## Related Components

- **SidePanel**: Slide-out panel from the side
- **Overlay**: Lower-level backdrop component
- **OverlayHeader**: Header section for Modal/SidePanel
- **OverlayContent**: Content section for Modal/SidePanel
- **OverlayFooter**: Footer section for Modal/SidePanel
- **Button**: For modal actions

## Testing Queries

```typescript
// Modal content is not visible when closed
expect(screen.queryByText('Modal content')).not.toBeInTheDocument()

// Open modal
await userEvent.click(screen.getByRole('button', { name: 'Open' }))

// Modal content is visible when open
expect(screen.getByText('Modal content')).toBeInTheDocument()

// Close modal by clicking button
await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
```
