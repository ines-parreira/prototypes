# Test Patterns

## Test File Structure

```tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { appQueryClient, mockStore } from 'testing/utils'

import { ThemeProvider } from '@gorgias/axiom'
import { mockGetTicketHandler } from '@gorgias/helpdesk-mocks'

import { ComponentName } from './ComponentName'

// 1. Setup handlers at the top
const mockGetTicket = mockGetTicketHandler()
const localHandlers = [mockGetTicket.handler]

// 2. Setup server
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

// 3. Render helper
function renderComponent(props = {}) {
    return render(
        <MemoryRouter>
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <ThemeProvider>
                        <ComponentName {...props} />
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>,
    )
}

// 4. Tests
describe('ComponentName', () => {
    it('should render ticket details', async () => {
        renderComponent({ ticketId: 123 })

        await waitFor(() => {
            expect(
                screen.getByText(mockGetTicket.data.subject),
            ).toBeInTheDocument()
        })
    })
})
```

## Accessible Selectors (Priority Order)

```tsx
// 1. getByRole - BEST (accessibility + user behavior)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { level: 1 })

// 2. getByText - For text content
screen.getByText('Submit')
screen.getByText(/welcome/i)

// 3. getByLabelText - For form inputs
screen.getByLabelText('Email address')

// 4. queryByText - For conditional content
screen.queryByText('Error message')

// 5. getByPlaceholderText - Inputs without labels
screen.getByPlaceholderText('Search...')

// 6. getByTestId - LAST RESORT ONLY
// ❌ Avoid - screen.getByTestId('submit-button')
```

## User Interactions

With userEvent await user interaction methods:

```tsx
it('should handle form submission', async () => {
    const user = userEvent.setup()
    renderComponent()

    // Wait for component to load
    await waitFor(() => {
        expect(
            screen.getByRole('textbox', { name: /name/i }),
        ).toBeInTheDocument()
    })

    // Interact
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'John')
    await user.click(screen.getByRole('button', { name: /save/i }))

    // Assert result
    await waitFor(() => {
        expect(screen.getByText('Saved successfully')).toBeInTheDocument()
    })
})
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

## Multiple interactions

```tsx
await user.clear(screen.getByRole('textbox'))
await user.type(screen.getByRole('textbox'), 'new value')
await user.click(screen.getByRole('button', { name: /save/i }))
```

## Handler Overrides for Specific Tests

```tsx
it('should handle error state', async () => {
    const { handler } = mockGetTicketHandler(async () =>
        HttpResponse.json({ error: { msg: 'Not found' } }, { status: 404 }),
    )
    server.use(handler)

    renderComponent({ ticketId: 999 })

    await waitFor(() => {
        expect(screen.getByText(/not found/i)).toBeInTheDocument()
    })
})

it('should handle different user role', async () => {
    const { handler } = mockGetCurrentUserHandler(async () =>
        HttpResponse.json({
            ...mockGetCurrentUser.data,
            role: { name: 'admin' },
        }),
    )
    server.use(handler)

    // Test admin-specific behavior
})
```

## Request Assertions

```tsx
it('should send correct data on submit', async () => {
    const waitForRequest = mockUpdateTicketHandler.waitForRequest(server)
    const user = userEvent.setup()
    renderComponent()

    await user.type(screen.getByRole('textbox'), 'Updated title')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitForRequest(async (request) => {
        const body = await request.json()
        expect(body).toEqual({
            subject: 'Updated title',
        })
    })
})
```

## Common Patterns

### Loading State

```tsx
it('should show loading state', () => {
    renderComponent()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

### Empty State

```tsx
it('should show empty state when no data', async () => {
    const { handler } = mockListTicketsHandler(async () =>
        HttpResponse.json({ data: [] }),
    )
    server.use(handler)

    renderComponent()

    await waitFor(() => {
        expect(screen.getByText('No tickets found')).toBeInTheDocument()
    })
})
```

## Anti-patterns

```tsx
// ❌ Don't use fireEvent when userEvent works
fireEvent.click(button)

// ❌ Don't use getByTestId
screen.getByTestId('submit-button')

// ❌ Don't forget await on userEvent (methods are async)
user.click(button) // Missing await

// ❌ Don't test implementation details
expect(component.state.isOpen).toBe(true)

// ❌ Don't create manual mocks for API calls
jest.mock('../api', () => ({ fetchTicket: jest.fn() }))
```
