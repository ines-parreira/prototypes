# Test Patterns

## Choose the Runner First

Confirm the active runner before copying any setup.

- `apps/helpdesk/**` defaults to Jest and should import `render` and `renderHook` from `@repo/testing` with `jest.*`
- Extracted `packages/**` usually use Vitest and should follow `@repo/testing/vitest`, package-local `tests/render.utils`, and `vi.*`
- Local `package.json`, `jest.config.*`, `vitest.config.*`, and neighboring tests override the folder heuristic when a package is an exception

## Render Helpers

In `apps/helpdesk/**`, import `render` and `renderHook` from `@repo/testing`. Do not import those helpers directly from `@testing-library/react`. Test-local setup helpers may wrap `@repo/testing` `render` or `renderHook` when a spec needs extra providers or route state.

In `packages/**`, import `render` and `renderHook` from the nearest package-local `tests/render.utils` when it exists. Those helpers carry package providers, router defaults, bridge context, `QueryClient` ownership, and `userEvent` setup.

Do not import `render` or `renderHook` directly from `@testing-library/react` when a package helper is available. Keep using Testing Library for `screen`, `waitFor`, `within`, `act`, and types.

## Vitest Package Example

```tsx
import { render, screen, waitFor } from '@repo/testing/vitest'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'

import { ThemeProvider } from '@gorgias/axiom'
import {
    mockGetTicketHandler,
    mockUpdateTicketHandler,
} from '@gorgias/helpdesk-mocks'

import { ComponentName } from './ComponentName'

const mockGetTicket = mockGetTicketHandler()
const mockUpdateTicket = mockUpdateTicketHandler()
const localHandlers = [mockGetTicket.handler, mockUpdateTicket.handler]

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

function renderComponent(props = {}) {
    const store = mockStore()

    return render(<ComponentName {...props} />, {
        wrapper: ({ children }) => (
            <Provider store={store}>
                <ThemeProvider>{children}</ThemeProvider>
            </Provider>
        ),
    })
}

describe('ComponentName', () => {
    it('renders ticket details', async () => {
        renderComponent({ ticketId: 123 })

        await waitFor(() => {
            expect(
                screen.getByText(mockGetTicket.data.subject),
            ).toBeInTheDocument()
        })
    })
})
```

For `apps/helpdesk`, keep the same test shape but import `render` and `renderHook` from `@repo/testing` and use `jest.*` globals.

## Shared QueryClient Ownership

The safest default is to let shared render helpers own the query client lifecycle and to wait on user-visible outcomes or captured requests instead of query internals.

- In `apps/helpdesk`, prefer `@repo/testing` render helpers and Jest setup patterns
- In extracted packages, prefer `@repo/testing/vitest` or existing package-local render helpers
- Do not add module-scoped `QueryClient` instances to generic consumer-test templates
- Do not seed, poll, or clear query clients in consumer specs. Drive server data through SDK MSW handlers and let render helpers own query lifecycle.

## Portal Menus and Async Controls

Portal-backed menus, dropdowns, modals, and submenus often render a tick after the trigger interaction. Wait for the opened UI before clicking nested items:

```tsx
await user.click(screen.getByRole('button', { name: /more actions/i }))

const menu = (await screen.findAllByRole('menu')).at(-1)!
await user.click(
    await within(menu).findByRole('menuitem', { name: /assign to team/i }),
)
```

Prefer `findBy*` queries when the next step needs an element that appears after async data or a portal render:

```tsx
await user.click(screen.getByRole('button', { name: /status/i }))

const lunchBreakOption = await screen.findByRole('option', {
    name: /lunch break/i,
})
await user.click(lunchBreakOption)
```

If a control is enabled after async data, wait for that state first:

```tsx
const mergeButton = await screen.findByRole('button', { name: /merge/i })

await waitFor(() => {
    expect(mergeButton).toBeEnabled()
})

await user.click(mergeButton)
```

When a test closes and reopens a dropdown, dialog, or async select, discard previous handles and query the reopened UI again:

```tsx
await user.keyboard('{Escape}')
await waitFor(() => {
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
})

await user.click(await screen.findByRole('button', { name: /tags/i }))
const reopenedSearchbox = await screen.findByRole('searchbox')
await user.type(reopenedSearchbox, 'vip')
```

Reusable opener helpers should return a fresh ready element and can guard against already-open triggers:

```tsx
async function openTagsDropdown(user: UserEvent) {
    const trigger = await screen.findByRole('button', { name: /tags/i })

    if (trigger.getAttribute('aria-expanded') !== 'true') {
        await user.click(trigger)
    }

    return screen.findByRole('searchbox')
}
```

