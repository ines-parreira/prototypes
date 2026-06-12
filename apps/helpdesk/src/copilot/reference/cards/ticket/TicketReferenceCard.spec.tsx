import { render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetTicketHandler,
    mockGetTicketResponse,
    mockTicket,
} from '@gorgias/helpdesk-mocks'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { TicketReferenceCard } from './TicketReferenceCard'

const server = setupServer()
let queryClient = mockQueryClient()

const baseTicket = mockTicket({
    id: 42,
    subject: 'Where is my order?',
    status: 'open',
    customer: {
        id: 1,
        firstname: 'Ada',
        lastname: 'Lovelace',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        channels: [],
        customer: null,
        data: null,
        external_id: null,
        integrations: {},
        meta: null,
        note: null,
    },
    created_datetime: '2025-05-15T15:00:00Z',
    updated_datetime: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
})

function renderComponent(isOpen = true) {
    queryClient = mockQueryClient()

    return render(
        <QueryClientProvider client={queryClient}>
            <TicketReferenceCard ticketId={42} isOpen={isOpen} />
        </QueryClientProvider>,
    )
}

function useTicketHandler(ticket = baseTicket) {
    server.use(
        mockGetTicketHandler(async () =>
            HttpResponse.json(mockGetTicketResponse(ticket)),
        ).handler,
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('TicketReferenceCard', () => {
    it('does not fetch the ticket while the popover is closed', () => {
        const requests: Request[] = []
        server.use(
            mockGetTicketHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(mockGetTicketResponse(baseTicket))
            }).handler,
        )

        renderComponent(false)

        expect(requests).toHaveLength(0)
    })

    it('renders the subject, ticket id, status, and customer name', async () => {
        useTicketHandler()

        renderComponent()

        expect(
            await screen.findByText('Where is my order?'),
        ).toBeInTheDocument()
        expect(screen.getByText('#42')).toBeInTheDocument()
        expect(screen.getByText('Open')).toBeInTheDocument()
        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })

    it('falls back to "Untitled ticket" when the subject is missing', async () => {
        useTicketHandler(mockTicket({ ...baseTicket, subject: null }))

        renderComponent()

        expect(await screen.findByText('Untitled ticket')).toBeInTheDocument()
    })

    it('renders the closed status tag', async () => {
        useTicketHandler(mockTicket({ ...baseTicket, status: 'closed' }))

        renderComponent()

        expect(await screen.findByText('Closed')).toBeInTheDocument()
    })

    it('falls back to the customer email when no name is set', async () => {
        useTicketHandler(
            mockTicket({
                ...baseTicket,
                customer: {
                    ...baseTicket.customer,
                    firstname: '',
                    lastname: '',
                    name: null,
                    email: 'ada@example.com',
                },
            }),
        )

        renderComponent()

        expect(await screen.findByText('ada@example.com')).toBeInTheDocument()
    })

    it('renders a skeleton while loading', () => {
        server.use(
            mockGetTicketHandler(async () => {
                await new Promise(() => undefined)

                return HttpResponse.json(mockGetTicketResponse(baseTicket))
            }).handler,
        )

        const { container } = renderComponent()

        expect(screen.queryByText(/where is my order/i)).not.toBeInTheDocument()
        expect(container.textContent).toMatch(/ticket/i)
    })

    it('renders an error fallback when the fetch fails', async () => {
        server.use(
            mockGetTicketHandler(async () =>
                HttpResponse.json(
                    { error: "Couldn't load this ticket." } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        renderComponent()

        expect(
            await screen.findByText("Couldn't load this ticket."),
        ).toBeInTheDocument()
    })
})
