# AxiomProvider

Root provider component that configures portal rendering for Axiom components.

## Import

```typescript
import { AxiomProvider, useAxiomContext } from '@gorgias/axiom'
```

## Props

### AxiomProviderProps

```typescript
type AxiomProviderProps = {
    rootNode: HTMLElement | null // Portal container element
    children: ReactNode // App content
}
```

## Usage

### Basic Setup

```typescript
import { AxiomProvider } from '@gorgias/axiom'

function App() {
  return (
    <AxiomProvider rootNode={document.body}>
      <YourApp />
    </AxiomProvider>
  )
}
```

### Custom Portal Container

```typescript
function App() {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Create custom portal container
    const container = document.createElement('div')
    container.id = 'axiom-portals'
    document.body.appendChild(container)
    setPortalRoot(container)

    return () => {
      document.body.removeChild(container)
    }
  }, [])

  return (
    <AxiomProvider rootNode={portalRoot}>
      <YourApp />
    </AxiomProvider>
  )
}
```

### With React Root

```typescript
import { createRoot } from 'react-dom/client'
import { AxiomProvider } from '@gorgias/axiom'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)

root.render(
  <AxiomProvider rootNode={document.body}>
    <App />
  </AxiomProvider>
)
```

### Multiple Portal Roots

```typescript
function App() {
  const mainPortalRoot = document.getElementById('main-portals')
  const adminPortalRoot = document.getElementById('admin-portals')

  return (
    <>
      <AxiomProvider rootNode={mainPortalRoot}>
        <MainApp />
      </AxiomProvider>

      <AxiomProvider rootNode={adminPortalRoot}>
        <AdminPanel />
      </AxiomProvider>
    </>
  )
}
```

## What AxiomProvider Does

AxiomProvider configures where portal-based components render their content:

1. **Portal Container**: Sets the DOM node where portals (modals, tooltips, popovers, menus, etc.) are rendered
2. **Top Layer**: Marks the portal root as a "top layer" to prevent React Aria from making portal content inert when modals are open
3. **Context**: Provides portal root to all child components via context

Without AxiomProvider, portal components will still work but may not render in the optimal location.

## Components That Use Portals

These components render their content in portals and benefit from AxiomProvider:

- **Modal**: Modal dialogs
- **Popover**: Floating popovers
- **Menu**: Dropdown menus
- **Tooltip**: Tooltips
- **Select**: Selection dropdowns
- **MultiSelect**: Multi-selection dropdowns
- **DatePicker**: Date picker popovers
- **DateRangePicker**: Date range picker popovers

## useAxiomContext Hook

Access the AxiomProvider context in your components.

```typescript
import { useAxiomContext } from '@gorgias/axiom'

function MyComponent() {
  const { rootNode } = useAxiomContext()

  console.log('Portal root:', rootNode)

  return <div>My component</div>
}
```

## Common Patterns

### Next.js App Router

```typescript
// app/layout.tsx
import { AxiomProvider } from '@gorgias/axiom'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AxiomProvider rootNode={typeof window !== 'undefined' ? document.body : null}>
          {children}
        </AxiomProvider>
      </body>
    </html>
  )
}
```

### React + Vite

```typescript
// main.tsx
import { createRoot } from 'react-dom/client'
import { AxiomProvider } from '@gorgias/axiom'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <AxiomProvider rootNode={document.body}>
    <App />
  </AxiomProvider>
)
```

### With Other Providers

```typescript
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AxiomProvider rootNode={document.body}>
        <ThemeProvider theme={theme}>
          <YourApp />
        </ThemeProvider>
      </AxiomProvider>
    </QueryClientProvider>
  )
}
```

## When to Use

**Required when:**

- Using modal components that need to work together properly
- Portal content needs to escape CSS containment or overflow:hidden ancestors
- Multiple modals need proper stacking context

**Optional when:**

- Only using non-portal components (Button, Text, Box, etc.)
- Default portal behavior (rendering to document.body) is acceptable

## Related Components

- **Modal**: Requires AxiomProvider for proper portal rendering
- **Popover**: Uses portal rendering configured by AxiomProvider
- **Menu**: Uses portal rendering configured by AxiomProvider
- All dropdown and overlay components benefit from AxiomProvider
