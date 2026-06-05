# Mocks Package Guide

Provides [MSW](https://mswjs.io/) mock handlers and fixture generators for testing.

## Fixtures

Fixture generators for all API schemas from the OpenAPI `components` section. Uses `examples`/`default` from spec, correct `enum` values, random data only for properties without defined examples.

**Naming**: `mock + PascalCase(<SchemaName>)`

```tsx
import { mockTicket, mockUser } from '@gorgias/helpdesk-mocks'

const ticket = mockTicket() // fully typed as Ticket
const user = mockUser()     // fully typed as User
```

### Overriding Properties

```tsx
import { mockTicket } from '@gorgias/helpdesk-mocks'

const ticket = mockTicket({ subject: 'New subject' })
console.log(ticket.subject) // => 'New subject'
```

## Request Mocks (MSW Handlers)

Pre-filled MSW handlers for each API operation with correct request properties and fixture-based responses. Work with both client handlers and React Query hooks.

**Naming**: `mock + PascalCase(<OperationID>) + Handler`

### Basic Usage

```tsx
import { setupServer } from 'msw/node'
import { mockGetTicketHandler } from '@gorgias/helpdesk-mocks'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('<TicketsDetails />', () => {
    it('should render a valid ticket', async () => {
        const getTicketMock = mockGetTicketHandler()
        server.use(getTicketMock.handler)

        render(<TicketsDetails ticketId={1} />)

        await waitFor(() => {
            expect(screen.getByText(getTicketMock.data.data.subject)).toBeInTheDocument()
        })
    })
})
```

## Overriding Response Data

Customize the response via a callback receiving `{ data }`:

```tsx
import { HttpResponse } from 'msw'
import { mockGetTicketHandler } from '@gorgias/helpdesk-mocks'

const getTicketMock = mockGetTicketHandler(({ data }) => {
    return HttpResponse.json({
        data: {
            ...data,
            subject: 'Expected subject',
        },
    })
})
```

## Mocking Error Paths

Test error handling by returning error responses:

```tsx
import { HttpResponse } from 'msw'
import { mockGetTicketHandler } from '@gorgias/helpdesk-mocks'

const getTicketMock = mockGetTicketHandler(({ request, data }) => {
    return HttpResponse.json({
        error: { message: 'Failed to load ticket' },
    }, { status: 500 })
})
```

## Asserting on Request Payloads

Use `waitForRequest` helper (generally discouraged per [MSW best practices](https://mswjs.io/docs/best-practices/avoid-request-assertions/), but sometimes necessary):

```tsx
import { mockCreateTicketHandler } from '@gorgias/helpdesk-mocks'

it('should create a ticket with the given subject', async () => {
    const createTicketMock = mockCreateTicketHandler()
    const waitForRequest = createTicketMock.waitForRequest(server)

    render(<CreateTicketForm />)

    userEvent.type(screen.getByRole('textbox', { name: 'Subject' }), 'Hello World!')
    userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitForRequest(async (request: Request) => {
        const requestBody = await request.json()
        expect(requestBody).toEqual({
            subject: 'Hello World!',
        })
    })
})
```
