# Disclosure

Collapsible content sections. Supports standalone or grouped accordion behavior.

## Import

```typescript
import { Disclosure, DisclosureHeader, DisclosurePanel, DisclosureGroup } from '@gorgias/axiom'
```

## Props

### DisclosureProps

```typescript
type DisclosureProps = {
    children: ReactNode
    defaultExpanded?: boolean
    isExpanded?: boolean
    onExpandedChange?: (isExpanded: boolean) => void
    isDisabled?: boolean
    id?: Key
} & LayoutProps & FlexProps
```

### DisclosureHeaderProps

```typescript
type DisclosureHeaderRenderProps = {
    isExpanded: boolean
}

type DisclosureHeaderProps = {
    title: string | SlotProp<DisclosureHeaderRenderProps>
    leadingSlot?: SlotProp<DisclosureHeaderRenderProps>
    /**
     * An icon, custom element, or render function displayed after the title.
     * When omitted, an animated chevron indicating expanded state is shown.
     * Pass `null` to hide the trailing slot entirely.
     */
    trailingSlot?: SlotProp<DisclosureHeaderRenderProps> | null
} & LayoutProps & FlexProps
```

### DisclosurePanelProps

```typescript
type DisclosurePanelProps = {
    children: ReactNode
} & LayoutProps & FlexProps
```

### DisclosureGroupProps

```typescript
type DisclosureGroupProps = {
    children: ReactNode
    defaultExpandedKeys?: Iterable<Key>
    expandedKeys?: Iterable<Key>
    onExpandedChange?: (keys: Set<Key>) => void
    allowsMultipleExpanded?: boolean // default: false (accordion)
    isDisabled?: boolean
} & LayoutProps & FlexProps
```

## Usage

### Basic

```typescript
<Disclosure defaultExpanded>
    <DisclosureHeader title="System Requirements" />
    <DisclosurePanel>Details here.</DisclosurePanel>
</Disclosure>
```

### With Leading Icon

```typescript
<Disclosure>
    <DisclosureHeader title="Settings" leadingSlot="settings" />
    <DisclosurePanel>Settings content</DisclosurePanel>
</Disclosure>
```

### With Trailing Icon

```typescript
<Disclosure>
    <DisclosureHeader title="Settings" trailingSlot="info" />
    <DisclosurePanel>Settings content</DisclosurePanel>
</Disclosure>
```

### With Trailing Render Function

```typescript
<Disclosure>
    <DisclosureHeader
        title="Settings"
        trailingSlot={({ isExpanded }) => (
            <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size="md" />
        )}
    />
    <DisclosurePanel>Settings content</DisclosurePanel>
</Disclosure>
```

### With Custom Title Content

```typescript
<Disclosure>
    <DisclosureHeader
        title={({ isExpanded }) => (
            <Box flexDirection="row" gap="xs" alignItems="center">
                <Heading size="md">{isExpanded ? 'Collapse' : 'Expand'} Details</Heading>
            </Box>
        )}
    />
    <DisclosurePanel>Details content</DisclosurePanel>
</Disclosure>
```

### Without Trailing Slot

```typescript
<Disclosure>
    <DisclosureHeader title="No chevron" trailingSlot={null} />
    <DisclosurePanel>Content without chevron indicator</DisclosurePanel>
</Disclosure>
```

### Accordion Group

```typescript
<DisclosureGroup>
    <Disclosure id="personal">
        <DisclosureHeader title="Personal Information" />
        <DisclosurePanel>Name, email fields.</DisclosurePanel>
    </Disclosure>
    <Disclosure id="billing">
        <DisclosureHeader title="Billing Address" />
        <DisclosurePanel>Address fields.</DisclosurePanel>
    </Disclosure>
</DisclosureGroup>
```

### Multiple Expanded

```typescript
<DisclosureGroup allowsMultipleExpanded>
    <Disclosure id="faq1">
        <DisclosureHeader title="Return policy?" />
        <DisclosurePanel>Return within 30 days.</DisclosurePanel>
    </Disclosure>
    <Disclosure id="faq2">
        <DisclosureHeader title="Track my order?" />
        <DisclosurePanel>You'll receive a tracking number.</DisclosurePanel>
    </Disclosure>
</DisclosureGroup>
```

## Testing Queries

```typescript
screen.getByRole('button', { name: 'System Requirements' })
expect(trigger).toHaveAttribute('aria-expanded', 'true')
container.querySelector('[data-name="disclosure"]')
container.querySelector('[data-name="disclosure-header"]')
container.querySelector('[data-name="disclosure-panel"]')
container.querySelector('[data-name="disclosure-group"]')
```
