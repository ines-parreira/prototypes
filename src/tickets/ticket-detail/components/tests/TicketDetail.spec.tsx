import { render, screen } from '@testing-library/react'

import type { Ticket } from '@gorgias/api-queries'

import { assumeMock } from 'utils/testing'

import { useTicket } from '../../hooks/useTicket'
import { TicketDetail } from '../TicketDetail'

jest.mock('../../hooks/useTicket', () => ({ useTicket: jest.fn() }))
const useTicketMock = assumeMock(useTicket)

describe('TicketDetail', () => {
    beforeEach(() => {
        useTicketMock.mockReturnValue({ isLoading: true, ticket: undefined })
    })

    it('should render nothing while the page is loading', () => {
        const { container } = render(<TicketDetail ticketId={1} />)
        expect(container).toBeEmptyDOMElement()
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
