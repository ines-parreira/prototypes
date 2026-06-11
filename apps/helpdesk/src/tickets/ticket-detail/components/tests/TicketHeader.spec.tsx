import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import copyToClipboard from 'copy-to-clipboard'

import type { TicketCompact, TicketTag } from '@gorgias/helpdesk-queries'

import { TicketStatus } from 'business/types/ticket'
import { TicketTags } from 'pages/tickets/detail/components/TicketDetails/TicketTags'
import { useTicketModalContext } from 'timeline/ticket-modal/hooks/useTicketModalContext'
import { TicketFields } from 'timeline/TicketFields'

import { TicketAssignee } from '../TicketAssignee'
import { TicketHeader } from '../TicketHeader'

jest.mock('pages/tickets/detail/components/TicketDetails/TicketTags', () => ({
    TicketTags: jest.fn(() => <div>A tag</div>),
}))
jest.mock('timeline/TicketFields', () => ({
    TicketFields: jest.fn(() => null),
}))
jest.mock('../TicketAssignee', () => ({
    TicketAssignee: jest.fn(() => <div>An assignee</div>),
}))

jest.mock('copy-to-clipboard', () => jest.fn(() => true))

jest.mock('timeline/ticket-modal/hooks/useTicketModalContext', () => ({
    useTicketModalContext: jest.fn(),
}))
const useTicketModalContextMock = assumeMock(useTicketModalContext)

describe('TicketHeader', () => {
    const ticket = {
        id: 1234,
        channel: 'email',
        status: TicketStatus.Closed,
        subject: 'Ticket Subject',
        tags: [] as TicketTag[],
    } as TicketCompact

    beforeEach(() => {
        useTicketModalContextMock.mockReturnValue({
            isInsideTicketModal: false,
            containerRef: null,
            isInsideSidePanel: false,
        })
    })

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

    it('should render the copy button for ticket ID', async () => {
        const user = userEvent.setup()
        render(<TicketHeader ticket={ticket} />)

        const copyButton = screen.getByRole('button', { name: /content_copy/i })
        expect(copyButton).toBeInTheDocument()

        await user.click(copyButton)

        expect(copyToClipboard).toHaveBeenCalledWith('1234')
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
                ticket: ticket,
                isMultiline: true,
                isBold: true,
            },
            {},
        )
    })

    it('should set data-rendering to "modal" when not inside side panel', () => {
        const { container } = render(<TicketHeader ticket={ticket} />)
        const headerContainer = container.firstChild as HTMLElement
        expect(headerContainer).toHaveAttribute('data-rendering', 'modal')
    })

    it('should set data-rendering to "side-panel" when inside side panel', () => {
        useTicketModalContextMock.mockReturnValue({
            isInsideTicketModal: true,
            containerRef: null,
            isInsideSidePanel: true,
        })
        const { container } = render(<TicketHeader ticket={ticket} />)
        const headerContainer = container.firstChild as HTMLElement
        expect(headerContainer).toHaveAttribute('data-rendering', 'side-panel')
    })
})
