# Breadcrumbs

Navigation component displaying the path to the current page, helping users understand their location in the site hierarchy.

## Import

```typescript
import { Breadcrumb, Breadcrumbs, Link } from '@gorgias/axiom'
```

## Props

### BreadcrumbsProps

```typescript
type BreadcrumbsProps<T extends object = object> = {
    // Content
    children?: ReactNode | ((item: T) => ReactNode) // Static breadcrumb elements or render function

    // Dynamic items
    items?: T[] // Array of breadcrumb items for dynamic rendering

    // Actions
    onAction?: (key: string | number) => void // Callback when a breadcrumb is clicked

    // State
    isDisabled?: boolean // Whether breadcrumbs are disabled

    // Accessibility
    'aria-label'?: string // Accessible label for breadcrumb navigation
}
```

### BreadcrumbProps

```typescript
type BreadcrumbProps = {
    // Content
    children?: ReactNode | ((props: BreadcrumbRenderProps) => ReactNode) // Content or render function

    // Identification
    id?: string | number // Unique identifier

    // Custom rendering
    asSlot?: boolean // Render custom content without default styling
}

type BreadcrumbRenderProps = {
    isCurrent: boolean // Whether this is the current/last breadcrumb
    isDisabled: boolean // Whether the breadcrumb is disabled
}
```

## Usage

### Basic Breadcrumbs

```typescript
<Breadcrumbs aria-label="Breadcrumb navigation">
  <Breadcrumb>
    <Link href="/">Home</Link>
  </Breadcrumb>
  <Breadcrumb>
    <Link href="/products">Products</Link>
  </Breadcrumb>
  <Breadcrumb>Product Details</Breadcrumb>
</Breadcrumbs>
```

### With Static Items

```typescript
<Breadcrumbs aria-label="Breadcrumb navigation">
  <Breadcrumb>
    <Link href="/">Dashboard</Link>
  </Breadcrumb>
  <Breadcrumb>
    <Link href="/customers">Customers</Link>
  </Breadcrumb>
  <Breadcrumb>
    <Link href="/customers/123">John Doe</Link>
  </Breadcrumb>
  <Breadcrumb>Edit Profile</Breadcrumb>
</Breadcrumbs>
```

### Dynamic Breadcrumbs with Items

```typescript
const breadcrumbItems = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'products', label: 'Products', href: '/products' },
  { id: 'details', label: 'Product Details', href: '/products/123' },
]

<Breadcrumbs
  aria-label="Breadcrumb navigation"
  items={breadcrumbItems}
>
  {(item) => (
    <Breadcrumb id={item.id}>
      {item.href ? (
        <Link href={item.href}>{item.label}</Link>
      ) : (
        item.label
      )}
    </Breadcrumb>
  )}
</Breadcrumbs>
```

### With onAction

```typescript
function NavigableBreadcrumbs() {
  const navigate = useNavigate()

  const breadcrumbItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'tickets', label: 'Tickets', path: '/tickets' },
    { id: 'ticket-123', label: 'Ticket #123', path: '/tickets/123' },
  ]

  return (
    <Breadcrumbs
      aria-label="Breadcrumb navigation"
      items={breadcrumbItems}
      onAction={(key) => {
        const item = breadcrumbItems.find((i) => i.id === key)
        if (item) navigate(item.path)
      }}
    >
      {(item) => (
        <Breadcrumb id={item.id}>
          <Link>{item.label}</Link>
        </Breadcrumb>
      )}
    </Breadcrumbs>
  )
}
```

### With Render Props

```typescript
<Breadcrumbs aria-label="Breadcrumb navigation">
  <Breadcrumb>
    {({ isCurrent }) => (
      <Link href="/" style={{ fontWeight: isCurrent ? 'bold' : 'normal' }}>
        Home
      </Link>
    )}
  </Breadcrumb>
  <Breadcrumb>
    {({ isCurrent }) => (
      <Link href="/products" style={{ fontWeight: isCurrent ? 'bold' : 'normal' }}>
        Products
      </Link>
    )}
  </Breadcrumb>
</Breadcrumbs>
```

