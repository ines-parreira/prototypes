import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockGetTicketHandler,
    mockListTeamsHandler,
    mockListUsersHandler,
    mockTicket,
    mockTicketCustomer,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../tests/render.utils'
import { TicketHeader } from '../TicketHeader'

const server = setupServer()

const mockListTeams = mockListTeamsHandler()
const mockListUsers = mockListUsersHandler()
const mockGetCurrentUser = mockGetCurrentUserHandler()

const defaultMockTicket = mockTicket({
    id: 1234,
    customer: mockTicketCustomer({ name: 'John Doe', id: 1234 }),
    subject: 'Test ticket',
    trashed_datetime: null,
})
const mockGetTicket = mockGetTicketHandler(async () =>
    HttpResponse.json(defaultMockTicket),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(
        mockListTeams.handler,
        mockListUsers.handler,
        mockGetCurrentUser.handler,
        mockGetTicket.handler,
    )
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('TicketHeader', () => {
    it('should render an empty div if the ticket is not yet loaded', () => {
        const { container } = render(<TicketHeader ticketId={999999} />)
        expect(container.firstChild).toBeEmptyDOMElement()
    })

    it('should render the customer name and ticket subject', async () => {
        render(<TicketHeader ticketId={1234} />)

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: 'John Doe' }),
            ).toHaveAttribute('href', '/app/customer/1234')
        })
        expect(screen.getByText('Test ticket')).toBeInTheDocument()
    })

    describe('TrashedTicket', () => {
        it('should not render the trash tag when trashed_datetime is null', async () => {
            render(<TicketHeader ticketId={defaultMockTicket.id} />)

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument()
            })

            expect(screen.queryByText('Trash')).not.toBeInTheDocument()
        })

        it('should render the trash tag when trashed_datetime is present', async () => {
            const { handler } = mockGetTicketHandler(async () =>
                HttpResponse.json({
                    ...defaultMockTicket,
                    trashed_datetime: '2025-01-15T10:30:00Z',
                }),
            )
            server.use(handler)

            render(<TicketHeader ticketId={defaultMockTicket.id} />)

            await waitFor(() => {
                expect(screen.getByText('Trash')).toBeInTheDocument()
            })
        })
    })
})
