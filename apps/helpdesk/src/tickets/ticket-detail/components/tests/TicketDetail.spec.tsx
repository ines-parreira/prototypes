import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import type { Ticket, TicketCompact } from '@gorgias/helpdesk-queries'

import { useTicket } from '../../hooks/useTicket'
import { TicketDetail } from '../TicketDetail'
import { TicketHeader } from '../TicketHeader'

jest.mock('@gorgias/axiom', () => ({
    LegacyLoadingSpinner: () => <div>LoadingSpinner</div>,
}))

jest.mock('../../hooks/useTicket', () => ({ useTicket: jest.fn() }))
const useTicketMock = assumeMock(useTicket)

jest.mock('../TicketBody', () => ({
    TicketBody: jest.fn(() => <div>TicketBody</div>),
}))

jest.mock('../TicketHeader', () => ({
    TicketHeader: jest.fn(() => <div>TicketHeader</div>),
}))

describe('TicketDetail', () => {
    beforeEach(() => {
        useTicketMock.mockReturnValue({
            body: [],
            isLoading: true,
            ticket: undefined,
        })
    })

    it('should render a spinner while the page is loading', () => {
        render(<TicketDetail ticketId={1} />)
        expect(screen.queryByText('TicketHeader')).not.toBeInTheDocument()
        expect(screen.getByText('LoadingSpinner')).toBeInTheDocument()
    })

    it('should render the header if a summary is given even if the ticket is loading and pass it the right props', () => {
        const summary = { id: 1 } as TicketCompact
        const AdditionalHeaderAction = () => <button>Action</button>
        render(
            <TicketDetail
                summary={summary}
                ticketId={1}
                additionalHeaderActions={<AdditionalHeaderAction />}
            />,
        )
        expect(screen.getByText('TicketHeader')).toBeInTheDocument()
        expect(screen.getByText('LoadingSpinner')).toBeInTheDocument()

        expect(TicketHeader).toHaveBeenCalledWith(
            {
                ticket: summary,
                additionalActions: <AdditionalHeaderAction />,
            },
            {},
        )
    })

    it('should render the ticket body once the has loaded', () => {
        useTicketMock.mockReturnValue({
            body: [],
            isLoading: false,
            ticket: { id: 1 } as Ticket,
        })
        render(<TicketDetail ticketId={1} />)
        expect(screen.getByText('TicketBody')).toBeInTheDocument()
    })
})
