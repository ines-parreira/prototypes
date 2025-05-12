import { render, screen } from '@testing-library/react'

import type { TicketSummary } from '@gorgias/api-queries'

import { TicketStatus } from 'business/types/ticket'

import { TicketHeader } from '../TicketHeader'

describe('TicketHeader', () => {
    const ticket = {
        id: 1234,
        channel: 'email',
        status: TicketStatus.Closed,
        subject: 'Ticket Subject',
    } as TicketSummary

    it('should render the ticket metadata', () => {
        render(<TicketHeader ticket={ticket} />)

        expect(screen.getByText('email')).toBeInTheDocument()
        expect(screen.getByText('Ticket Subject')).toBeInTheDocument()
        expect(screen.getByText('closed')).toBeInTheDocument()
        expect(screen.getByText('ID: 1234')).toBeInTheDocument()
    })

    it('should render the "open" badge if a ticket is open', () => {
        render(
            <TicketHeader ticket={{ ...ticket, status: TicketStatus.Open }} />,
        )

        expect(screen.getByText('open')).toBeInTheDocument()
    })

    it('should render the "open" badge if a ticket has no status', () => {
        render(<TicketHeader ticket={{ ...ticket, status: undefined }} />)

        expect(screen.getByText('open')).toBeInTheDocument()
    })

    it('should render the "snoozed" badge if a ticket is snoozed', () => {
        render(
            <TicketHeader
                ticket={{ ...ticket, snooze_datetime: '2025-04-15T16:23:47' }}
            />,
        )

        expect(screen.getByText('snoozed')).toBeInTheDocument()
    })

    it('should render the provided additional action', () => {
        const ActionButton = () => <button>Action</button>
        render(<TicketHeader ticket={ticket} AdditionalAction={ActionButton} />)

        expect(screen.getByText('Action')).toBeInTheDocument()
    })
})
