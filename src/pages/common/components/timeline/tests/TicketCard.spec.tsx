import React from 'react'

import { render, screen } from '@testing-library/react'

import '@testing-library/jest-dom'

import { TicketSummary } from '@gorgias/api-queries'
import { TicketStatus } from '@gorgias/api-types'

import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import { SourceBadge } from '../SourceBadge'
import TicketCard from '../TicketCard'

jest.mock('pages/common/utils/DatetimeLabel', () => jest.fn(() => <div />))
jest.mock('../SourceBadge', () => ({
    SourceBadge: jest.fn(() => <div />),
}))

const ticket = {
    id: 1,
    channel: 'email',
    subject: 'Test Subject',
    status: TicketStatus.Open,
    snooze_datetime: null,
    last_message_datetime: '2023-01-01T00:00:00Z',
    created_datetime: '2023-01-01T00:00:00Z',
    excerpt: 'Test Excerpt',
    assignee_user: { name: 'Agent Name' },
    assignee_team: { name: 'Team Name' },
    messages_count: 1,
} as TicketSummary

describe('TicketCard', () => {
    it('should render the ticket info', () => {
        render(<TicketCard ticket={ticket} isHighlighted={false} />)

        expect(screen.getByText('Test Subject')).toBeInTheDocument()
        expect(screen.getByText('Test Excerpt')).toBeInTheDocument()
        expect(screen.getByText('Agent Name')).toBeInTheDocument()
        expect(screen.getByText('Team Name')).toBeInTheDocument()
        expect(screen.getByText('open')).toBeInTheDocument()
        expect(screen.getByText(/ID: 1/)).toBeInTheDocument()
        expect(SourceBadge).toHaveBeenCalledWith(
            {
                channel: ticket.channel,
            },
            {},
        )
        expect(DatetimeLabel).toHaveBeenCalledWith(
            {
                dateTime: ticket.last_message_datetime,
            },
            {},
        )
    })

    it("should correctly render ticket's message count", () => {
        render(<TicketCard ticket={ticket} isHighlighted={false} />)

        expect(screen.getByText(/1 message/)).toBeInTheDocument()

        const ticketWithMultipleMessages = {
            ...ticket,
            messages_count: 2,
        }

        render(
            <TicketCard
                ticket={ticketWithMultipleMessages}
                isHighlighted={false}
            />,
        )

        expect(screen.getByText(/2 messages/)).toBeInTheDocument()
    })

    it('highlights the ticket card when isHighlighted is true', () => {
        const { container, rerender } = render(
            <TicketCard ticket={ticket} isHighlighted={true} />,
        )
        expect(container.firstChild).toHaveClass('highlight')

        rerender(<TicketCard ticket={ticket} />)

        expect(container.firstChild).not.toHaveClass('highlight')
    })

    it("should render snoozed status when ticket's snooze_datetime is set", () => {
        render(
            <TicketCard
                ticket={{
                    ...ticket,
                    status: TicketStatus.Closed,
                    snooze_datetime: '2023-01-01T00:00:00Z',
                }}
            />,
        )

        expect(screen.getByText('snoozed')).toBeInTheDocument()
    })
})
