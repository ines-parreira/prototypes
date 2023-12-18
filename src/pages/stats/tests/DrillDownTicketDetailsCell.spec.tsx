import React from 'react'
import {render, screen} from '@testing-library/react'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'

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
        created: '2023-01-31T00:00',
        contactReason: 'some reason',
    }

    it('should render cell', () => {
        render(<DrillDownTicketDetailsCell ticketDetails={ticketDetails} />)

        expect(screen.getByText(subject)).toBeInTheDocument()
    })

    it('should render with highlight class name', () => {
        const {container} = render(
            <DrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    isRead: false,
                }}
            />
        )

        expect(container.firstChild).toHaveClass('highlighted')
    })

    it('should render with placeholder for missing channel', () => {
        render(
            <DrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    isRead: false,
                    channel: null,
                }}
            />
        )

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})
