# Popover

Floating content anchored to a trigger element. Manages open state and outside-click / keyboard dismissal automatically. Built on React Aria's `DialogTrigger` + `Popover`.

## Import

```typescript
import { Popover } from '@gorgias/axiom'
import type { PopoverProps, PopoverPlacement, PopoverElevation, PopoverTriggerRenderProps } from '@gorgias/axiom'
```

## Props

```typescript
type PopoverProps = VisibilityProps & {
    trigger: TriggerProp<PopoverTriggerRenderProps>  // required
    children: ReactNode                              // popover content
    placement?: PopoverPlacement                     // default: 'bottom'
    offset?: number                                  // px between trigger and popover, default: 8
    crossOffset?: number                             // px shift along the cross axis (horizontal for top/bottom, vertical for left/right)
    shouldFlip?: boolean                             // flip to opposite side when no room, default: true
    triggerRef?: RefObject<HTMLElement>              // anchor to an external element
    isKeyboardDismissDisabled?: boolean              // disable Escape dismissal
    minWidth?: SizeValue
    maxWidth?: SizeValue
    maxHeight?: SizeValue                            // enables internal scrolling
    padding?: SizeValue                              // default: 'sm'
    elevation?: 'mid' | 'high'                       // default: 'high'
    'aria-label'?: string
    'aria-labelledby'?: string
}

type PopoverTriggerRenderProps = { isOpen: boolean }
```

## Examples

### Basic

```typescript
<Popover trigger={<Button>Open</Button>}>
    <Text>Popover content</Text>
</Popover>
```

### Render function trigger

```typescript
<Popover
    trigger={({ isOpen }) => (
        <Button variant={isOpen ? 'primary' : 'secondary'}>Toggle</Button>
    )}
    placement="bottom right"
>
    <Text>Popover content</Text>
</Popover>
```

### Controlled

```typescript
const [isOpen, setIsOpen] = useState(false)

<Popover
    isOpen={isOpen}
    onOpenChange={setIsOpen}
    trigger={<Button>Open</Button>}
>
    <Text>Popover content</Text>
</Popover>
```

### Scrollable content

```typescript
<Popover
    trigger={<Button>Show list</Button>}
    maxHeight={300}
    maxWidth={320}
>
    <Box flexDirection="column" gap="xs">
        {items.map((item) => <Text key={item.id}>{item.name}</Text>)}
    </Box>
</Popover>
```

## Related

- **Select / MultiSelect / Menu / DatePicker** — popover-based components with built-in selection logic
- **Tooltip** — for short, non-interactive hints
- **Modal / SidePanel** — for blocking dialogs and side panels

## Testing Queries

```typescript
// Open the popover via its trigger
await user.click(screen.getByRole('button', { name: 'Open' }))

// Assert popover content is visible
expect(screen.getByRole('dialog')).toBeInTheDocument()
expect(screen.getByText('Popover content')).toBeVisible()

// Internal structural assertions (when needed)
container.querySelector('[data-name="popover"]')
container.querySelector('[data-name="popover-content"]')
container.querySelector('[data-name="popover-trigger"]')
```
