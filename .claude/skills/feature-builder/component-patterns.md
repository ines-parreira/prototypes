# Component Patterns

## Use @gorgias/axiom Components - MANDATORY

Always use Axiom components instead of custom implementations. This ensures consistency, accessibility, and maintainability.

### Import Pattern

```tsx
// ✅ Correct - Import from @gorgias/axiom
import { Button, Box, Heading, Text, Skeleton, Banner, Icon } from '@gorgias/axiom'
import { TextField, NumberField, SelectField, CheckBoxField, ToggleField } from '@gorgias/axiom'
import { Modal, SidePanel } from '@gorgias/axiom'
import { Tooltip, TooltipContent } from '@gorgias/axiom'

// ❌ Avoid - Legacy imports in new code
import { LegacyButton as Button } from '@gorgias/axiom'
```

## Component Reference

### Button

```tsx
import { Button } from '@gorgias/axiom'

// Standard button
<Button onClick={handleClick}>Save</Button>

// With variants and intent
<Button variant="primary" intent="regular">Primary</Button>
<Button variant="secondary" intent="regular">Secondary</Button>
<Button variant="tertiary" intent="regular">Tertiary</Button>
<Button variant="primary" intent="destructive">Delete</Button>
<Button variant="primary" intent="ai">AI Action</Button>

// With size
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>

// With loading/disabled states
<Button isLoading>Saving...</Button>
<Button isDisabled>Disabled</Button>

// With icons
<Button leadingSlot="plus">Add Item</Button>
<Button trailingSlot="arrow-right">Next</Button>
<Button icon={<Icon name="close" />} aria-label="Close" />

// As link
<Button as="a" href="/page">Link Button</Button>
```

**Button Props:**
- `variant`: `'primary'` | `'secondary'` | `'tertiary'`
- `intent`: `'regular'` | `'destructive'` | `'ai'`
- `size`: `'sm'` | `'md'`
- `isLoading`: boolean
- `isDisabled`: boolean
- `leadingSlot`: IconName | ReactNode
- `trailingSlot`: IconName | ReactNode
- `icon`: ReactNode (for icon-only buttons)
- `as`: `'button'` | `'a'`

### Box (Layout Container)

```tsx
import { Box } from '@gorgias/axiom'

// Flexbox layout
<Box flexDirection="column" gap="md" padding="lg">
    {children}
</Box>

// Row with spacing
<Box flexDirection="row" justifyContent="space-between" alignItems="center" gap="sm">
    <Text>Label</Text>
    <Button>Action</Button>
</Box>

// With specific dimensions
<Box width="300px" height="200px" padding="md">
    Content
</Box>
```

**Box Props:**
- Flex: `flexDirection`, `gap`, `columnGap`, `rowGap`, `justifyContent`, `alignItems`, `alignSelf`, `flexWrap`, `flexGrow`, `flexShrink`, `flexBasis`, `flex`
- Spacing: `padding` | `p`, `margin` | `m`, `pt`, `pb`, `pl`, `pr`, `mt`, `mb`, `ml`, `mr`
- Sizing: `width` | `w`, `height` | `h`, `maxWidth`, `maxHeight`, `minWidth`, `minHeight`
- All spacing/sizing values accept: Size tokens (`'xs'`, `'sm'`, `'md'`, `'lg'`) | number (px) | CSS strings

### Text

```tsx
import { Text } from '@gorgias/axiom'

// Basic usage
<Text>Regular text content</Text>

// With variants
<Text variant="bold">Bold text</Text>
<Text variant="medium">Medium weight</Text>
<Text variant="italic">Italic text</Text>

// With sizes
<Text size="xs">Extra small</Text>
<Text size="sm">Small</Text>
<Text size="md">Medium (default)</Text>

// With alignment
<Text align="center">Centered text</Text>

// As paragraph
<Text as="p">This renders as a paragraph element</Text>

// With overflow handling
<Text overflow="ellipsis">Long text that will be truncated...</Text>
```

