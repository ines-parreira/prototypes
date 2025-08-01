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

# Use rest-api-sdk for all HTTP related operations

## Core Principle

All HTTP operations and server state management must use the `rest-api-sdk` suite of packages, which leverages `@tanstack/react-query` internally. This provides standardized, type-safe, and efficient data fetching, caching, and synchronization.

## The rest-api-sdk suite of packages:

For the most common cases

- `@gorgias/helpdesk-client` - API client
- `@gorgias/helpdesk-queries` - Data fetching hooks
- `@gorgias/helpdesk-types` - Generated types
- `@gorgias/helpdesk-validators` - Request/response validation

For the knowledge service API endpoints

- `@gorgias/knowledge-service-client` - API client
- `@gorgias/knowledge-service-queries` - Data fetching hooks
- `@gorgias/knowledge-service-types` - Generated types
- `@gorgias/knowledge-service-validators` - Request/response validation

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

### Async testing patterns

- **Always use `waitFor`** for async operations
- **Wait for component to load** before making assertions
- **Use `act()` for user interactions** that trigger state changes
- **Test loading states** before testing final states

### User interaction testing

```typescript
// Use userEvent for interactions
act(() => {
    userEvent.click(getByLabelText(/Some Label/))
    userEvent.type(getByRole('textbox'), 'new value')
})

// Wait for async operations
await waitFor(() => {
    expect(getByText('Expected text')).toBeInTheDocument()
})
```

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
