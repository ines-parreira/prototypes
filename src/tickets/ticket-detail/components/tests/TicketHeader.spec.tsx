import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import copyToClipboard from 'copy-to-clipboard'

import type { TicketCompact, TicketTag } from '@gorgias/helpdesk-queries'

import { TicketStatus } from 'business/types/ticket'
import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'
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

// Mock copy-to-clipboard
jest.mock('copy-to-clipboard', () => jest.fn(() => true))

describe('TicketHeader', () => {
    const ticket = {
        id: 1234,
        channel: 'email',
        status: TicketStatus.Closed,
        subject: 'Ticket Subject',
        tags: [] as TicketTag[],
    } as TicketCompact

    it('should render the ticket metadata', () => {
        renderWithStoreAndQueryClientProvider(<TicketHeader ticket={ticket} />)

        expect(screen.getByText('email')).toBeInTheDocument()
        expect(screen.getByText('Ticket Subject')).toBeInTheDocument()
        expect(screen.getByText('closed')).toBeInTheDocument()
        expect(screen.getByText('ID: 1234')).toBeInTheDocument()
    })

    it('should render the "open" badge if a ticket is open', () => {
        renderWithStoreAndQueryClientProvider(
            <TicketHeader ticket={{ ...ticket, status: TicketStatus.Open }} />,
        )

        expect(screen.getByText('open')).toBeInTheDocument()
    })

    it('should render the "open" badge if a ticket has no status', () => {
        renderWithStoreAndQueryClientProvider(
            <TicketHeader ticket={{ ...ticket, status: undefined }} />,
        )

        expect(screen.getByText('open')).toBeInTheDocument()
    })

    it('should render the "snoozed" badge if a ticket is snoozed', () => {
        renderWithStoreAndQueryClientProvider(
            <TicketHeader
                ticket={{ ...ticket, snooze_datetime: '2025-04-15T16:23:47' }}
            />,
        )

        expect(screen.getByText('snoozed')).toBeInTheDocument()
    })

    it('should render the provided additional action', () => {
        const ActionButton = () => <button>Action</button>
        renderWithStoreAndQueryClientProvider(
            <TicketHeader
                ticket={ticket}
                additionalActions={<ActionButton />}
            />,
        )

        expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('should render the copy button for ticket ID', async () => {
        const user = userEvent.setup()
        renderWithStoreAndQueryClientProvider(<TicketHeader ticket={ticket} />)

        const copyButton = screen.getByRole('button', { name: /content_copy/i })
        expect(copyButton).toBeInTheDocument()

        await user.click(copyButton)

        expect(copyToClipboard).toHaveBeenCalledWith('1234')
    })

    it('should render the tags', () => {
        const { rerender } = renderWithStoreAndQueryClientProvider(
            <TicketHeader ticket={ticket} />,
        )

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
        renderWithStoreAndQueryClientProvider(<TicketHeader ticket={ticket} />)

        expect(TicketAssignee).toHaveBeenCalledWith(
            expect.objectContaining({
                assignedAgent: ticket.assignee_user,
                assignedTeam: ticket.assignee_team,
            }),
            {},
        )
    })

    it('should render the ticket fields', () => {
        renderWithStoreAndQueryClientProvider(<TicketHeader ticket={ticket} />)

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
