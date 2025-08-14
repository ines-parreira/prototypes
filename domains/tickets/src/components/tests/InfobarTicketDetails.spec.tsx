import { render, screen } from '@testing-library/react'

import { InfobarTicketDetails } from '../InfobarTicketDetails'

describe('InfobarTicketDetails', () => {
    it('should render the ticket details', () => {
        render(<InfobarTicketDetails />)
        expect(screen.getByTestId('ticket-details')).toBeInTheDocument()
    })
})
