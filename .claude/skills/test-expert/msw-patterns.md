# MSW Handler Patterns

## Basic Server Setup

```tsx
import { setupServer } from 'msw/node'
import { mockGetTicketHandler, mockListTicketsHandler } from '@gorgias/helpdesk-mocks'

// Create handlers
const mockGetTicket = mockGetTicketHandler()
const mockListTickets = mockListTicketsHandler()

// Combine handlers
const localHandlers = [
    mockGetTicket.handler,
    mockListTickets.handler,
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
```

## SDK Mock Packages

| Service | Package |
|---------|---------|
| Helpdesk API | `@gorgias/helpdesk-mocks` |
| Knowledge Service | `@gorgias/knowledge-service-mocks` |
| Help Center | `@gorgias/help-center-mocks` |
| Convert | `@gorgias/convert-mocks` |
| Ecommerce Storage | `@gorgias/ecommerce-storage-mocks` |

## Handler Naming Convention

```tsx
// Response body mock
const mockGetTicketResponseBody = { ... }

// Handler mock
const mockGetTicket = mockGetTicketHandler()

// Access parts
mockGetTicket.handler  // The MSW handler
mockGetTicket.data     // Default response data
```

## Overriding Handler Responses

### Return Different Data

```tsx
it('should handle empty list', async () => {
    const { handler } = mockListTicketsHandler(async () =>
        HttpResponse.json({ data: [] })
    )
    server.use(handler)

    // Test empty state
})
```

### Return Error Response

```tsx
it('should handle 404 error', async () => {
    const { handler } = mockGetTicketHandler(async () =>
        HttpResponse.json(
            { error: { msg: 'Ticket not found' } },
            { status: 404 }
        )
    )
    server.use(handler)

    // Test error handling
})
```

### Modify Default Data

```tsx
it('should handle admin user', async () => {
    const { handler } = mockGetCurrentUserHandler(async () =>
        HttpResponse.json({
            ...mockGetCurrentUser.data,
            role: { name: 'admin' },
        })
    )
    server.use(handler)

    // Test admin-specific behavior
})
```

### Network Error

```tsx
it('should handle network failure', async () => {
    const { handler } = mockGetTicketHandler(async () =>
        HttpResponse.error()
    )
    server.use(handler)

    // Test network error handling
})
```

## Request Assertions

### Verify Request Was Made

```tsx
it('should send correct data', async () => {
    const waitForRequest = mockUpdateTicket.waitForRequest(server)
    const user = userEvent.setup()

    renderComponent()

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitForRequest(async (request) => {
        const body = await request.json()
        expect(body).toMatchObject({
            subject: 'Updated title',
        })
    })
})
```

### Check Request Parameters

```tsx
await waitForRequest(async (request) => {
    const url = new URL(request.url)
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('per_page')).toBe('25')
})
```

## Multiple Handlers

### Different Endpoints

```tsx
const mockGetTicket = mockGetTicketHandler()
const mockListMessages = mockListMessagesHandler()
const mockGetCurrentUser = mockGetCurrentUserHandler()

const localHandlers = [
    mockGetTicket.handler,
    mockListMessages.handler,
    mockGetCurrentUser.handler,
]
```

### Same Endpoint, Different Responses

```tsx
describe('ticket states', () => {
    it('should show open ticket', async () => {
        const { handler } = mockGetTicketHandler(async () =>
            HttpResponse.json({
                ...mockGetTicket.data,
                status: 'open',
            })
        )
        server.use(handler)
        // test
    })

    it('should show closed ticket', async () => {
        const { handler } = mockGetTicketHandler(async () =>
            HttpResponse.json({
                ...mockGetTicket.data,
                status: 'closed',
            })
        )
        server.use(handler)
        // test
    })
})
```

## Common Mistakes

### Missing Handler

```
Error: [MSW] Cannot bypass a request when using the "error" strategy
```

**Fix**: Add the missing handler for the endpoint being called.

### Handler Not Applied

```tsx
// ❌ WRONG - Handler created but not used
const mockGetTicket = mockGetTicketHandler()
// Missing: server.use(mockGetTicket.handler)

// ✅ CORRECT
server.use(mockGetTicket.handler)
```

### Stale Handler Reference

```tsx
// ❌ WRONG - Creating handler outside describe
const { handler } = mockGetTicketHandler(async () => HttpResponse.json({}))

// ✅ CORRECT - Create in test or beforeEach
it('test', () => {
    const { handler } = mockGetTicketHandler(...)
    server.use(handler)
})
```
