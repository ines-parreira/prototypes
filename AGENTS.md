# Use pnpm for package management

- **ALWAYS use pnpm** for all package management operations
- Use `pnpm install` instead of `npm install` or `yarn install`
- Use `pnpm add <package>` instead of `npm install <package>` or `yarn add <package>`
- Use `pnpm remove <package>` instead of `npm uninstall <package>` or `yarn remove <package>`
- Use `pnpm run <script>` instead of `npm run <script>` or `yarn <script>`
- Use `pnpm exec <command>` instead of `npx <command>` or `yarn exec <command>`

## Development Workflow

- When suggesting package installations, always use pnpm commands
- When running scripts or commands, prefer pnpm over other package managers
- When creating new scripts in package.json, ensure they work with pnpm
- When debugging dependency issues, use `pnpm why <package>` for dependency analysis

## Common Tasks

### Testing

Always prefer running the tests on specific files rather than an entire package.

- Run tests with `pnpm test <package>` for a specific package (e.g., `pnpm test @repo/tickets`)
- Run tests for specific files `pnpm test <package> <path-to-test or test-file-name>` in a specific package (e.g., `pnpm test @repo/tickets TicketHeader.spec.tsx`)
- Run tests with `pnpm test:all` for all packages
- Run tests with `pnpm test:affected` for all affected packages
- Update snapshots with `pnpm test <package> -u` for a specific package
- Update snapshots with `pnpm test:all -u` for all packages
- Update snapshots with `pnpm test:affected -u` for all affected packages

### Linting

- Lint code with `pnpm lint <package>` for a specific package (e.g., `pnpm lint @repo/tickets`)
- Lint code with `pnpm lint:code:all` for all packages
- Lint code with `pnpm lint:code:affected` for all affected packages

### Formatting

- Check formatting with `pnpm format:check <package>` for a specific package (e.g., `pnpm format:check @repo/tickets`)
- Fix formatting with `pnpm format:fix <package>` for a specific package (e.g., `pnpm format:fix @repo/tickets`)
- Fix formatting with `pnpm format:fix:all` for all packages
- Fix formatting with `pnpm format:fix:affected` for all affected packages

### Type checking

- Type check with `pnpm typecheck <package>` for a specific package (e.g., `pnpm typecheck @repo/tickets`)
- Type check with `pnpm typecheck:all` for all packages
- Type check with `pnpm typecheck:affected` for all affected packages

## Code Generation

- When generating package.json scripts, ensure compatibility with pnpm
- When suggesting dependency updates, use pnpm-specific commands
- When creating new projects or components, use pnpm for dependency management

## Best Practices

- Leverage pnpm's efficient disk space usage and fast installation
- Use pnpm's workspace features for monorepo management if applicable
- Prefer pnpm's stricter dependency resolution for better security
- Use `pnpm audit` for security audits instead of npm audit

## Error Resolution

- If encountering package manager conflicts, default to pnpm solutions
- When troubleshooting installation issues, use pnpm-specific debugging commands
- Prefer pnpm's lockfile (pnpm-lock.yaml) over package-lock.json or yarn.lock

# Use accessible selectors in tests and avoid data-testid html attribute

The preferred way to target elements in tests is to use other queries from React Testing Library:

## Priority Order:

1. **getByRole** - Best for accessibility and user behavior simulation
2. **getByText** - For text content
3. **getByLabelText** - For form inputs with labels
4. **queryByText** - For conditional text content
5. **getByPlaceholderText** - For inputs without labels
6. **getByTestId** - Only as last resort

## Examples:

```tsx
// ❌ Avoid - focuses on implementation details
const element = screen.getByTestId('submit-button')

// ✅ Prefer - focuses on user behavior
const button = screen.getByRole('button', { name: /submit/i })
const submitButton = screen.getByText('Submit')
const form = screen.getByRole('form')
```

```tsx
// ❌ Avoid - implementation-focused
<div data-testid="user-avatar">
  <img src={avatarUrl} alt="User avatar" />
</div>

// ✅ Prefer - accessibility-focused
<div>
  <img src={avatarUrl} alt="User avatar" />
</div>
// Test with: screen.getByAltText('User avatar')
```

