# Toast

Notification system with multiple intents, actions, and promise support. Uses imperative `toast()` API.

## Import

```typescript
import { Toaster, toast } from '@gorgias/axiom'
```

## Setup

Add `<Toaster />` to your app root:

```typescript
<Toaster />
```

### ToasterProps

```typescript
type ToasterProps = {
    placement?: ToasterPlacement // default: 'bottom-right'
    visibleToasts?: number // default: 3
    expand?: boolean
    duration?: number
}

type ToasterPlacement = 'top-left' | 'top-center' | 'top-right'
    | 'bottom-left' | 'bottom-center' | 'bottom-right'
```

## Toast API

### By Intent

```typescript
toast.info('Information message')
toast.success('Operation completed')
toast.warning('This action is risky')
toast.error('Something went wrong')
toast.ai('AI has generated a response')
```

### With Options

```typescript
type ToastOptions = {
    caption?: string
    icon?: IconName
    inlineActions?: ReactNode | ((props: { id: ToastId }) => ReactNode)
    actions?: ReactNode | ((props: { id: ToastId }) => ReactNode)
    duration?: number // default: 2000, with actions: 5000
    id?: string | number
    onDismiss?: () => void
    onAutoClose?: () => void
}
```

```typescript
toast.success('Saved!', {
    caption: 'Changes have been saved',
})
```

### With Actions

```typescript
// Inline action (horizontal)
toast.info('Action completed', {
    inlineActions: ({ id }) => (
        <Button size="sm" variant="tertiary" onClick={() => toast.dismiss(id)}>
            Undo
        </Button>
    ),
})

// Block actions (vertical)
toast.warning('Confirm changes', {
    actions: ({ id }) => (
        <Box gap="xs">
            <Button size="sm" onClick={handleConfirm}>Confirm</Button>
            <Button size="sm" variant="secondary" onClick={() => toast.dismiss(id)}>Cancel</Button>
        </Box>
    ),
})
```

### Promise-Based

```typescript
toast.promise(fetchData(), {
    loading: 'Loading...',
    success: (data) => `Loaded ${data.count} items`,
    error: (error) => `Failed: ${error.message}`,
})
```

### Dismiss

```typescript
const id = toast.info('Message', { duration: Infinity })
toast.dismiss(id) // dismiss specific toast
toast.dismiss() // dismiss all
```

### Default Icons by Intent

- `info` → `'info'`
- `success` → `'circle-check'`
- `warning` → `'triangle-warning'`
- `destructive` → `'octagon-error'`
- `ai` → `'ai'`

## Testing Queries

Toasts expose their title as the accessible name of a `role="status"` element, so
query them by name:

```typescript
// Assert a toast is shown
expect(
    screen.getByRole('status', { name: 'Success message' }),
).toBeInTheDocument()

// Access the element to assert intent or caption text
const toastEl = screen.getByRole('status', { name: 'Saved' })
expect(toastEl).toHaveAttribute('data-intent', 'success')

// Assert a specific toast is gone (prefer scoping by name)
expect(
    screen.queryByRole('status', { name: 'Saved' }),
).not.toBeInTheDocument()
```
