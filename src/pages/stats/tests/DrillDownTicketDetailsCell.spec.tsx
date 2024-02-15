import React from 'react'
import {render, screen} from '@testing-library/react'
import {NOT_AVAILABLE_PLACEHOLDER} from 'pages/stats/common/utils'

import {TicketChannel, TicketStatus} from 'business/types/ticket'
import {DrillDownTicketDetailsCell} from 'pages/stats/DrillDownTicketDetailsCell'

describe('<DrillDownTicketDetailsCell />', () => {
    const subject = 'Ticket subject'
    const ticketDetails = {
        id: 1,
        channel: TicketChannel.Chat,
        subject,
        description: 'Ticket description',
        isRead: true,
        created: '2023-01-31T00:00',
        contactReason: 'some reason',
        status: TicketStatus.Closed,
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

    it('should render as deleted or merged when status unknown', () => {
        render(
            <DrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    status: null,
                }}
            />
        )

        expect(screen.getByText('delete')).toBeInTheDocument()
    })
})