### Custom Slot Rendering

```typescript
<Breadcrumbs aria-label="Breadcrumb navigation">
  <Breadcrumb asSlot>
    <CustomBreadcrumbComponent>Home</CustomBreadcrumbComponent>
  </Breadcrumb>
  <Breadcrumb asSlot>
    <CustomBreadcrumbComponent>Products</CustomBreadcrumbComponent>
  </Breadcrumb>
</Breadcrumbs>
```

### Disabled State

```typescript
<Breadcrumbs aria-label="Breadcrumb navigation" isDisabled>
  <Breadcrumb>
    <Link href="/">Home</Link>
  </Breadcrumb>
  <Breadcrumb>
    <Link href="/products">Products</Link>
  </Breadcrumb>
  <Breadcrumb>Details</Breadcrumb>
</Breadcrumbs>
```

## Common Patterns

### Page Hierarchy Navigation

```typescript
function PageBreadcrumbs({ path }) {
  const breadcrumbs = [
    { id: 'home', label: 'Home', href: '/' },
    ...path,
  ]

  return (
    <Breadcrumbs aria-label="Breadcrumb navigation" items={breadcrumbs}>
      {(item) => (
        <Breadcrumb id={item.id}>
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            item.label
          )}
        </Breadcrumb>
      )}
    </Breadcrumbs>
  )
}

// Usage
<PageBreadcrumbs
  path={[
    { id: 'tickets', label: 'Tickets', href: '/tickets' },
    { id: 'current', label: 'Ticket #456' },
  ]}
/>
```

### With Icons

```typescript
<Breadcrumbs aria-label="Breadcrumb navigation">
  <Breadcrumb>
    <Link href="/">
      <Box flexDirection="row" gap="xs" alignItems="center">
        <Icon name="nav-home" size="sm" />
        <Text>Home</Text>
      </Box>
    </Link>
  </Breadcrumb>
  <Breadcrumb>
    <Link href="/settings">
      <Box flexDirection="row" gap="xs" alignItems="center">
        <Icon name="settings" size="sm" />
        <Text>Settings</Text>
      </Box>
    </Link>
  </Breadcrumb>
  <Breadcrumb>Account</Breadcrumb>
</Breadcrumbs>
```

### File System Navigation

```typescript
function FileBreadcrumbs({ path }) {
  const parts = path.split('/').filter(Boolean)

  const breadcrumbs = [
    { id: 'root', label: 'Root', path: '/' },
    ...parts.map((part, index) => ({
      id: part,
      label: part,
      path: '/' + parts.slice(0, index + 1).join('/'),
    })),
  ]

  return (
    <Breadcrumbs
      aria-label="File path"
      items={breadcrumbs}
      onAction={(key) => {
        const item = breadcrumbs.find((b) => b.id === key)
        if (item) navigateToPath(item.path)
      }}
    >
      {(item) => (
        <Breadcrumb id={item.id}>
          <Link>{item.label}</Link>
        </Breadcrumb>
      )}
    </Breadcrumbs>
  )
}

// Usage
<FileBreadcrumbs path="/documents/reports/2024/january" />
```

### Multi-Level Navigation

```typescript
function MultiLevelBreadcrumbs() {
  const location = useLocation()
  const navigate = useNavigate()

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)

    return [
      { id: 'home', label: 'Home', path: '/' },
      ...paths.map((segment, index) => ({
        id: segment,
        label: formatSegment(segment),
        path: '/' + paths.slice(0, index + 1).join('/'),
      })),
    ]
  }

  return (
    <Breadcrumbs
      aria-label="Breadcrumb navigation"
      items={getBreadcrumbs()}
      onAction={(key) => {
        const breadcrumbs = getBreadcrumbs()
        const item = breadcrumbs.find((b) => b.id === key)
        if (item) navigate(item.path)
      }}
    >
      {(item) => (
        <Breadcrumb id={item.id}>
          <Link>{item.label}</Link>
        </Breadcrumb>
      )}
    </Breadcrumbs>
  )
}
```

