# Menu

Dropdown menu component for displaying actions, options, and commands with support for sections, submenus, and selection modes.

## Import

```typescript
import { Menu, MenuItem, MenuSection, SubMenu } from '@gorgias/axiom'
```

## Props

### MenuProps

```typescript
type MenuProps<T extends object = object> = {
    // Required
    children: ReactNode | ((item: T) => ReactNode) // Menu items or render function
    'aria-label': string // Accessibility label

    // Trigger
    trigger?: ReactNode // Custom trigger element (default: "Open menu" button)
    triggerRef?: RefObject<HTMLElement> // Ref to trigger element

    // Positioning
    placement?: MenuPlacement // Menu placement (default: auto)
    shouldFlip?: boolean // Flip when insufficient space (default: true)

    // Layout
    size?: MenuSize // Size of menu items (default: 'md')
    elevation?: MenuElevation // Shadow elevation (default: 'high')
    minWidth?: number | string // Minimum width
    maxWidth?: number | string // Maximum width
    maxHeight?: number | string // Maximum height (enables scrolling)

    // Actions
    onAction?: (key: Key) => void // Called when item is selected

    // Selection
    selectionMode?: 'single' | 'multiple' // Selection mode
    selectedKeys?: Selection // Controlled selected keys
    onSelectionChange?: (keys: Selection) => void // Selection change callback

    // Search
    isSearchable?: boolean // Enable search/autocomplete
    searchValue?: string // Search text (controlled)
    onSearchChange?: (value: string) => void // Search change callback

    // Async Loading
    isLoading?: boolean // Show loading indicator
    onLoadMore?: () => void // Callback when scrolling to bottom

    // Dynamic items
    items?: Iterable<T> // Items for dynamic rendering

    // Visibility (controlled/uncontrolled)
    isOpen?: boolean // Controlled open state
    defaultOpen?: boolean // Initial open state (uncontrolled)
    onOpenChange?: (isOpen: boolean) => void // Open state change callback
}

// Size options
type MenuSize = 'sm' | 'md'

// Elevation options
type MenuElevation = 'high' | 'mid'

// Placement options
type MenuPlacement =
    | 'bottom'
    | 'bottom left'
    | 'bottom right'
    | 'top'
    | 'top left'
    | 'top right'
    | 'left'
    | 'right'
```

### MenuItemProps

```typescript
type MenuItemProps = {
    // Required (unless asSlot is true)
    label?: string | ReactNode // Item text

    // Content
    caption?: string | ReactNode // Secondary text

    // Slots
    leadingSlot?:
        | IconName
        | ReactNode
        | ((state: { isSelected: boolean }) => ReactNode)
    trailingSlot?: IconName | ReactNode

    // Style
    intent?: Intent // Visual intent (default: 'regular')
    selectionStyle?: 'accent' | 'neutral' // Selected state style (default: 'accent')

    // State
    isDisabled?: boolean // Whether item is disabled

    // Actions
    onAction?: () => void // Called when item is selected

    // Custom rendering
    asSlot?: boolean // Render custom content (defaults to disabled)
    children?: ReactNode | ((state: { size: MenuSize }) => ReactNode) // Custom content when asSlot=true

    // Standard props
    id?: Key // Unique identifier
    textValue?: string // Text for accessibility
}
```

## Usage

### Basic Menu

```typescript
// Default trigger
<Menu aria-label="Actions">
  <MenuItem label="Edit" />
  <MenuItem label="Duplicate" />
  <MenuItem label="Delete" />
</Menu>

// With custom trigger
<Menu
  trigger={<Button variant="tertiary" leadingSlot="dots-meatballs-horizontal" />}
  aria-label="Actions"
>
  <MenuItem label="Edit" />
  <MenuItem label="Duplicate" />
  <MenuItem label="Delete" />
</Menu>
```

### With Icons

```typescript
<Menu aria-label="Actions">
  <MenuItem leadingSlot="edit-pencil" label="Edit" />
  <MenuItem leadingSlot="copy" label="Duplicate" />
  <MenuItem leadingSlot="trash-empty" label="Delete" />
</Menu>
```

### With Captions

```typescript
<Menu aria-label="Actions">
  <MenuItem
    label="Edit"
    caption="Ctrl+E"
    leadingSlot="edit-pencil"
  />
  <MenuItem
    label="Copy"
    caption="Ctrl+C"
    leadingSlot="copy"
  />
  <MenuItem
    label="Paste"
    caption="Ctrl+V"
    leadingSlot="copy"
  />
</Menu>
```

### With Actions

```typescript
function ActionsMenu() {
  const handleAction = (key) => {
    switch(key) {
      case 'edit':
        editItem()
        break
      case 'duplicate':
        duplicateItem()
        break
      case 'delete':
        deleteItem()
        break
    }
  }

  return (
    <Menu aria-label="Actions" onAction={handleAction}>
      <MenuItem id="edit" label="Edit" />
      <MenuItem id="duplicate" label="Duplicate" />
      <MenuItem id="delete" label="Delete" intent="destructive" />
    </Menu>
  )
}
```