## Accessible Selectors

```tsx
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { level: 1 })
screen.getByText('Submit')
screen.getByLabelText('Email address')
screen.queryByText('Error message')
screen.getByPlaceholderText('Search...')

// LAST RESORT ONLY
screen.getByTestId('submit-button')
```

## User Interactions

```tsx
it('handles form submission', async () => {
    const { user } = renderComponent()

    await waitFor(() => {
        expect(
            screen.getByRole('textbox', { name: /name/i }),
        ).toBeInTheDocument()
    })

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'John')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
        expect(screen.getByText('Saved successfully')).toBeInTheDocument()
    })
})
```

If you hit an `act()` warning, do **not** default to `await act(() => user.click(...))`. React notes that Testing Library helpers are already wrapped in `act()`: <https://react.dev/reference/react/act>.

Instead:

```typescript
// 1. Ensure the interaction is awaited
await user.click(button)

// 2. Wait for a visible outcome or request boundary
await waitFor(() => {
    expect(screen.getByText('Saved successfully')).toBeInTheDocument()
})

// 3. Use act() only for timer or manual state transitions that RTL does not wrap
act(() => {
    vi.advanceTimersByTime(300) // Use jest.advanceTimersByTime(...) in apps/helpdesk
})
```

## Multiple Interactions

```tsx
await user.clear(screen.getByRole('textbox'))
await user.type(screen.getByRole('textbox'), 'new value')
await user.click(screen.getByRole('button', { name: /save/i }))
```

## Handler Overrides for Specific Tests

```tsx
it('handles error state', async () => {
    const { handler } = mockGetTicketHandler(async () =>
        HttpResponse.json({ error: { msg: 'Not found' } }, { status: 404 }),
    )
    server.use(handler)

    renderComponent({ ticketId: 999 })

    await waitFor(() => {
        expect(screen.getByText(/not found/i)).toBeInTheDocument()
    })
})
```

## Request Assertions

```tsx
it('sends correct data on submit', async () => {
    const waitForRequest = mockUpdateTicket.waitForRequest(server)
    const { user } = renderComponent()

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

## Timer-Driven Tests

Only use fake timers for debounce or explicit timer behavior. Testing Library recommends wiring `advanceTimers` into `userEvent.setup()` and flushing pending timers before restoring real timers:

```tsx
beforeEach(() => {
    vi.useFakeTimers() // Use jest.useFakeTimers() in apps/helpdesk
})

afterEach(() => {
    vi.runOnlyPendingTimers() // Use jest.runOnlyPendingTimers() in apps/helpdesk
    vi.useRealTimers() // Use jest.useRealTimers() in apps/helpdesk
})

it('submits after the debounce window', async () => {
    const user = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime,
    })

    renderComponent()

    await user.type(screen.getByRole('textbox', { name: /search/i }), 'shoe')

    act(() => {
        vi.advanceTimersByTime(300) // Use jest.advanceTimersByTime(...) in apps/helpdesk
    })

    await waitFor(() => {
        expect(screen.getByText('Results')).toBeInTheDocument()
    })
})
```

## Common Patterns

### Loading State

```tsx
it('shows loading state', () => {
    renderComponent()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

### Empty State

```tsx
it('shows empty state when no data', async () => {
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
// Don't use fireEvent when userEvent works
fireEvent.click(button)

// Don't use getByTestId when an accessible query works
screen.getByTestId('submit-button')

// Don't forget await on userEvent methods
user.click(button)

// Don't share a module-scoped QueryClient in a generic consumer test
const queryClient = createTestQueryClient()

// Don't mock core providers, routing, cache, or SDK query hooks
vi.mock('@gorgias/axiom')
vi.mock('react-router-dom')
vi.mock('@tanstack/react-query')
vi.mock('@gorgias/helpdesk-queries', () => ({ useListTickets: vi.fn() }))

// Don't wait on query internals when a UI or request assertion would work
await waitFor(() => {
    expect(queryClient.isFetching()).toBe(0)
})

// Don't use generic retry-click helpers or click twice to "unstick" the UI
await user.click(button)
await user.click(button)

// Don't use index-based selectors when a role/name or scoped query is possible
screen.getAllByRole('button')[1]

// Don't test implementation details
expect(component.state.isOpen).toBe(true)

// Don't create manual mocks for API calls
vi.mock('../api', () => ({ fetchTicket: vi.fn() }))
```

Mocking `@gorgias/axiom`, `react-router`, `react-router-dom`, `@tanstack/react-query`, or `@gorgias/*-queries` is a severe anti-pattern. Use shared render helpers for providers/router/query setup and SDK MSW handlers for API responses instead.