**Text Props:**
- `variant`: `'regular'` | `'bold'` | `'medium'` | `'italic'`
- `size`: `'xs'` | `'sm'` | `'md'`
- `align`: `'left'` | `'start'` | `'center'` | `'justify'` | `'right'` | `'end'`
- `as`: `'span'` (default) | `'p'`
- `overflow`: `'ellipsis'`
- `wrap`: `'wrap'` | `'nowrap'` | `'balance'` | `'pretty'`

### Heading

```tsx
import { Heading } from '@gorgias/axiom'

// Sizes map to semantic heading elements
<Heading size="xl">Page Title (h1)</Heading>
<Heading size="lg">Section Title (h2)</Heading>
<Heading size="md">Subsection (h3)</Heading>
<Heading size="sm">Small Heading (h4)</Heading>

// With overflow
<Heading size="lg" overflow="ellipsis">Long title that truncates...</Heading>
```

**Heading Props:**
- `size`: `'sm'` (h4) | `'md'` (h3, default) | `'lg'` (h2) | `'xl'` (h1)
- `overflow`: `'ellipsis'`

### Banner (Error/Info Messages)

```tsx
import { Banner } from '@gorgias/axiom'

// Different intents
<Banner intent="info" title="Information" description="Here's some helpful info" />
<Banner intent="success" title="Success" description="Operation completed" />
<Banner intent="warning" title="Warning" description="Please review this" />
<Banner intent="destructive" title="Error" description="Something went wrong" />
<Banner intent="ai" title="AI Suggestion" description="Based on your data..." />

// With custom icon
<Banner intent="info" icon="lightbulb" title="Tip" />

// Closable banner
<Banner intent="info" title="Notice" isClosable />

// Inline vs full width
<Banner variant="inline" intent="warning" title="Inline warning" />
<Banner variant="fullWidth" intent="info" title="Full width banner" />
```

**Banner Props:**
- `intent`: `'info'` | `'success'` | `'warning'` | `'destructive'` | `'ai'`
- `variant`: `'inline'` | `'fullWidth'`
- `size`: `'sm'` | `'md'`
- `title`: string | ReactNode
- `description`: string | ReactNode
- `icon`: IconName | ReactNode
- `isClosable`: boolean
- `isOpen`, `defaultOpen`, `onOpenChange`: visibility control

### Icon

```tsx
import { Icon } from '@gorgias/axiom'

// Basic usage
<Icon name="check" />
<Icon name="close" />
<Icon name="arrow-right" />

// With size
<Icon name="settings" size="xs" />
<Icon name="settings" size="sm" />
<Icon name="settings" size="md" />
<Icon name="settings" size="lg" />

// With intent
<Icon name="sparkle" intent="ai" />

// With custom color
<Icon name="star" color="var(--content-accent-default)" />
```

**Icon Props:**
- `name`: IconName (see Axiom icon library)
- `size`: `'xs'` | `'sm'` | `'md'` | `'lg'`
- `intent`: `'regular'` | `'ai'`
- `color`: Color | CSS variable | hex
- `alt`: string (accessibility)

### Skeleton (Loading State)

```tsx
import { Skeleton } from '@gorgias/axiom'

// Basic usage
<Skeleton />

// With dimensions
<Skeleton width={200} height={20} />

// Multiple lines
<Skeleton count={3} />

// Circle
<Skeleton circle width={40} height={40} />
```

### Tooltip

```tsx
import { Tooltip, TooltipContent } from '@gorgias/axiom'

// Basic usage with trigger prop
<Tooltip trigger={<Button>Hover me</Button>}>
    <TooltipContent title="Helpful information" />
</Tooltip>

// With custom trigger element
<Tooltip trigger={<span role="button">Custom trigger</span>}>
    <TooltipContent title="Tooltip content" />
</Tooltip>

// With render function trigger (receives { isOpen, isDisabled })
<Tooltip trigger={({ isOpen }) => (
    <Button variant={isOpen ? 'primary' : 'secondary'}>Hover me</Button>
)}>
    <TooltipContent title="Tooltip content" />
</Tooltip>

// Structured content
<Tooltip trigger={<Button>Help</Button>}>
    <TooltipContent
        title="Keyboard Shortcut"
        caption="Quick action"
        shortcut="⌘K"
    />
</Tooltip>

// With placement
<Tooltip placement="bottom" trigger={<Button>Below</Button>}>
    <TooltipContent title="Appears below" />
</Tooltip>

// Controlled
const [isOpen, setIsOpen] = useState(false)
<Tooltip isOpen={isOpen} onOpenChange={setIsOpen} trigger={
    <Button onClick={() => setIsOpen(!isOpen)}>Click me</Button>
}>
    <TooltipContent title="Click-triggered" />
</Tooltip>
```