### With Sections

```typescript
<Menu aria-label="Actions">
  <MenuSection id="edit" name="Edit Actions">
    <MenuItem label="Edit" />
    <MenuItem label="Duplicate" />
  </MenuSection>

  <MenuSection id="danger" name="Danger Zone">
    <MenuItem label="Archive" />
    <MenuItem label="Delete" intent="destructive" />
  </MenuSection>
</Menu>
```

### With Submenus

```typescript
<Menu aria-label="Actions">
  <MenuItem label="Edit" />
  <MenuItem label="Duplicate" />
  <SubMenu label="More Actions" leadingSlot="dots-meatballs-horizontal">
    <MenuItem label="Archive" />
    <MenuItem label="Export" />
    <MenuItem label="Share" />
  </SubMenu>
</Menu>
```

### Disabled Items

```typescript
<Menu aria-label="Actions">
  <MenuItem label="Edit" />
  <MenuItem label="Duplicate" isDisabled />
  <MenuItem label="Delete" />
</Menu>
```

### With Intents

```typescript
<Menu aria-label="Actions">
  <MenuItem
    label="Regular Action"
    intent="regular"
    leadingSlot="edit-pencil"
  />
  <MenuItem
    label="AI Action"
    intent="ai"
    leadingSlot="ai"
  />
  <MenuItem
    label="Delete"
    intent="destructive"
    leadingSlot="trash-empty"
  />
</Menu>
```

### Selection Style

The `selectionStyle` prop controls the background and text color of selected items.

- `'accent'` (default) — uses the accent surface and accent content tokens
- `'neutral'` — uses a neutral pressed background with neutral content tokens

```typescript
// Accent selection (default)
<Menu aria-label="Alignment" selectionMode="single">
  <MenuItem id="left" label="Left" />
  <MenuItem id="center" label="Center" />
  <MenuItem id="right" label="Right" />
</Menu>

// Neutral selection
<Menu aria-label="Alignment" selectionMode="single">
  <MenuItem id="left" label="Left" selectionStyle="neutral" />
  <MenuItem id="center" label="Center" selectionStyle="neutral" />
  <MenuItem id="right" label="Right" selectionStyle="neutral" />
</Menu>
```

### Dynamic Items

```typescript
const items = [
  { id: 'edit', label: 'Edit', icon: 'edit' },
  { id: 'duplicate', label: 'Duplicate', icon: 'copy' },
  { id: 'delete', label: 'Delete', icon: 'trash' },
]

<Menu
  aria-label="Actions"
  items={items}
  onAction={(key) => handleAction(key)}
>
  {(item) => (
    <MenuItem
      id={item.id}
      label={item.label}
      leadingSlot={item.icon}
    />
  )}
</Menu>
```

### With Search

```typescript
<Menu aria-label="Commands" isSearchable>
    <MenuItem label="Edit" leadingSlot="edit-pencil" />
    <MenuItem label="Copy" leadingSlot="copy" />
    <MenuItem label="Delete" leadingSlot="trash-empty" />
</Menu>
```

### With Async Loading

```typescript
<Menu
    aria-label="Users"
    isLoading={isLoading}
    onLoadMore={fetchMoreUsers}
>
    {users.map(user => (
        <MenuItem key={user.id} label={user.name} />
    ))}
</Menu>
```

### Placement Options

```typescript
// Bottom center (default)
<Menu placement="bottom" aria-label="Actions">
  <MenuItem label="Action 1" />
</Menu>

// Bottom left
<Menu placement="bottom left" aria-label="Actions">
  <MenuItem label="Action 1" />
</Menu>

// Bottom right
<Menu placement="bottom right" aria-label="Actions">
  <MenuItem label="Action 1" />
</Menu>
```

### Custom Slot Content

```typescript
<Menu aria-label="Status">
  <MenuItem
    label="Online"
    leadingSlot={<Dot color="green" />}
  />
  <MenuItem
    label="Away"
    leadingSlot={<Dot color="orange" />}
  />
  <MenuItem
    label="Offline"
    leadingSlot={<Dot color="grey" />}
  />
</Menu>
```

### With asSlot for Custom Rendering

```typescript
<Menu aria-label="Actions">
  <MenuItem label="Regular Item" />

  {/* Custom content - defaults to disabled */}
  <MenuItem asSlot>
    <Box p="sm">
      <Text weight="bold">Custom Content</Text>
      <Text size="sm">Any custom element</Text>
    </Box>
  </MenuItem>

  {/* Custom interactive content */}
  <MenuItem asSlot isDisabled={false}>
    <Button variant="tertiary" size="sm" onClick={handleClick}>
      Custom Button
    </Button>
  </MenuItem>
</Menu>
```

