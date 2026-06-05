# ButtonGroup

Component for grouping buttons into a single-selection radio group with connected styling.

## Import

```typescript
import { ButtonGroup, ButtonGroupItem } from '@gorgias/axiom'
```

## Props

### ButtonGroupProps

```typescript
type ButtonGroupProps = {
    children: ReactNode // ButtonGroupItem elements
    defaultSelectedKey?: string // Initial selected button key (uncontrolled)
    selectedKey?: string // Current selected button key (controlled)
    onSelectionChange?: (selectedKey: string) => void // Selection change callback
    isDisabled?: boolean // Disable entire button group
}
```

### ButtonGroupItemProps

```typescript
type ButtonGroupItemProps = {
    id: string // Unique identifier (required)
    children: ReactNode // Button label
    leadingSlot?: IconName | ReactNode // Icon before text
    trailingSlot?: IconName | ReactNode // Icon after text
    icon?: ReactNode // Icon-only button
    isDisabled?: boolean // Disable this button
}
```

## Usage

### Basic ButtonGroup

```typescript
<ButtonGroup>
  <ButtonGroupItem id="button-1">Button 1</ButtonGroupItem>
  <ButtonGroupItem id="button-2">Button 2</ButtonGroupItem>
  <ButtonGroupItem id="button-3">Button 3</ButtonGroupItem>
</ButtonGroup>
```

### Uncontrolled (with default selection)

```typescript
<ButtonGroup defaultSelectedKey="button-2">
  <ButtonGroupItem id="button-1">Option 1</ButtonGroupItem>
  <ButtonGroupItem id="button-2">Option 2</ButtonGroupItem>
  <ButtonGroupItem id="button-3">Option 3</ButtonGroupItem>
</ButtonGroup>
```

### Controlled

```typescript
const [selectedKey, setSelectedKey] = useState('button-1')

<ButtonGroup
  selectedKey={selectedKey}
  onSelectionChange={setSelectedKey}
>
  <ButtonGroupItem id="button-1">Option 1</ButtonGroupItem>
  <ButtonGroupItem id="button-2">Option 2</ButtonGroupItem>
  <ButtonGroupItem id="button-3">Option 3</ButtonGroupItem>
</ButtonGroup>
```

### With Icons

```typescript
// Leading icons
<ButtonGroup>
  <ButtonGroupItem id="list" leadingSlot="list-unordered">
    List View
  </ButtonGroupItem>
  <ButtonGroupItem id="grid" leadingSlot="menu-more-grid">
    Grid View
  </ButtonGroupItem>
</ButtonGroup>

// Trailing icons
<ButtonGroup>
  <ButtonGroupItem id="asc" trailingSlot="arrow-up">
    Ascending
  </ButtonGroupItem>
  <ButtonGroupItem id="desc" trailingSlot="arrow-down">
    Descending
  </ButtonGroupItem>
</ButtonGroup>

// Icon-only buttons
<ButtonGroup>
  <ButtonGroupItem id="left" icon="align-left">
    Align Left
  </ButtonGroupItem>
  <ButtonGroupItem id="center" icon="align-center">
    Align Center
  </ButtonGroupItem>
  <ButtonGroupItem id="right" icon="align-right">
    Align Right
  </ButtonGroupItem>
</ButtonGroup>
```

### With Separator

```typescript
<ButtonGroup>
  <ButtonGroupItem id="button-1">Option 1</ButtonGroupItem>
  <Separator direction="vertical" />
  <ButtonGroupItem id="button-2">Option 2</ButtonGroupItem>
  <ButtonGroupItem id="button-3">Option 3</ButtonGroupItem>
</ButtonGroup>
```

### Disabled State

```typescript
// Disable entire group
<ButtonGroup isDisabled>
  <ButtonGroupItem id="button-1">Button 1</ButtonGroupItem>
  <ButtonGroupItem id="button-2">Button 2</ButtonGroupItem>
</ButtonGroup>

// Disable individual button
<ButtonGroup>
  <ButtonGroupItem id="button-1" isDisabled>
    Disabled
  </ButtonGroupItem>
  <ButtonGroupItem id="button-2">Enabled</ButtonGroupItem>
</ButtonGroup>
```

### Selection Change Handler

```typescript
<ButtonGroup
  onSelectionChange={(key) => {
    console.log('Selected:', key)
  }}
>
  <ButtonGroupItem id="view-1">View 1</ButtonGroupItem>
  <ButtonGroupItem id="view-2">View 2</ButtonGroupItem>
</ButtonGroup>
```

## Behavior

- **Single selection**: Only one button can be selected at a time (radio group behavior)
- **Disallow empty selection**: One button must always be selected
- **Keyboard navigation**: Arrow keys navigate between buttons, Enter/Space selects
- **Connected styling**: Buttons have shared borders for cohesive appearance

## Related Components

- **Button**: Individual button component
- **MultiButton**: Grouped buttons without selection behavior
- **RadioGroup**: Form control for radio button groups

## Testing Queries

```typescript
// Query buttons by role (buttons render as radio buttons)
screen.getByRole('radio', { name: 'Button 1' })
screen.getByRole('radio', { name: 'Button 2' })

// Query radiogroup
screen.getByRole('radiogroup')

// Check selected state
const button = screen.getByRole('radio', { name: 'Button 2' })
expect(button).toHaveAttribute('aria-checked', 'true')

// Check disabled state
expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true')
expect(screen.getByRole('radio', { name: 'Button 1' })).toHaveAttribute(
    'data-disabled',
    'true',
)

// Click button
await user.click(screen.getByRole('radio', { name: 'Button 2' }))

// Keyboard navigation
await user.keyboard('{Tab}')
await user.keyboard('{ArrowRight}')
await user.keyboard('{Enter}')

// Query icons in buttons
screen.getByRole('img', { name: 'settings' })
```
