import type { EnrichedTicket, TicketCustomField } from '@repo/tickets'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { IconName } from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'
import { TicketStatus } from '@gorgias/helpdesk-types'

import { TicketChannel } from 'business/types/ticket'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { TicketTimelineSidePanelPreview } from '../TicketTimelineSidePanelPreview'

jest.mock('../SidePanelTicketDetail', () => ({
    SidePanelTicketDetail: ({
        ticket,
        additionalHeaderActions,
        onExpand,
    }: {
        ticket: { id: number }
        customFields: unknown[]
        iconName: string
        conditionsLoading: boolean
        additionalHeaderActions: React.ReactNode
        onExpand: () => void
    }) => (
        <div>
            <span>Ticket #{ticket.id}</span>
            <button type="button" onClick={onExpand}>
                Expand ticket
            </button>
            {additionalHeaderActions}
        </div>
    ),
}))

jest.mock('timeline/ticket-modal/components/TicketModalProvider', () => ({
    TicketModalProvider: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

const createMockTicket = (
    overrides: Partial<TicketCompact> = {},
): TicketCompact =>
    ({
        id: 123,
        channel: TicketChannel.Email,
        created_datetime: '2024-01-01T10:00:00Z',
        customer: {
            id: 1,
            email: 'test@example.com',
            name: 'Test Customer',
            firstname: 'Test',
            lastname: 'Customer',
            meta: null,
        },
        excerpt: 'Test ticket excerpt',
        is_unread: false,
        last_message_datetime: '2024-01-01T12:00:00Z',
        last_received_message_datetime: '2024-01-01T11:00:00Z',
        last_sent_message_not_delivered: false,
        status: TicketStatus.Open,
        subject: 'Test ticket',
        updated_datetime: '2024-01-01T12:30:00Z',
        messages_count: 1,
        assignee_user: null,
        assignee_team: null,
        snooze_datetime: null,
        priority: undefined,
        tags: [],
        custom_fields: [],
        integrations: [],
        ...overrides,
    }) as TicketCompact

const createMockEnrichedTicket = (
    ticketOverrides: Partial<TicketCompact> = {},
): EnrichedTicket => ({
    ticket: createMockTicket(ticketOverrides),
    customFields: [] as TicketCustomField[],
    conditionsLoading: false,
    iconName: 'email' as IconName,
    evaluationResults: {},
})

describe('TicketTimelineSidePanelPreview', () => {
    const defaultProps = {
        enrichedTicket: createMockEnrichedTicket(),
        isOpen: true,
        onOpenChange: jest.fn(),
        onNext: jest.fn(),
        onPrevious: jest.fn(),
        isFirstTicket: false,
        isLastTicket: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering', () => {
        it('should not render ticket content when enrichedTicket is null', () => {
            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    enrichedTicket={null}
                />,
            )

            expect(screen.queryByText(/Ticket #/)).not.toBeInTheDocument()
        })

        it('should render the ticket detail when ticket is provided', () => {
            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview {...defaultProps} />,
            )

            expect(screen.getByText('Ticket #123')).toBeInTheDocument()
        })
    })

    describe('Navigation buttons', () => {
        it('should disable Previous button when isFirstTicket is true', () => {
            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    isFirstTicket={true}
                />,
            )

            expect(
                screen.getByRole('button', { name: /previous ticket/i }),
            ).toBeDisabled()
        })

        it('should disable Next button when isLastTicket is true', () => {
            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    isLastTicket={true}
                />,
            )

            expect(
                screen.getByRole('button', { name: /next ticket/i }),
            ).toBeDisabled()
        })

        it('should call onPrevious when Previous button is clicked', async () => {
            const user = userEvent.setup()
            const onPrevious = jest.fn()

            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    onPrevious={onPrevious}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /previous ticket/i }),
            )

            expect(onPrevious).toHaveBeenCalledTimes(1)
        })

        it('should call onNext when Next button is clicked', async () => {
            const user = userEvent.setup()
            const onNext = jest.fn()

            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    onNext={onNext}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /next ticket/i }),
            )

            expect(onNext).toHaveBeenCalledTimes(1)
        })

        it('should disable both buttons when there is only one ticket', () => {
            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    isFirstTicket={true}
                    isLastTicket={true}
                />,
            )

            expect(
                screen.getByRole('button', { name: /previous ticket/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /next ticket/i }),
            ).toBeDisabled()
        })
    })

    describe('Close button', () => {
        it('should call onOpenChange with false when close button is clicked', async () => {
            const user = userEvent.setup()
            const onOpenChange = jest.fn()

            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    onOpenChange={onOpenChange}
                />,
            )

            const closeButton = screen.getByRole('button', {
                name: /close preview/i,
            })
            await user.click(closeButton)

            expect(onOpenChange).toHaveBeenCalledWith(false)
        })
    })
})