## Common Patterns

### Context Menu

```typescript
function ContextMenu({ item, onEdit, onDelete }) {
  return (
    <Menu
      trigger={
        <Button
          variant="tertiary"
          size="sm"
          leadingSlot="dots-kebab-vertical"
          aria-label="Actions"
        />
      }
      aria-label="Item actions"
      onAction={(key) => {
        if (key === 'edit') onEdit(item)
        if (key === 'delete') onDelete(item)
      }}
    >
      <MenuItem id="edit" leadingSlot="edit-pencil" label="Edit" />
      <MenuItem id="duplicate" leadingSlot="copy" label="Duplicate" />
      <MenuItem
        id="delete"
        leadingSlot="trash-empty"
        label="Delete"
        intent="destructive"
      />
    </Menu>
  )
}
```

### Dropdown Actions

```typescript
function TicketActions({ ticket }) {
  const handleAction = (key) => {
    switch (key) {
      case 'merge':
        mergeTickets(ticket)
        break
      case 'summarize':
        summarizeTicket(ticket)
        break
      case 'delete':
        deleteTicket(ticket)
        break
    }
  }

  return (
    <Menu
      trigger={<Button variant="secondary">Actions</Button>}
      aria-label="Ticket actions"
      onAction={handleAction}
    >
      <MenuItem
        id="merge"
        leadingSlot="arrow-merging"
        label="Merge tickets"
      />
      <MenuItem
        id="summarize"
        leadingSlot="ai"
        label="Summarize ticket"
        intent="ai"
      />
      <MenuItem
        id="delete"
        leadingSlot="trash-empty"
        label="Delete ticket"
        intent="destructive"
      />
    </Menu>
  )
}
```

### Nested Submenus

```typescript
<Menu aria-label="Actions">
  <MenuItem label="Edit" />
  <SubMenu label="Export">
    <MenuItem label="Export as PDF" />
    <MenuItem label="Export as CSV" />
    <SubMenu label="More Formats">
      <MenuItem label="Export as JSON" />
      <MenuItem label="Export as XML" />
    </SubMenu>
  </SubMenu>
</Menu>
```

### Status Selector

```typescript
function StatusMenu({ currentStatus, onChange }) {
  const statuses = [
    { id: 'online', label: 'Online', color: 'green' },
    { id: 'away', label: 'Away', color: 'orange' },
    { id: 'busy', label: 'Busy', color: 'red' },
    { id: 'offline', label: 'Offline', color: 'grey' },
  ]

  return (
    <Menu
      aria-label="Status"
      items={statuses}
      onAction={(key) => onChange(key)}
    >
      {(status) => (
        <MenuItem
          id={status.id}
          leadingSlot={<Dot color={status.color} />}
          label={status.label}
          trailingSlot={
            currentStatus === status.id ? 'check' : undefined
          }
        />
      )}
    </Menu>
  )
}
```

## Visual Design

Menu has:

- Elevated popover with shadow (high or mid)
- Rounded corners
- Scrollable content when maxHeight is set
- Hover states for interactive items
- Visual separators between sections
- Disabled state with reduced opacity
- Chevron icon for submenus

## Related Components

- **MenuItem**: Individual menu item
- **MenuSection**: Section grouping
- **SubMenu**: Nested menu
- **Button**: Common trigger element
- **List**: For selectable lists
- **Select**: For form dropdowns

## Testing Queries

```typescript
// Query menu trigger
screen.getByText('Open menu')
screen.getByText('Actions')  // Custom trigger text

// Open menu
await user.click(screen.getByText('Open menu'))

// Query menu items
const items = screen.getAllByRole('menuitem')
const item = screen.getByRole('menuitem', { name: 'Edit' })
expect(item).toBeInTheDocument()

// Query icons
screen.getByRole('img', { name: 'edit' })
screen.getByRole('img', { name: 'trash' })

// Check disabled
const item = screen.getByRole('menuitem', { name: 'Delete' })
expect(item).toHaveAttribute('aria-disabled', 'true')

// Check intent
expect(item).toHaveAttribute('data-intent', 'destructive')

// Check selection style
expect(item).toHaveAttribute('data-selection-style', 'neutral')

// Interact with menu items
await user.click(screen.getByRole('menuitem', { name: 'Edit' }))
expect(onAction).toHaveBeenCalledWith('edit')

// Check menu closed after action
await waitFor(() => {
  expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
})

// Keyboard navigation
await user.keyboard('{tab}')      // Focus trigger
await user.keyboard('{enter}')    // Open menu
await user.keyboard('{arrowdown}')// Navigate down
await user.keyboard('{enter}')    // Select item
await user.keyboard('{escape}')   // Close menu

// Query sections
screen.getByText('Edit Actions')
screen.getByText('Danger Zone')

// Query submenu
await user.hover(screen.getByText('More Actions'))
await waitFor(() => {
  expect(screen.getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
})
```