## Implementation Guidelines

# Use rest-api-sdk for all HTTP related operations

## Core Principle

All HTTP operations and server state management must use the `rest-api-sdk` suite of packages, which leverages `@tanstack/react-query` internally. This provides standardized, type-safe, and efficient data fetching, caching, and synchronization.

## The rest-api-sdk suite of packages:

Each service has a consistent package structure: `-client`, `-queries`, `-types`, `-validators`, and `-mocks`.

### Helpdesk API (most common)

- `@gorgias/helpdesk-client` - API client
- `@gorgias/helpdesk-queries` - Data fetching hooks
- `@gorgias/helpdesk-types` - Generated types
- `@gorgias/helpdesk-validators` - Request/response validation
- `@gorgias/helpdesk-mocks` - MSW mock handlers for testing

### Knowledge Service API

- `@gorgias/knowledge-service-client` - API client
- `@gorgias/knowledge-service-queries` - Data fetching hooks
- `@gorgias/knowledge-service-types` - Generated types
- `@gorgias/knowledge-service-validators` - Request/response validation
- `@gorgias/knowledge-service-mocks` - MSW mock handlers for testing

### Help Center API

- `@gorgias/help-center-client` - API client
- `@gorgias/help-center-queries` - Data fetching hooks
- `@gorgias/help-center-types` - Generated types
- `@gorgias/help-center-validators` - Request/response validation
- `@gorgias/help-center-mocks` - MSW mock handlers for testing

### Convert API

- `@gorgias/convert-client` - API client
- `@gorgias/convert-queries` - Data fetching hooks
- `@gorgias/convert-types` - Generated types
- `@gorgias/convert-mocks` - MSW mock handlers for testing

### Ecommerce Storage API

- `@gorgias/ecommerce-storage-client` - API client
- `@gorgias/ecommerce-storage-queries` - Data fetching hooks
- `@gorgias/ecommerce-storage-mocks` - MSW mock handlers for testing

## Key Requirements

1. **New Features**: MUST use `@gorgias/helpdesk-queries` or `@gorgias/{namespace}-queries` for all server data operations
2. **Existing Features**: When refactoring, migrate Redux-based data fetching to rest-api-sdk
3. **No Direct API Calls**: Never use direct `fetch`, `axios`, or custom API calls in components
4. **Separation of Concerns**: Keep data operations separate from UI operations (toasts, navigation)

## Implementation Patterns

### Basic Data Fetching

```tsx
// ✅ Use rest-api-sdk hooks for data fetching
import { useGetTicket } from '@gorgias/helpdesk-queries'

function TicketDetails({ ticketId }) {
    const { data: ticket, isLoading, isError, error } = useGetTicket(ticketId)

    if (isLoading) return <Skeleton />
    if (isError) return <ErrorMessage message={error.message} />

    return (
        <div>
            <h1>{ticket.subject}</h1>
            <p>{ticket.description}</p>
        </div>
    )
}
```

### Custom Application-Level Hooks

For side effects like optimistic updates, create single-purpose application-level hooks:

```tsx
// ✅ useDeleteMacro.ts - Focus only on data-related side effects
import {
    queryKeys,
    useDeleteMacro as useDeleteMacroPrimitive,
} from '@gorgias/helpdesk-queries'

export function useDeleteMacro() {
    const queryClient = useQueryClient()
    return useDeleteMacroPrimitive({
        mutation: {
            onMutate: async (params) => {
                // Handle optimistic updates and cache management
                const macroKey = queryKeys.macros.getMacro(params.id)
                await queryClient.cancelQueries({
                    queryKey: [allMacrosKey, macroKey],
                })

                const previousMacros = queryClient.getQueryData(allMacrosKey)
                queryClient.setQueryData(
                    allMacrosKey,
                    previousMacros.filter((macro) => macro.id !== params.id),
                )

                return { previousMacros }
            },
            onError: (error, params, context) => {
                // Revert optimistic updates on error
                const { previousMacros } = context
                queryClient.setQueryData(allMacrosKey, previousMacros)
            },
            onSettled: (data, errors, params) => {
                // Always refetch to ensure data consistency
                const macroKey = queryKeys.macros.getMacro(params.id)
                queryClient.invalidateQueries({
                    queryKey: [allMacrosKey, macroKey],
                })
            },
        },
    })
}
```

