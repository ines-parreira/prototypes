import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import type { TicketDetails } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { DrillDownTicketDetailsCell } from 'domains/reporting/pages/common/drill-down/DrillDownTicketDetailsCell'

const baseTicket: TicketDetails = {
    id: 42,
    subject: 'Order issue',
    description: 'Customer cannot track order',
    channel: null,
    isRead: true,
    created: null,
    contactReason: null,
    status: 'open' as any,
    isDeleted: false,
}

describe('DrillDownTicketDetailsCell', () => {
    it('renders subject and description for a normal ticket', () => {
        render(<DrillDownTicketDetailsCell ticketDetails={baseTicket} />)

        expect(screen.getByText('Order issue')).toBeInTheDocument()
        expect(
            screen.getByText('Customer cannot track order'),
        ).toBeInTheDocument()
        expect(screen.queryByText('Deleted ticket')).not.toBeInTheDocument()
    })

    it('falls back to "Ticket {id}" when subject is null', () => {
        render(
            <DrillDownTicketDetailsCell
                ticketDetails={{ ...baseTicket, subject: null }}
            />,
        )

        expect(screen.getByText('Ticket 42')).toBeInTheDocument()
    })

    it('shows "Deleted ticket" in the description slot when isDeleted is true', () => {
        render(
            <DrillDownTicketDetailsCell
                ticketDetails={{
                    ...baseTicket,
                    subject: null,
                    description: null,
                    isDeleted: true,
                }}
            />,
        )

        expect(screen.getByText('Ticket 42')).toBeInTheDocument()
        expect(screen.getByText('Deleted ticket')).toBeInTheDocument()
    })
})
