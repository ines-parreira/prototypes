import { render, screen } from '@testing-library/react'

import { InfobarTicketDetails } from '../InfobarTicketDetails'

describe('InfobarTicketDetails', () => {
    it('should render the ticket details', () => {
        render(<InfobarTicketDetails ticketSummaryIcon={null} />)
        expect(screen.getByText('Ticket details')).toBeInTheDocument()
    })

    it('should render the given `ticketSummaryIcon`', () => {
        render(
            <InfobarTicketDetails
                ticketSummaryIcon={<p>TicketSummaryIcon</p>}
            />,
        )
        expect(screen.getByText('TicketSummaryIcon')).toBeInTheDocument()
    })
})
