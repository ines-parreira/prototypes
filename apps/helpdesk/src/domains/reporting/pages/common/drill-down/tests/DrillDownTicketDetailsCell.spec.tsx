import React from 'react'

import { render, screen } from '@testing-library/react'

import { TicketChannel, TicketStatus } from 'business/types/ticket'
import { DrillDownTicketDetailsCell } from 'domains/reporting/pages/common/drill-down/DrillDownTicketDetailsCell'

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
        const { container } = render(
            <DrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    isRead: false,
                }}
            />,
        )

        expect(container.firstChild).toHaveClass('highlighted')
    })

    it('should render with subject fallback when missing', () => {
        render(
            <DrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    subject: null,
                }}
            />,
        )

        expect(
            screen.getByText(`Ticket ${ticketDetails.id}`),
        ).toBeInTheDocument()
    })
})
