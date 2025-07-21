import { render, screen } from '@testing-library/react'

import { TicketCompact } from '@gorgias/helpdesk-queries'
import { TicketStatus } from '@gorgias/helpdesk-types'

import { SourceBadge } from '../../tickets/ticket-detail/components/SourceBadge'
import TicketCard from '../TicketCard'
import TicketFields from '../TicketFields'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
jest.mock('pages/common/utils/DatetimeLabel', () => jest.fn(() => <div />))
jest.mock('tickets/ticket-detail/components/SourceBadge', () => ({
    SourceBadge: jest.fn(() => <div />),
}))
jest.mock('../TicketFields', () => jest.fn(() => <div />))

const ticket = {
    id: 1,
    channel: 'email',
    subject: 'Test Subject',
    status: TicketStatus.Open,
    snooze_datetime: null,
    last_message_datetime: '2023-01-01T00:00:00Z',
    created_datetime: '2023-01-01T00:00:00Z',
    assignee_user: { name: 'Agent Name' },
    assignee_team: { name: 'Team Name' },
    messages_count: 1,
} as TicketCompact

const defaultProps = {
    ticket,
    displayedDate: <span>my displayed date</span>,
}

describe('TicketCard', () => {
    it('should render the ticket info', () => {
        render(<TicketCard {...defaultProps} />)

        expect(screen.getByText('Test Subject')).toBeInTheDocument()
        expect(screen.getByText('Agent Name')).toBeInTheDocument()
        expect(screen.getByText('Team Name')).toBeInTheDocument()
        expect(screen.getByText('open')).toBeInTheDocument()
        expect(screen.getByText(/ID: 1/)).toBeInTheDocument()
        expect(screen.getByText('my displayed date')).toBeInTheDocument()
        expect(SourceBadge).toHaveBeenCalledWith(
            {
                channel: ticket.channel,
                size: 'small',
            },
            {},
        )
    })

    it("should correctly render ticket's message count", () => {
        render(<TicketCard {...defaultProps} />)

        expect(screen.getByText(/1 message/)).toBeInTheDocument()

        const ticketWithMultipleMessages = {
            ...ticket,
            messages_count: 2,
        }

        render(
            <TicketCard
                {...defaultProps}
                ticket={ticketWithMultipleMessages}
            />,
        )

        expect(screen.getByText(/2 messages/)).toBeInTheDocument()
    })

    it('highlights the ticket card when isHighlighted is true', () => {
        const { container, rerender } = render(
            <TicketCard {...defaultProps} isHighlighted={true} />,
        )
        expect(container.firstChild).toHaveClass('highlight')

        rerender(<TicketCard {...defaultProps} />)

        expect(container.firstChild).not.toHaveClass('highlight')
    })

    it("should render snoozed status when ticket's snooze_datetime is set", () => {
        render(
            <TicketCard
                {...defaultProps}
                ticket={{
                    ...ticket,
                    status: TicketStatus.Closed,
                    snooze_datetime: '2023-01-01T00:00:00Z',
                }}
            />,
        )

        expect(screen.getByText('snoozed')).toBeInTheDocument()
    })

    it('should call TicketFields component with correct props', () => {
        render(<TicketCard {...defaultProps} />)

        expect(TicketFields).toHaveBeenCalledWith(
            {
                fieldValues: ticket.custom_fields,
                className: expect.any(String),
            },
            {},
        )
    })
})
