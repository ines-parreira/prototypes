import { render, screen } from '@testing-library/react'

import { TicketHeader } from '../TicketHeader'

describe('TicketHeader', () => {
    it('should render the ticket header', () => {
        render(<TicketHeader />)
        expect(screen.getByTestId('ticket-header')).toBeInTheDocument()
    })
})