### With Dropdown for Long Paths

```typescript
function CollapsibleBreadcrumbs({ items }) {
  const maxVisible = 3

  if (items.length <= maxVisible) {
    return (
      <Breadcrumbs aria-label="Breadcrumb navigation" items={items}>
        {(item) => (
          <Breadcrumb id={item.id}>
            <Link href={item.href}>{item.label}</Link>
          </Breadcrumb>
        )}
      </Breadcrumbs>
    )
  }

  const first = items[0]
  const hidden = items.slice(1, -1)
  const last = items[items.length - 1]

  return (
    <Breadcrumbs aria-label="Breadcrumb navigation">
      <Breadcrumb>
        <Link href={first.href}>{first.label}</Link>
      </Breadcrumb>
      <Breadcrumb>
        <Menu
          trigger={<Button variant="tertiary" size="sm">...</Button>}
          aria-label="More breadcrumbs"
        >
          {hidden.map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              label={item.label}
              onAction={() => navigate(item.href)}
            />
          ))}
        </Menu>
      </Breadcrumb>
      <Breadcrumb>
        <Link href={last.href}>{last.label}</Link>
      </Breadcrumb>
    </Breadcrumbs>
  )
}
```

### Breadcrumbs with Loading State

```typescript
function LoadingBreadcrumbs({ path, isLoading }) {
  if (isLoading) {
    return (
      <Box flexDirection="row" gap="sm" alignItems="center">
        <Skeleton width={60} height={16} />
        <Icon name="arrow-chevron-right" size="sm" />
        <Skeleton width={80} height={16} />
        <Icon name="arrow-chevron-right" size="sm" />
        <Skeleton width={100} height={16} />
      </Box>
    )
  }

  return (
    <Breadcrumbs aria-label="Breadcrumb navigation" items={path}>
      {(item) => (
        <Breadcrumb id={item.id}>
          <Link href={item.href}>{item.label}</Link>
        </Breadcrumb>
      )}
    </Breadcrumbs>
  )
}
```

## Visual Design

Breadcrumbs has:

- Horizontal layout with inline items
- Chevron right icon separators between items
- Last item (current page) styled with medium weight
- Non-current items styled with regular weight
- Interactive items have hover states
- Compact spacing between items
- Small typography (sm/md sizes)

## Related Components

- **Breadcrumb**: Individual breadcrumb item
- **Link**: For navigable breadcrumb items
- **Tabs**: Alternative navigation pattern
- **Button**: For custom breadcrumb triggers

## Testing Queries

```typescript
// Query breadcrumbs container
const breadcrumbs = screen.getByRole('navigation', {
    name: 'Breadcrumb navigation',
})
expect(breadcrumbs).toBeInTheDocument()

// Query breadcrumb list
const list = screen.getByRole('list')
expect(list).toBeInTheDocument()

// Query breadcrumb items
const items = screen.getAllByRole('listitem')
expect(items).toHaveLength(3)

// Query specific breadcrumb
screen.getByText('Home')
screen.getByText('Products')
screen.getByText('Product Details')

// Query links within breadcrumbs
const homeLink = screen.getByRole('link', { name: 'Home' })
expect(homeLink).toHaveAttribute('href', '/')

const productsLink = screen.getByRole('link', { name: 'Products' })
expect(productsLink).toHaveAttribute('href', '/products')

// Check current breadcrumb (should not be a link)
const current = screen.getByText('Product Details')
expect(current.tagName).not.toBe('A')

// Query chevron separators
const chevrons = screen.getAllByRole('img', { name: 'arrow-chevron-right' })
expect(chevrons).toHaveLength(2) // n-1 separators

// Interact with breadcrumbs
await user.click(homeLink)
expect(onAction).toHaveBeenCalledWith('home')

// Check disabled state
expect(breadcrumbs).toHaveAttribute('aria-disabled', 'true')
```
