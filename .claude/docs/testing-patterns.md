# Testing Patterns

Integration testing patterns using React Testing Library and MSW.

## Test Structure

### Basic Setup

```typescript
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { HttpResponse } from 'msw'

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
```

### Render Helper

```typescript
const renderComponent = (props = {}) => {
    const user = userEvent.setup()
    const queryClient = mockQueryClient()
    const store = mockStore()

    const result = render(
        <MemoryRouter>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <YourComponent {...props} />
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>
    )

    return { ...result, user }
}
```

## Selectors (Priority Order)

1. **getByRole** - Best for accessibility
   ```tsx
   screen.getByRole('button', { name: /submit/i })
   screen.getByRole('textbox', { name: /email/i })
   screen.getByRole('heading', { level: 1 })
   ```

2. **getByText** - For text content
   ```tsx
   screen.getByText('Welcome')
   screen.getByText(/hello world/i)
   ```

3. **getByLabelText** - For form inputs
   ```tsx
   screen.getByLabelText('Email address')
   screen.getByLabelText(/password/i)
   ```

4. **getByPlaceholderText** - For inputs without labels
   ```tsx
   screen.getByPlaceholderText('Search...')
   ```

5. **getByTestId** - Last resort only
   ```tsx
   // ❌ Avoid
   screen.getByTestId('submit-button')
   ```

## Async Patterns

### User Interactions

With userEvent v14+, methods are async and handle `act()` internally - just await them:

```typescript
const { user } = renderComponent()

// Click
await user.click(screen.getByRole('button'))

// Type
await user.type(screen.getByRole('textbox'), 'hello')

// Clear and type
await user.clear(screen.getByRole('textbox'))
await user.type(screen.getByRole('textbox'), 'new value')

// Select
await user.selectOptions(screen.getByRole('combobox'), 'option1')
```

### Waiting for Content

Use `waitFor` for async content:

```typescript
// Wait for element to appear
await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Wait for element to disappear
await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
})

// With timeout
await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument()
}, { timeout: 5000 })
```

## MSW Handler Patterns

### Basic Usage

```typescript
import { mockGetUserHandler, mockUpdateUserHandler } from '@gorgias/helpdesk-mocks'

const mockGetUser = mockGetUserHandler()
const mockUpdateUser = mockUpdateUserHandler()

const localHandlers = [
    mockGetUser.handler,
    mockUpdateUser.handler,
]
```

### Override for Specific Test

```typescript
it('should handle error', async () => {
    const { handler } = mockGetUserHandler(async () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 })
    )
    server.use(handler)

    renderComponent()

    await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
})
```

### Custom Response Data

```typescript
it('should show premium user', async () => {
    const { handler } = mockGetUserHandler(async () =>
        HttpResponse.json({
            ...mockGetUser.data,
            isPremium: true,
        })
    )
    server.use(handler)

    // ...
})
```

### Assert on Request

```typescript
const waitForRequest = mockUpdateUser.waitForRequest(server)

await user.click(screen.getByRole('button', { name: /save/i }))

await waitForRequest(async (request) => {
    const body = await request.json()
    expect(body.name).toBe('New Name')
})
```

## Common Test Patterns

### Loading State

```typescript
it('should show loading state', () => {
    renderComponent()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

### Error State

```typescript
it('should show error when API fails', async () => {
    const { handler } = mockGetDataHandler(async () =>
        HttpResponse.json({ error: 'Failed' }, { status: 500 })
    )
    server.use(handler)

    renderComponent()

    await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
})
```

### Form Submission

```typescript
it('should submit form', async () => {
    const { user } = renderComponent()

    await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
    })

    await user.type(
        screen.getByRole('textbox', { name: /name/i }),
        'John'
    )
    await user.click(
        screen.getByRole('button', { name: /submit/i })
    )

    await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument()
    })
})
```

## Anti-Patterns

❌ **Don't use snapshots** - Use explicit assertions
```typescript
// Bad
expect(container).toMatchSnapshot()

// Good
expect(screen.getByRole('heading')).toHaveTextContent('Title')
expect(screen.getByRole('button')).toBeDisabled()
```

❌ **Don't use fireEvent** - Use userEvent instead
```typescript
// Bad
fireEvent.click(button)

// Good
await user.click(button)
```

❌ **Don't use data-testid** - Use accessible selectors
```typescript
// Bad
screen.getByTestId('submit-btn')

// Good
screen.getByRole('button', { name: /submit/i })
```

❌ **Don't create manual mocks** - Use SDK mocks
```typescript
// Bad
jest.mock('../api', () => ({ getUser: jest.fn() }))

// Good
import { mockGetUserHandler } from '@gorgias/helpdesk-mocks'
```

❌ **Don't forget to await userEvent** - Methods are async
```typescript
// Bad
user.click(button) // missing await

// Good
await user.click(button)
```