### Component Event Handlers

Handle non-data concerns (toasts, navigation) in component event handlers:

```tsx
// ✅ DeleteMacroForm.tsx - Handle UI concerns in event handlers
export function DeleteMacroForm({ macroId }: DeleteMacroFormProps) {
    const dispatch = useAppDispatch()
    const { mutateAsync: deleteMacro } = useDeleteMacro()
    const history = useHistory()

    async function handleSubmit() {
        try {
            await deleteMacro({ id: macroId })
            dispatch(
                notify({
                    message: 'Successfully deleted macro',
                    status: NotificationStatus.Success,
                }),
            )
            history.push('/settings/macros')
        } catch (error) {
            dispatch(
                notify({
                    message: isGorgiasApiError(error)
                        ? error.response.data.error.msg
                        : `Sorry we couldn't delete the macro`,
                    status: NotificationStatus.Error,
                }),
            )
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Button type="submit">Delete macro</Button>
        </form>
    )
}
```

### ❌ Avoid These Patterns

#### Avoid raw API calls

```tsx
// ❌ Direct API calls
const response = await fetch('/api/tickets')
const data = await response.json()

// ❌ Custom axios calls
const ticket = await api.get(`/tickets/${id}`)
```

### ❌ Don't use Redux for server state

```tsx
// ❌ Avoid - Redux for server data fetching
const fetchTicket = createAsyncThunk('tickets/fetchTicket', async (id) => {
    const response = await api.get(`/tickets/${id}`)
    return response.data
})

