import { render, screen } from '@testing-library/react'

import type { TicketCompact, TicketTag } from '@gorgias/helpdesk-queries'

import { TicketStatus } from 'business/types/ticket'
import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'
import TicketFields from 'timeline/TicketFields'

import { TicketAssignee } from '../TicketAssignee'
import { TicketHeader } from '../TicketHeader'

jest.mock('pages/tickets/detail/components/TicketDetails/TicketTags', () =>
    jest.fn(() => <div>A tag</div>),
)
jest.mock('timeline/TicketFields', () => jest.fn(() => null))
jest.mock('../TicketAssignee', () => ({
    TicketAssignee: jest.fn(() => <div>An assignee</div>),
}))

describe('TicketHeader', () => {
    const ticket = {
        id: 1234,
        channel: 'email',
        status: TicketStatus.Closed,
        subject: 'Ticket Subject',
        tags: [] as TicketTag[],
    } as TicketCompact

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
        render(
            <TicketHeader
                ticket={ticket}
                additionalActions={<ActionButton />}
            />,
        )

        expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('should render the tags', () => {
        const { rerender } = render(<TicketHeader ticket={ticket} />)

        expect(screen.getByText(/no tags/i)).toBeInTheDocument()

        const tag = {
            name: 'Tag 1',
            decoration: {
                color: 'red',
            },
            id: 1,
        } as TicketTag

        rerender(
            <TicketHeader
                ticket={{
                    ...ticket,
                    tags: [tag],
                }}
            />,
        )

        expect(TicketTags).toHaveBeenCalledWith(
            expect.objectContaining({
                ticketTags: [tag],
                isDisabled: true,
            }),
            {},
        )
    })

    it('should render the assignee', () => {
        render(<TicketHeader ticket={ticket} />)

        expect(TicketAssignee).toHaveBeenCalledWith(
            expect.objectContaining({
                assignedAgent: ticket.assignee_user,
                assignedTeam: ticket.assignee_team,
            }),
            {},
        )
    })

    it('should render the ticket fields', () => {
        render(<TicketHeader ticket={ticket} />)

        expect(TicketFields).toHaveBeenCalledWith(
            {
                fieldValues: ticket.custom_fields,
                isMultiline: true,
                isBold: true,
            },
            {},
        )
    })
})
