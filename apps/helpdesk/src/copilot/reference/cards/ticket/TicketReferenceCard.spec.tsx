import { screen } from '@testing-library/react'
import { useGetTicket } from '@gorgias/helpdesk-queries'
import type { Ticket } from '@gorgias/helpdesk-types'

import { render } from '@repo/testing'

import { TicketReferenceCard } from './TicketReferenceCard'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetTicket: jest.fn(),
}))

const mockUseGetTicket = useGetTicket as jest.MockedFunction<
    typeof useGetTicket
>

const baseTicket = {
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
} as unknown as Ticket

function setTicketResult(
    result: Partial<ReturnType<typeof useGetTicket>> & {
        data?: { data: Ticket } | undefined
    },
) {
    mockUseGetTicket.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
        ...result,
    } as ReturnType<typeof useGetTicket>)
}

describe('TicketReferenceCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('does not fetch the ticket while the popover is closed', () => {
        setTicketResult({})

        render(<TicketReferenceCard ticketId={42} isOpen={false} />)

        expect(mockUseGetTicket).toHaveBeenCalledWith(
            42,
            undefined,
            expect.objectContaining({
                query: expect.objectContaining({ enabled: false }),
            }),
        )
    })

    it('renders the subject, ticket id, status, and customer name', () => {
        setTicketResult({
            data: { data: baseTicket },
        })

        render(<TicketReferenceCard ticketId={42} isOpen={true} />)

        expect(screen.getByText('Where is my order?')).toBeInTheDocument()
        expect(screen.getByText('#42')).toBeInTheDocument()
        expect(screen.getByText('Open')).toBeInTheDocument()
        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })

    it('falls back to "Untitled ticket" when the subject is missing', () => {
        setTicketResult({
            data: { data: { ...baseTicket, subject: null } as Ticket },
        })

        render(<TicketReferenceCard ticketId={42} isOpen={true} />)

        expect(screen.getByText('Untitled ticket')).toBeInTheDocument()
    })

    it('renders the closed status tag', () => {
        setTicketResult({
            data: { data: { ...baseTicket, status: 'closed' } as Ticket },
        })

        render(<TicketReferenceCard ticketId={42} isOpen={true} />)

        expect(screen.getByText('Closed')).toBeInTheDocument()
    })

    it('falls back to the customer email when no name is set', () => {
        setTicketResult({
            data: {
                data: {
                    ...baseTicket,
                    customer: {
                        ...baseTicket.customer,
                        firstname: '',
                        lastname: '',
                        name: null,
                        email: 'ada@example.com',
                    },
                } as Ticket,
            },
        })

        render(<TicketReferenceCard ticketId={42} isOpen={true} />)

        expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    })

    it('renders a skeleton while loading', () => {
        setTicketResult({ isLoading: true })

        const { container } = render(
            <TicketReferenceCard ticketId={42} isOpen={true} />,
        )

        expect(screen.queryByText(/where is my order/i)).not.toBeInTheDocument()
        expect(container.textContent).toMatch(/ticket/i)
    })

    it('renders an error fallback when the fetch fails', () => {
        setTicketResult({ isError: true })

        render(<TicketReferenceCard ticketId={42} isOpen={true} />)

        expect(
            screen.getByText("Couldn't load this ticket."),
        ).toBeInTheDocument()
    })
})
