# Banner

Prominent message component for notifications, alerts, or announcements with optional dismiss functionality.

## Import

```typescript
import { Banner } from '@gorgias/axiom'
```

## Props

### BannerProps

Extends `VisibilityProps`.

```typescript
type BannerProps = {
    // Layout
    variant?: BannerVariant // Display variant (default: 'inline')
    size?: BannerSize // Content size (default: 'sm')

    // Intent
    intent?: BannerIntent // Semantic intent (default: 'info')

    // Content
    icon?: IconName | ReactNode // Icon to display
    title?: string | ReactNode // Title text or element
    description?: string | ReactNode // Description text or element
    children?: ReactNode // Additional content or actions

    // Dismissal
    isClosable?: boolean // Whether banner can be dismissed (default: true)

    // Visibility (from VisibilityProps)
    isOpen?: boolean // Whether banner is visible (controlled)
    defaultOpen?: boolean // Initial visibility (uncontrolled)
    onOpenChange?: (isOpen: boolean) => void // Visibility change callback
}

// Display variants
type BannerVariant = 'inline' | 'fullWidth'

// Semantic intents
type BannerIntent = 'info' | 'success' | 'warning' | 'destructive' | 'ai'

// Content sizes
type BannerSize = 'sm' | 'md'
```

## Usage

### Basic Banner

```typescript
<Banner
  title="Welcome!"
  description="This is an informational message."
/>
```

### With Intents

```typescript
// Info (default)
<Banner
  intent="info"
  title="New Feature Available"
  description="Check out our latest update in the settings."
/>

// Success
<Banner
  intent="success"
  title="Changes Saved"
  description="Your settings have been updated successfully."
/>

// Warning
<Banner
  intent="warning"
  title="Action Required"
  description="Please verify your email address."
/>

// Destructive
<Banner
  intent="destructive"
  title="Error Occurred"
  description="Unable to process your request. Please try again."
/>

// AI
<Banner
  intent="ai"
  title="AI Suggestion"
  description="We noticed you might want to enable auto-replies."
/>
```

### With Custom Icon

```typescript
<Banner
  icon="bell"
  title="New Notification"
  description="You have 3 unread messages."
/>

<Banner
  icon={<Icon name="star" />}
  title="Premium Feature"
  description="Upgrade to access this feature."
/>
```

### With Actions

```typescript
<Banner
  title="Update Available"
  description="A new version is ready to install."
>
  <Box flexDirection="row" gap="sm">
    <Button variant="secondary" size="sm">Later</Button>
    <Button variant="primary" size="sm">Update Now</Button>
  </Box>
</Banner>
```

### Variants

```typescript
// Inline (default) - constrained width
<Banner
  variant="inline"
  title="Inline Banner"
  description="This banner has constrained width."
/>

// Full width - spans container
<Banner
  variant="fullWidth"
  title="Full Width Banner"
  description="This banner spans the full width."
/>
```

### Sizes

```typescript
<Banner
  size="sm"
  title="Small Banner"
  description="Compact content size."
/>

<Banner
  size="md"
  title="Medium Banner"
  description="Larger content size."
/>
```

### Non-Dismissable

```typescript
<Banner
  isClosable={false}
  title="Important Notice"
  description="This message cannot be dismissed."
/>
```

### Controlled Visibility

```typescript
const [isOpen, setIsOpen] = useState(true)

<Banner
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  title="Controlled Banner"
  description="This banner's visibility is controlled."
/>
```

### Uncontrolled with Default

```typescript
<Banner
  defaultOpen={true}
  title="Uncontrolled Banner"
  description="This banner starts visible and can be dismissed."
/>
```

## Common Patterns

### Notification Banner

```typescript
function NotificationBanner({ onClose }) {
  return (
    <Banner
      intent="success"
      icon="check"
      title="Successfully Updated"
      description="Your changes have been saved."
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    />
  )
}
```

### Error Banner with Retry

```typescript
function ErrorBanner({ error, onRetry }) {
  return (
    <Banner
      intent="destructive"
      title="Error"
      description={error.message}
    >
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </Banner>
  )
}
```

### Info Banner with Link

```typescript
<Banner
  intent="info"
  title="New Tutorial Available"
  description="Learn how to use our latest features."
>
  <Button as="a" href="/tutorials" variant="tertiary" size="sm">
    Watch Tutorial
  </Button>
</Banner>
```

### Persistent System Message

```typescript
<Banner
  intent="warning"
  variant="fullWidth"
  isClosable={false}
  title="Scheduled Maintenance"
  description="System will be unavailable on Saturday from 2-4 AM."
/>
```

## Dismissal Behavior

When `isClosable={true}` (default):

- Close button appears in top-right corner
- Clicking close button calls `onOpenChange(false)`
- Banner removes itself from view
- Can be controlled or uncontrolled

## Related Components

- **Modal**: For blocking, centered dialogs
- **Tooltip**: For contextual help text
- **Toast**: For temporary notifications (if available)

## Testing Queries

```typescript
// Query by data attribute
const banner = screen.getByText('Welcome!').closest('[data-name="banner"]')

// Query content
screen.getByText('Welcome!')
screen.getByText('This is an informational message.')

// Query icon
screen.getByRole('img', { name: 'bell' })

// Query close button (when isClosable=true)
const closeButton = screen.getByRole('button', { name: /close/i })

// Interact
const closeButton = screen.getByRole('button', { name: /close/i })
await user.click(closeButton)
expect(onOpenChange).toHaveBeenCalledWith(false)

// Check visibility
expect(banner).toBeInTheDocument()
expect(banner).not.toBeInTheDocument()
```