**Tooltip Props:**
- `placement`: `'top'` | `'bottom'` | `'left'` | `'right'` | `'top left'` | `'top right'` | `'bottom left'` | `'bottom right'`
- `delay`: number (default: 1000ms)
- `closeDelay`: number (default: 333ms)
- `isOpen`, `defaultOpen`, `onOpenChange`: visibility control
- `isDisabled`: boolean

**TooltipContent Props:**
- Structured: `title` (required), `caption`, `shortcut`, `link`
- OR Unstructured: `children`
- `maxWidth`: number

## Basic Component Structure

```tsx
import { type FC } from 'react'

import { Banner, Box, Button, Heading, Skeleton, Text } from '@gorgias/axiom'
import { useGetTicket } from '@gorgias/helpdesk-queries'

import styles from './TicketCard.module.less'

interface TicketCardProps {
    ticketId: number
}

export const TicketCard: FC<TicketCardProps> = ({ ticketId }) => {
    const { data: ticket, isLoading, isError, error } = useGetTicket(ticketId)

    if (isLoading) {
        return (
            <Box flexDirection="column" gap="sm" className={styles.container}>
                <Skeleton width={200} height={24} />
                <Skeleton count={2} />
            </Box>
        )
    }

    if (isError) {
        return (
            <Banner
                intent="destructive"
                title="Error loading ticket"
                description={error.message}
            />
        )
    }

    return (
        <Box flexDirection="column" gap="md" className={styles.container}>
            <Heading size="md">{ticket.subject}</Heading>
            <Text>{ticket.description}</Text>
            <Box flexDirection="row" gap="sm">
                <Button variant="primary">Reply</Button>
                <Button variant="secondary">Close</Button>
            </Box>
        </Box>
    )
}
```

## Styling with CSS Modules

Create `ComponentName.module.less`:

```less
.container {
    padding: var(--spacing-lg);
    background-color: var(--surface-neutral-primary);
    border: 1px solid var(--border-neutral-default);
    border-radius: var(--radius-md);
}

.title {
    color: var(--content-neutral-default);
}

.subtitle {
    color: var(--content-neutral-secondary);
}
```

### Design Token Reference

**Spacing:** `--spacing-xxxxs` | `--spacing-xxxs` | `--spacing-xxs` | `--spacing-xs` | `--spacing-sm` | `--spacing-md` | `--spacing-lg`

**Colors:**
- Content: `--content-neutral-default`, `--content-neutral-secondary`, `--content-accent-default`
- Surface: `--surface-neutral-primary`, `--surface-neutral-secondary`
- Border: `--border-neutral-default`

## Accessibility Requirements

- Axiom components have built-in accessibility
- Add `aria-label` for icon-only buttons
- Ensure form inputs have labels (use Field components)
- Provide meaningful `alt` text for images

```tsx
// Icon button with aria-label
<Button icon={<Icon name="close" />} aria-label="Close dialog" onClick={onClose} />

// Image with alt text
<img src={avatarUrl} alt="User avatar" />
```

## Do NOT

- Create custom buttons, inputs, or other UI primitives - use Axiom
- Add `data-testid` attributes - use accessible selectors in tests
- Create inline styles - use CSS modules with design tokens
- Use `any` type - define proper TypeScript interfaces
- Put business logic in components - extract to hooks
- Add comments for obvious code
- Use Legacy Axiom components in new code
