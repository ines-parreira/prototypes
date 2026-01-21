import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import type { Ticket, TicketCompact } from '@gorgias/helpdesk-queries'

import { useTicketModalContext } from 'timeline/ticket-modal/hooks/useTicketModalContext'

import { useTicket } from '../../hooks/useTicket'
import { TicketDetail } from '../TicketDetail'
import { TicketHeader } from '../TicketHeader'

jest.mock('@gorgias/axiom', () => ({
    LegacyLoadingSpinner: () => <div>LoadingSpinner</div>,
}))

jest.mock('../../hooks/useTicket', () => ({ useTicket: jest.fn() }))
const useTicketMock = assumeMock(useTicket)

jest.mock('timeline/ticket-modal/hooks/useTicketModalContext', () => ({
    useTicketModalContext: jest.fn(),
}))
const useTicketModalContextMock = assumeMock(useTicketModalContext)

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
        useTicketModalContextMock.mockReturnValue({
            isInsideTicketModal: false,
            containerRef: null,
            isInsideSidePanel: false,
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

    it('should set data-rendering to "modal" when not inside side panel', () => {
        const { container } = render(<TicketDetail ticketId={1} />)
        const ticketDetailContainer = container.firstChild as HTMLElement
        expect(ticketDetailContainer).toHaveAttribute('data-rendering', 'modal')
    })

    it('should set data-rendering to "side-panel" when inside side panel', () => {
        useTicketModalContextMock.mockReturnValue({
            isInsideTicketModal: true,
            containerRef: null,
            isInsideSidePanel: true,
        })
        const { container } = render(<TicketDetail ticketId={1} />)
        const ticketDetailContainer = container.firstChild as HTMLElement
        expect(ticketDetailContainer).toHaveAttribute(
            'data-rendering',
            'side-panel',
        )
    })
})
