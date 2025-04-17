import { render, screen } from '@testing-library/react'

import type { Ticket, TicketSummary } from '@gorgias/api-queries'

import { assumeMock } from 'utils/testing'

import { useTicket } from '../../hooks/useTicket'
import { TicketDetail } from '../TicketDetail'

jest.mock('@gorgias/merchant-ui-kit', () => ({
    LoadingSpinner: () => <div>LoadingSpinner</div>,
}))

jest.mock('../../hooks/useTicket', () => ({ useTicket: jest.fn() }))
const useTicketMock = assumeMock(useTicket)

jest.mock('../TicketHeader', () => ({
    TicketHeader: () => <div>TicketHeader</div>,
}))

describe('TicketDetail', () => {
    beforeEach(() => {
        useTicketMock.mockReturnValue({ isLoading: true, ticket: undefined })
    })

    it('should render a spinner while the page is loading', () => {
        render(<TicketDetail ticketId={1} />)
        expect(screen.queryByText('TicketHeader')).not.toBeInTheDocument()
        expect(screen.getByText('LoadingSpinner')).toBeInTheDocument()
    })

    it('should render the header if a summary is given even if the ticket is loading', () => {
        const summary = { id: 1 } as TicketSummary
        render(<TicketDetail summary={summary} ticketId={1} />)
        expect(screen.getByText('TicketHeader')).toBeInTheDocument()
        expect(screen.getByText('LoadingSpinner')).toBeInTheDocument()
    })

    it('should dump the ticket to the page once loaded', () => {
        useTicketMock.mockReturnValue({
            isLoading: false,
            ticket: { id: 1 } as Ticket,
        })
        render(<TicketDetail ticketId={1} />)
        expect(screen.getByTestId('dump')).toBeInTheDocument()
    })
})
