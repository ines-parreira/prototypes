---
targets:
  - '*'
---
# /generate-test - Component/Hook Test Generator

Generate integration tests following project patterns and CLAUDE.md guidelines.

## Usage

```
/generate-test <file-path>
```

## Arguments

- `<file-path>` - Path to the component or hook to test (e.g., `src/pages/settings/teams/TeamForm.tsx`)

## Instructions

When the user runs this command:

1. **Read the target file** to understand:
    - Component/hook structure
    - Props and their types
    - API calls (SDK hooks used)
    - User interactions
    - State management

2. **Identify SDK hooks used** to determine which mocks are needed:
    - `@gorgias/helpdesk-queries` hooks -> `@gorgias/helpdesk-mocks`
    - `@gorgias/knowledge-service-queries` hooks -> `@gorgias/knowledge-service-mocks`
    - `@gorgias/help-center-queries` hooks -> `@gorgias/help-center-mocks`
    - `@gorgias/convert-queries` hooks -> `@gorgias/convert-mocks`
    - `@gorgias/ecommerce-storage-queries` hooks -> `@gorgias/ecommerce-storage-mocks`

3. **Generate test file** with proper structure:

### Test File Template

```typescript
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@gorgias/axiom'

// Import mocks from SDK
import { mockGetXxxHandler, mockUpdateXxxHandler } from '@gorgias/helpdesk-mocks'

// Import component
import { ComponentName } from './ComponentName'

// Import test utilities
import { mockQueryClient } from '@/tests/reactQueryTestingUtils'
import { mockStore } from '@/tests/mockStore'

// Setup mocks
const mockGetXxx = mockGetXxxHandler()
const mockUpdateXxx = mockUpdateXxxHandler()

const localHandlers = [
    mockGetXxx.handler,
    mockUpdateXxx.handler,
]

// Setup server
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

// Render helper
const renderComponent = (props = {}) => {
    const user = userEvent.setup()
    const queryClient = mockQueryClient()
    const store = mockStore()

    const result = render(
        <MemoryRouter>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <ComponentName {...props} />
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>
    )

    return { ...result, user }
}

describe('ComponentName', () => {
    describe('rendering', () => {
        it('should render with initial data', async () => {
            renderComponent()

            // Wait for data to load
            await waitFor(() => {
                expect(screen.getByRole('heading', { name: /expected title/i })).toBeInTheDocument()
            })
        })

        it('should show loading state', () => {
            renderComponent()
            expect(screen.getByRole('progressbar')).toBeInTheDocument()
        })
    })

    describe('user interactions', () => {
        it('should handle form submission', async () => {
            const { user } = renderComponent()

            // Wait for component to load
            await waitFor(() => {
                expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()
            })

            // Fill form using accessible selectors
            await user.clear(screen.getByRole('textbox', { name: /name/i }))
            await user.type(screen.getByRole('textbox', { name: /name/i }), 'New Value')

            // Submit form
            await user.click(screen.getByRole('button', { name: /save/i }))

            // Assert result
            await waitFor(() => {
                expect(screen.getByText(/saved successfully/i)).toBeInTheDocument()
            })
        })

        it('should handle button click', async () => {
            const { user } = renderComponent()

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: /action/i }))

            // Assert expected behavior
        })
    })

    describe('error handling', () => {
        it('should display error when API fails', async () => {
            // Override handler with error response
            const { handler } = mockGetXxxHandler(async () =>
                HttpResponse.json({ error: 'Failed' }, { status: 500 })
            )
            server.use(handler)

            renderComponent()

            await waitFor(() => {
                expect(screen.getByText(/error/i)).toBeInTheDocument()
            })
        })
    })
})
```

### Key Patterns to Follow

1. **No snapshots** - Never use `toMatchSnapshot()` or `toMatchInlineSnapshot()`. Always use explicit assertions.

2. **Accessible selectors** - Use `getByRole`, `getByText`, `getByLabelText` (avoid `getByTestId`)

3. **User interactions** -

    ```typescript
    await user.click(button)
    await user.type(input, 'text')
    ```

If this genenerate act() related warning:

```
Warning: An update to Component inside a test was not wrapped in act(...)
```

Then wrap the user event in an act()

```typescript
// BEFORE
await user.click(button)
// AFTER
await act(() => user.click(button))
```

1. **Async data** - Use `waitFor()` for data loading:

    ```typescript
    await waitFor(() => {
        expect(screen.getByText('Data')).toBeInTheDocument()
    })
    ```

2. **Mock overrides** - Override handlers per test:

    ```typescript
    const { handler } = mockGetXxxHandler(async () =>
        HttpResponse.json({ ...mockGetXxx.data, customField: 'value' }),
    )
    server.use(handler)
    ```

3. **Request assertions** - When needed:

    ```typescript
    const waitForRequest = mockUpdateXxx.waitForRequest(server)
    await user.click(saveButton)
    await waitForRequest(async (request) => {
        const body = await request.json()
        expect(body.name).toBe('New Name')
    })
    ```

4. **Place test file** appropriately:
    - For components: Same directory as component or in `tests/` subdirectory
    - File name: `ComponentName.spec.tsx` or `ComponentName.test.tsx`

## Important: No Snapshot Testing

This project does not use snapshot testing. Always use explicit assertions:

```typescript
// ❌ Never use snapshots
expect(container).toMatchSnapshot()
expect(result).toMatchInlineSnapshot()

// ✅ Use explicit assertions
expect(screen.getByRole('heading')).toHaveTextContent('Welcome')
expect(screen.getByRole('button')).toBeDisabled()
expect(screen.getByRole('list').children).toHaveLength(3)
```