// ❌ Avoid - Redux selectors for server data
const selectTicket = (state, id) => state.tickets.entities[id]
```

### ❌ Don't mix concerns in data hooks

```tsx
// ❌ Avoid - Mixing data operations with UI concerns
export function useDeleteMacro() {
    const dispatch = useAppDispatch()
    const history = useHistory()

    return useDeleteMacroPrimitive({
        mutation: {
            onSuccess: () => {
                dispatch(notify({ message: 'Success!' })) // ❌ UI concern in data hook
                history.push('/macros') // ❌ Navigation in data hook
            },
        },
    })
}
```

### ❌ Don't use direct API calls

```tsx
// ❌ Avoid - Direct API calls in components
function TicketDetails({ ticketId }) {
    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/tickets/${ticketId}`) // ❌ Direct API call
            .then((res) => res.json())
            .then(setTicket)
            .finally(() => setLoading(false))
    }, [ticketId])
}
```

# Use @gorgias/axiom for UI components

## Core Principle

All UI components should use `@gorgias/axiom` - our internal design system - instead of custom implementations. This ensures consistency, accessibility, and maintainability across the codebase.

## Available Packages

- `@gorgias/axiom` - UI component library
- `@gorgias/design-tokens` - Design tokens for theming

## Key Requirements

1. **Use axiom components** instead of creating custom buttons, inputs, dialogs, etc.
2. **Prefer new API** over Legacy versions (e.g., use `Button` not `LegacyButton`)
3. **Use design tokens** via CSS variables for custom styling
4. **Wrap components in ThemeProvider** for proper theming

## Common Components

| Component  | Import                                                                     | Use For                                         |
| ---------- | -------------------------------------------------------------------------- | ----------------------------------------------- |
| `Button`   | `import { Button } from '@gorgias/axiom'`                                  | All button actions                              |
| `Box`      | `import { Box } from '@gorgias/axiom'`                                     | Layout containers with flexbox                  |
| `Heading`  | `import { Heading } from '@gorgias/axiom'`                                 | Page titles, section headers (uses `size` prop) |
| `Text`     | `import { Text } from '@gorgias/axiom'`                                    | Regular body text, paragraphs                   |
| `Skeleton` | `import { Skeleton } from '@gorgias/axiom'`                                | Loading states                                  |
| `Dialog`   | `import { Dialog } from '@gorgias/axiom'`                                  | Modal dialogs                                   |
| `Icon`     | `import { Icon } from '@gorgias/axiom'`                                    | Icons                                           |
| `Tooltip`  | `import { Tooltip, TooltipContent } from '@gorgias/axiom'`                 | Tooltips                                        |
| `Input`    | `import { Input } from '@gorgias/axiom'`                                   | Text inputs                                     |
| `Select`   | `import { Select } from '@gorgias/axiom'`                                  | Dropdowns                                       |

## Implementation Patterns

### Basic Component Usage

```tsx
import { Box, Button, Heading, Skeleton, Text } from '@gorgias/axiom'

function TicketCard({ ticket, isLoading }) {
    if (isLoading) return <Skeleton />

    return (
        <Box flexDirection="column" gap="md" padding="lg">
            <Heading size="md">{ticket.subject}</Heading>
            <Text>{ticket.description}</Text>
            <Button onClick={handleAction}>View Details</Button>
        </Box>
    )
}
```

### Layout with Box

```tsx
import { Box } from '@gorgias/axiom'

// Use Box for flexbox layouts with design token spacing

;<Box
    flexDirection="row"
    justifyContent="space-between"
    alignItems="center"
    gap="md"
    padding="lg"
>
    {children}
</Box>
```

### Tooltips (New API)

Tooltip uses a `trigger` prop for the trigger element. `TooltipContent` is passed as children:

```tsx
import { Tooltip, TooltipContent } from '@gorgias/axiom'

// Basic usage with a focusable Axiom component
<Tooltip trigger={<Button>Hover me</Button>}>
    <TooltipContent title="Helpful information" />
</Tooltip>

// With a custom element
<Tooltip trigger={<div role="button">Custom trigger</div>}>
    <TooltipContent title="Helpful information" />
</Tooltip>

// With render function trigger (receives { isOpen, isDisabled })
<Tooltip trigger={({ isOpen }) => (
    <Button variant={isOpen ? 'primary' : 'secondary'}>Hover me</Button>
)}>
    <TooltipContent title="Tooltip content" />
</Tooltip>
```

### Design Tokens in CSS

Use semantic design tokens for colors and spacing:

**Spacing:** `--spacing-xxxxs` | `--spacing-xxxs` | `--spacing-xxs` | `--spacing-xs` | `--spacing-sm` | `--spacing-md` | `--spacing-lg`

**Colors:**

- Content (text): `--content-neutral-default`, `--content-neutral-secondary`, `--content-accent-default`
- Surface (backgrounds): `--surface-neutral-primary`, `--surface-neutral-secondary`, `--surface-error-primary`
- Border: `--border-neutral-default`

```less
.container {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    color: var(--content-neutral-default);
    background-color: var(--surface-neutral-primary);
    border: 1px solid var(--border-neutral-default);
}

.secondaryText {
    color: var(--content-neutral-secondary);
}
```

## ❌ Avoid These Patterns

### Don't create custom buttons

```tsx
// ❌ Avoid - Custom button implementation
<div className={styles.button} onClick={onClick}>
    Click me
</div>

// ✅ Prefer - Use axiom Button
import { Button } from '@gorgias/axiom'
<Button onClick={onClick}>Click me</Button>
```

### Don't use Legacy components in new code

```tsx
// ❌ Avoid - Legacy import
import { LegacyButton as Button } from '@gorgias/axiom'

// ✅ Prefer - New API
import { Button } from '@gorgias/axiom'
```

### Don't hardcode colors or spacing

```less
/* ❌ Avoid - Hardcoded values */
.card {
    padding: 16px;
    color: #333;
    background-color: #fff;
}

/* ✅ Prefer - Design tokens */
.card {
    padding: var(--spacing-md);
    color: var(--content-neutral-default);
    background-color: var(--surface-neutral-primary);
}
```

## When Custom Components Are Acceptable

- Domain-specific visualizations (charts, graphs)
- Complex business logic components that don't fit standard patterns
- Third-party widget integrations

# Integration Testing Best Practices

## Mock Setup and Organization

### Use SDK-generated mocks consistently

- **Always use** `@gorgias/helpdesk-mocks` or the other mocks packages like `@gorgias/knowledge-service-mocks` for mocking API responses and handlers
- **Never create manual mocks** for API calls - use the provided SDK mocks instead
- **Follow naming conventions** for mocks:
    - Component mocks: `mock<ComponentName>Component`
    - Response body mocks: `mock<HandlerName>ResponseBody`
    - Request handler mocks: `mock<HandlerName>Handler`

### Server setup pattern

```typescript
const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})
```

### Handler organization

- **Define handlers at the top** of the test file for reusability
- **Use descriptive names** for handler variables
- **Group related handlers** together in arrays
- **Override handlers per test** when needed for specific scenarios

## Test Structure and Patterns

### Component rendering setup

```typescript
const renderComponent = () => {
    return render(
        <MemoryRouter>
            <Provider store={mocksStore}>
                <QueryClientProvider client={appQueryClient}>
                    <ThemeProvider>
                        <YourComponent />
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>,
    )
}
```

### For Component Testing:

- Use semantic HTML elements with proper roles
- Add meaningful `alt` attributes to images
- Use proper `aria-*` attributes for accessibility
- Ensure form inputs have associated labels
- Avoid mocking the components
- Don't test if components have a certain class as this is too brittle, instead focus on behavioral testing

### For Mock Components:

- Prefer testing through props and rendered content
- Consider refactoring mocks to be more testable

### Async testing patterns

- Await **userEvent methods**
- **Use `waitFor()`** for async content that appears after API calls or other async operations
- **Wait for component to load** before making assertions
- **Test loading states** before testing final states
- **`act()` is always needed for**: direct state updates like `jest.advanceTimersByTime()`, non-userEvent DOM manipulations, and testing hooks directly with `renderHook`

```typescript
// ✅: Good - userEvent v14+ handles act internally
await user.click(getByLabelText(/Some Label/))

// ✅: Good - multiple interactions
await user.click(getByLabelText(/Some Label/))
await user.click(getByLabelText(/Some Other Label/))
```

```typescript
// Use userEvent for interactions (no act() wrapper needed with v14+)
await user.click(getByLabelText(/Some Label/))
await user.type(getByRole('textbox'), 'new value')

// Then check state after the action is complete
expect(getByText('Expected text')).toBeInTheDocument()
```

```typescript
// For eventually consistent changes (e.g., external service responses)
// Clicking button causes an eventually consistent update
await user.click(getByLabelText(/Send/))

// Wait for async response from external service
await waitFor(() => {
    // Chat service won't respond immediately, so wait for the change to come in
    expect(getByText('Expected response')).toBeInTheDocument()
})
```

```typescript
// act() IS still needed for timer manipulations
act(() => {
    jest.advanceTimersByTime(1000)
})
```

### User Interaction Testing

`userEvent` simulates full user interactions, while `fireEvent` only dispatches single DOM events. This makes `userEvent` more realistic and reliable for testing user behavior.

Since `userEvent` v14+, methods are async by default and handle React's state updates internally - no need to wrap in `act()`.

#### Key Differences:

- **fireEvent**: Dispatches single DOM events (low-level)
- **userEvent**: Simulates complete user interactions with multiple events and checks
- **userEvent**: Includes visibility and interactability checks
- **userEvent**: Manipulates DOM exactly like real browser interactions
- **userEvent v14+**: Handles `act()` internally - just await the method

#### Setup Pattern:

```tsx
import userEvent from '@testing-library/user-event'

// ✅ Recommended: Setup in each test
test('user can click button', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)

    await user.click(screen.getByRole('button', { name: /submit/i }))
    // ...assertions...
})

// ✅ Alternative: Setup function
function setup(jsx) {
    return {
        user: userEvent.setup(),
        ...render(jsx),
    }
}

test('with setup function', async () => {
    const { user } = setup(<MyComponent />)
    await user.type(screen.getByRole('textbox'), 'Hello world')
})
```

#### Examples:

```tsx
// ❌ Avoid - fireEvent doesn't simulate real user behavior
fireEvent.click(button)
fireEvent.change(input, { target: { value: 'text' } })

// ✅ Prefer - userEvent simulates realistic interactions
await user.click(button)
await user.type(input, 'text')
await user.clear(input)
await user.selectOptions(select, 'option1')
```

#### When to Use fireEvent:

- Only as last resort for interactions not yet implemented in `userEvent`
- For testing specific edge cases requiring low-level event dispatch
- When testing event handlers directly rather than user interactions

## Mock Usage Patterns

### Basic handler usage

```typescript
const mockGetCurrentUser = mockGetCurrentUserHandler()
const mockUpdateCurrentUser = mockUpdateCurrentUserHandler()

const localHandlers = [
    mockGetCurrentUser.handler,
    mockUpdateCurrentUser.handler,
]
```

### Handler overrides for specific tests

```typescript
it('should handle specific scenario', async () => {
    const { handler } = mockGetCurrentUserHandler(async () =>
        HttpResponse.json({
            ...mockGetCurrentUser.data,
            role: { name: UserRole.GorgiasAgent },
        }),
    )
    server.use(handler)

    // Test implementation
})
```

## Assertion Best Practices

### Test visible outcomes

- **Assert on UI elements** that users can see
- **Test user interactions** and their effects
- **Verify state changes** through observable behavior
- **Avoid testing implementation details** unless necessary

### Request assertion (when needed)

```typescript
const waitForUpdateCurrentUserRequest =
    mockUpdateCurrentUser.waitForRequest(server)

// Trigger action
act(() => {
    userEvent.click(getByLabelText(/Some Label/))
    userEvent.type(getByRole('textbox'), 'new value')
})

await waitForUpdateCurrentUserRequest(async (request) => {
    const body = await request.json()
    expect(body).toEqual({
        meta: { profile_picture_url: profilePictureUrl },
    })
})
```

## Test Organization

### Group related tests

```typescript
describe('Personal informations section', () => {
    it('should render with correct values', async () => {
        // Test implementation
    })

    it('should handle disabled state', async () => {
        // Test implementation
    })
})
```

### Test different user roles/scenarios

```typescript
it('should correctly disable inputs for a Gorgias agent', async () => {
    const { handler } = mockGetCurrentUserHandler(async () =>
        HttpResponse.json({
            ...mockGetCurrentUser.data,
            role: { name: UserRole.GorgiasAgent },
        }),
    )
    server.use(handler)

    // Test disabled state
})
```

## Anti-patterns to Avoid

- **Don't use snapshot testing** - never use `toMatchSnapshot()` or `toMatchInlineSnapshot()`
- **Don't test implementation details** - focus on user-visible behavior
- **Don't create manual mocks** for API calls - use SDK mocks
- **Don't test internal state** - test observable outcomes
- **Don't skip async operations** - always use `waitFor` for async behavior
- **Don't test multiple concerns** in a single test - keep tests focused
- **Don't rely on implementation-specific selectors** - use accessible selectors

## File Organization

- **Keep mocks at the top** of the test file
- **Group related tests** in describe blocks
- **Use descriptive test names** that explain the scenario
- **Extract common setup** into helper functions
- **Keep tests focused** on a single behavior or feature

# Avoid Unnecessary Comments

- **Write self-documenting code** with clear variable names, function names, and structure
- **Only add comments for complex business logic** that cannot be made clear through code alone
- **Avoid commenting obvious code** - if the code is self-explanatory, no comment is needed
- **Prefer descriptive names over comments** - use `calculateTotalWithTax()` instead of `calculateTotal() // includes tax`
- **When comments are needed**, explain the "why" not the "what" - focus on business reasoning, not code mechanics
- **Keep comments up-to-date** - outdated comments are worse than no comments
- **Use JSDoc/TSDoc only for public APIs** and complex function signatures

## Examples

**Good (no comment needed):**

```typescript
const isUserEligibleForDiscount =
    user.hasActiveSubscription && user.totalSpent > 1000
```

**Good (comment for complex business logic):**

```typescript
// Apply legacy discount rules for customers who signed up before 2023
// These customers get 15% off regardless of current subscription status
const legacyDiscount = user.signupDate < new Date('2023-01-01') ? 0.15 : 0
```

**Bad (obvious comment):**

```typescript
const total = price + tax // Calculate total by adding price and tax
```

```typescript
// Check that the tooltip content is displayed
expect(tooltip).toHaveTextContent(
    'Macros are suggested based on your previous macro usage.',
)
```
