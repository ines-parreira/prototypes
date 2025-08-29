import { render, screen } from '@testing-library/react'
import type { Mock } from 'vitest'

import { useTicket } from '../../hooks/useTicket'
import { TicketHeader } from '../TicketHeader'

vi.mock('../../hooks/useTicket', () => ({ useTicket: vi.fn() }))
const useTicketMock = useTicket as Mock

describe('TicketHeader', () => {
    beforeEach(() => {
        useTicketMock.mockReturnValue({ data: undefined })
    })

    it('should render an empty div if the ticket is not yet loaded', () => {
        const { container } = render(<TicketHeader ticketId={1234} />)
        expect(container.firstChild).toBeEmptyDOMElement()
    })

    it('should render the customer name and ticket subject', () => {
        const ticket = {
            customer: { name: 'John Doe' },
            subject: 'Test ticket',
        }
        useTicketMock.mockReturnValue({ data: { data: ticket } })
        render(<TicketHeader ticketId={1234} />)

        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Test ticket')).toBeInTheDocument()
    })
})
