import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

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

    it('should render the close button if an `onClose` function is given', () => {
        const onClose = jest.fn()
        render(<TicketHeader ticket={ticket} onClose={onClose} />)

        const el = screen.getByText('close')
        userEvent.click(el)
        expect(onClose).toHaveBeenCalled()
    })
})
