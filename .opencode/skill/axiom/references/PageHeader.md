# PageHeader

Layout component for page headers with title, caption, back navigation, and action buttons.

## Import

```typescript
import { PageHeader } from '@gorgias/axiom'
```

## Props

### PageHeaderProps

Extends `FlexProps` and `LayoutProps` from Box.

```typescript
type PageHeaderProps = FlexProps &
    LayoutProps & {
        title: string | ReactNode // Page title (required)
        caption?: string | ReactNode // Optional caption inline with title
        backLink?: string // Optional back link href (renders as anchor button)
        children?: ReactNode // Optional action buttons/controls (flexed to right)
    }
```

## Usage

### Basic PageHeader

```typescript
<PageHeader title="Page Title" />
```

### With Caption

```typescript
<PageHeader
  title="Page Title"
  caption="Optional caption text"
/>
```

### With Back Link

```typescript
<PageHeader
  title="Page Title"
  caption="Optional caption"
  backLink="/previous-page"
/>
```

### With Actions

```typescript
// Single action
<PageHeader title="Page Title" caption="Optional caption">
  <Button>Primary Action</Button>
</PageHeader>

// Multiple actions
<PageHeader title="Page Title" caption="Optional caption">
  <Button variant="secondary">Secondary</Button>
  <Button>Primary</Button>
</PageHeader>
```

### With Search Field

```typescript
<PageHeader title="Users" caption="Manage team members">
  <TextField
    placeholder="Search users..."
    leadingSlot="search-magnifying-glass"
  />
  <Button>Add User</Button>
</PageHeader>
```

### Complete Example

```typescript
<PageHeader
  title="Project Settings"
  caption="Configure your project"
  backLink="/projects"
>
  <Button variant="secondary">Cancel</Button>
  <Button>Save Changes</Button>
</PageHeader>
```

### Custom Title/Caption as ReactNode

```typescript
// Custom title
<PageHeader
  title={<div><Icon name="settings" /> Settings</div>}
/>

// Custom caption
<PageHeader
  title="Analytics"
  caption={<a href="/help">View your statistics</a>}
/>
```

### With Box Props

```typescript
// Custom padding
<PageHeader title="Dashboard" p="md" />

// Custom styling
<PageHeader
  title="Reports"
  w="100%"
  maxWidth={1200}
  m="auto"
/>
```

## Layout Structure

PageHeader uses a flex layout with two main sections:

1. **Left section** (flex: 1):

    - Back link button (if provided)
    - Title (string renders as Heading size="xl")
    - Caption (string renders as Text)

2. **Right section** (gap: "xs"):
    - Action buttons/controls (children)

## Related Components

- **Heading**: Used for rendering string titles
- **Text**: Used for rendering string captions
- **Button**: Typically used for actions and back link
- **Box**: Base layout component that PageHeader extends

## Testing Queries

```typescript
// Query by title heading
screen.getByRole('heading', { name: 'Page Title' })

// Query by caption text
screen.getByText('Optional caption')

// Query back link
screen.getByRole('link', { name: /arrow-left/i })

// Query action buttons
screen.getByRole('button', { name: 'Primary Action' })

// With custom title ReactNode
screen.getByTestId('custom-title')
```
