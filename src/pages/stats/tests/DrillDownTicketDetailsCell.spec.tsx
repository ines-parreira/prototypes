import React from 'react'
import {render, screen} from '@testing-library/react'

import {TicketMessageSourceType} from 'business/types/ticket'
import {DrillDownTicketDetailsCell} from 'pages/stats/DrillDownTicketDetailsCell'

describe('<DrillDownTicketDetailsCell />', () => {
    const subject = 'Ticket subject'
    const ticketDetails = {
        id: 1,
        channel: TicketMessageSourceType.FacebookMessage,
        subject,
        description: 'Ticket description',
        isRead: true,
    }

    it('should render cell', () => {
        render(<DrillDownTicketDetailsCell ticketDetails={ticketDetails} />)

        expect(screen.getByText(subject)).toBeInTheDocument()
    })

    it('should render with highlight class name', () => {
        render(
            <DrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    isRead: false,
                }}
            />
        )

        expect(screen.getByRole('link')).toHaveClass('highlighted')
    })
})
