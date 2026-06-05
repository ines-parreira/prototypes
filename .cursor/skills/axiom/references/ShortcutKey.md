# ShortcutKey

Visual indicator for displaying keyboard shortcuts in a styled badge format.

## Import

```typescript
import { ShortcutKey } from '@gorgias/axiom'
```

## Props

### ShortcutKeyProps

```typescript
type ShortcutKeyProps = {
    children: ReactNode // The keyboard key or combination to display
}
```

## Usage

### Single Keys

```typescript
// Command key
<ShortcutKey>⌘</ShortcutKey>

// Control key
<ShortcutKey>Ctrl</ShortcutKey>

// Alt/Option key
<ShortcutKey>Alt</ShortcutKey>

// Shift key
<ShortcutKey>Shift</ShortcutKey>

// Letter keys
<ShortcutKey>K</ShortcutKey>
<ShortcutKey>C</ShortcutKey>
<ShortcutKey>V</ShortcutKey>

// Special keys
<ShortcutKey>Enter</ShortcutKey>
<ShortcutKey>Esc</ShortcutKey>
<ShortcutKey>Tab</ShortcutKey>
<ShortcutKey>Delete</ShortcutKey>
```

### Key Combinations

```typescript
// With plus separator
<ShortcutKey>⌘K</ShortcutKey>
<ShortcutKey>Ctrl+C</ShortcutKey>
<ShortcutKey>Alt+Shift+T</ShortcutKey>

// Multiple keys displayed together
<Box flexDirection="row" gap="xs">
  <ShortcutKey>⌘</ShortcutKey>
  <ShortcutKey>K</ShortcutKey>
</Box>

<Box flexDirection="row" gap="xs">
  <ShortcutKey>Ctrl</ShortcutKey>
  <Text>+</Text>
  <ShortcutKey>Shift</ShortcutKey>
  <Text>+</Text>
  <ShortcutKey>P</ShortcutKey>
</Box>
```

### Platform-Specific Shortcuts

```typescript
// macOS
<ShortcutKey>⌘K</ShortcutKey>
<ShortcutKey>⌥⌘I</ShortcutKey>

// Windows/Linux
<ShortcutKey>Ctrl+K</ShortcutKey>
<ShortcutKey>Alt+Ctrl+I</ShortcutKey>

// Cross-platform display
function PlatformShortcut({ mac, windows }) {
  const isMac = navigator.platform.includes('Mac')
  return <ShortcutKey>{isMac ? mac : windows}</ShortcutKey>
}

<PlatformShortcut mac="⌘K" windows="Ctrl+K" />
```

## Common Patterns

### In Menu Items

```typescript
<Box
  flexDirection="row"
  justifyContent="space-between"
  alignItems="center"
  p="sm"
>
  <Text>Search</Text>
  <ShortcutKey>⌘K</ShortcutKey>
</Box>
```

### In Tooltips

```typescript
<Tooltip
  label={
    <Box flexDirection="row" gap="xs" alignItems="center">
      <Text>Quick Search</Text>
      <ShortcutKey>⌘K</ShortcutKey>
    </Box>
  }
>
  <Button leadingSlot="search">Search</Button>
</Tooltip>
```

### In Keyboard Shortcuts Help

```typescript
function ShortcutsList() {
  const shortcuts = [
    { action: 'Search', keys: '⌘K' },
    { action: 'New Item', keys: '⌘N' },
    { action: 'Save', keys: '⌘S' },
    { action: 'Copy', keys: '⌘C' },
    { action: 'Paste', keys: '⌘V' },
  ]

  return (
    <Box flexDirection="column" gap="sm">
      {shortcuts.map((shortcut) => (
        <Box
          key={shortcut.action}
          flexDirection="row"
          justifyContent="space-between"
        >
          <Text>{shortcut.action}</Text>
          <ShortcutKey>{shortcut.keys}</ShortcutKey>
        </Box>
      ))}
    </Box>
  )
}
```

### With ListItem

```typescript
<ListItem
  label="Open Command Palette"
  trailingSlot={<ShortcutKey>⌘K</ShortcutKey>}
/>

<ListItem
  label="Toggle Sidebar"
  trailingSlot={<ShortcutKey>⌘B</ShortcutKey>}
/>
```

### Grouped Shortcuts

```typescript
function ShortcutGroup({ title, shortcuts }) {
  return (
    <Box flexDirection="column" gap="md">
      <Heading size="sm">{title}</Heading>
      <Box flexDirection="column" gap="sm">
        {shortcuts.map(({ label, keys }) => (
          <Box
            key={label}
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text size="sm">{label}</Text>
            <Box flexDirection="row" gap="xs">
              {keys.map((key, index) => (
                <ShortcutKey key={index}>{key}</ShortcutKey>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// Usage
<ShortcutGroup
  title="Navigation"
  shortcuts={[
    { label: 'Go to Dashboard', keys: ['G', 'D'] },
    { label: 'Go to Settings', keys: ['G', 'S'] },
    { label: 'Go to Help', keys: ['G', 'H'] },
  ]}
/>
```

### Sequential Keys

```typescript
// Vim-style or sequential shortcuts
<Box flexDirection="row" gap="xs" alignItems="center">
  <Text size="sm">Navigate to inbox:</Text>
  <ShortcutKey>G</ShortcutKey>
  <Text size="sm">then</Text>
  <ShortcutKey>I</ShortcutKey>
</Box>
```

## Visual Design

ShortcutKey has:

- Small badge-like appearance
- Rounded corners with subtle border
- Bold, extra-small text for readability
- Neutral background matching keyboard key aesthetic
- Consistent sizing for uniform display

## Symbol Mapping

Common keyboard symbols:

- `⌘` - Command (macOS)
- `⌥` - Option/Alt (macOS)
- `⌃` - Control (macOS)
- `⇧` - Shift
- `⏎` - Enter/Return
- `⌫` - Delete/Backspace
- `⎋` - Escape
- `⇥` - Tab
- `␣` - Space
- `↑` `↓` `←` `→` - Arrow keys

## Related Components

- **Text**: For descriptive labels
- **Tooltip**: Often contains shortcuts as hints
- **Menu**: Frequently displays shortcuts for menu actions
- **ListItem**: Can show shortcuts in trailing slot

## Testing Queries

```typescript
// Query by text content
screen.getByText('⌘')
screen.getByText('Ctrl')
screen.getByText('⌘K')

// Query by wrapper
const shortcut = container.querySelector('[data-name="shortcut-key"]')
expect(shortcut).toBeInTheDocument()

// Check wrapper class
const shortcut = screen.getByText('⌘').closest('div')
expect(shortcut?.className).toContain('wrapper')
```
