import { screen } from '@testing-library/react'

import { render } from '../../../tests/render.utils'
import { InfobarTicketDetails } from '../InfobarTicketDetails'

const baseProps = {
    onEditCustomer: vi.fn(),
    onSyncToShopify: vi.fn(),
    hasShopifyIntegration: false,
}

describe('InfobarTicketDetails', () => {
    it('should render the ticket details', () => {
        render(
            <InfobarTicketDetails {...baseProps} ticketSummaryIcon={null} />,
            {
                initialEntries: ['/tickets/12345'],
                path: '/tickets/:ticketId',
            },
        )
        expect(screen.getByText('Ticket details')).toBeInTheDocument()
    })

    it('should render the given `ticketSummaryIcon`', () => {
        render(
            <InfobarTicketDetails
                {...baseProps}
                ticketSummaryIcon={<p>TicketSummaryIcon</p>}
            />,
            {
                initialEntries: ['/tickets/12345'],
                path: '/tickets/:ticketId',
            },
        )
        expect(screen.getByText('TicketSummaryIcon')).toBeInTheDocument()
    })
})
