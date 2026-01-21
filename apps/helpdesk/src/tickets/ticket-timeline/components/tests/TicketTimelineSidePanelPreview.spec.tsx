import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { TicketCompact } from '@gorgias/helpdesk-types'
import { TicketStatus } from '@gorgias/helpdesk-types'

import { TicketChannel } from 'business/types/ticket'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { TicketTimelineSidePanelPreview } from '../TicketTimelineSidePanelPreview'

jest.mock('tickets/ticket-detail/components/TicketDetail', () => ({
    TicketDetail: ({
        ticketId,
        additionalHeaderActions,
    }: {
        ticketId: number
        additionalHeaderActions: React.ReactNode
    }) => (
        <div data-testid="ticket-detail">
            <span>Ticket #{ticketId}</span>
            {additionalHeaderActions}
        </div>
    ),
}))

jest.mock('timeline/ticket-modal/components/TicketModalProvider', () => ({
    TicketModalProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="ticket-modal-provider">{children}</div>
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
        ...overrides,
    }) as TicketCompact

describe('TicketTimelineSidePanelPreview', () => {
    const defaultProps = {
        ticket: createMockTicket(),
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
        it('should return null when ticket is null', () => {
            const { container } = renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    ticket={null}
                />,
            )

            expect(container).toBeEmptyDOMElement()
        })

        it('should render the ticket detail when ticket is provided', () => {
            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview {...defaultProps} />,
            )

            expect(screen.getByText('Ticket #123')).toBeInTheDocument()
        })

        it('should render the TicketModalProvider wrapper', () => {
            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview {...defaultProps} />,
            )

            expect(
                screen.getByTestId('ticket-modal-provider'),
            ).toBeInTheDocument()
        })
    })

    describe('Navigation buttons', () => {
        it('should render Previous and Next buttons', () => {
            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview {...defaultProps} />,
            )

            expect(
                screen.getByRole('button', { name: /previous ticket/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /next ticket/i }),
            ).toBeInTheDocument()
        })

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

        it('should enable both buttons when not first or last ticket', () => {
            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    isFirstTicket={false}
                    isLastTicket={false}
                />,
            )

            expect(
                screen.getByRole('button', { name: /previous ticket/i }),
            ).toBeEnabled()
            expect(
                screen.getByRole('button', { name: /next ticket/i }),
            ).toBeEnabled()
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

        it('should not call onPrevious when Previous button is disabled', async () => {
            const user = userEvent.setup()
            const onPrevious = jest.fn()

            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    onPrevious={onPrevious}
                    isFirstTicket={true}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /previous ticket/i }),
            )

            expect(onPrevious).not.toHaveBeenCalled()
        })

        it('should not call onNext when Next button is disabled', async () => {
            const user = userEvent.setup()
            const onNext = jest.fn()

            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    onNext={onNext}
                    isLastTicket={true}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /next ticket/i }),
            )

            expect(onNext).not.toHaveBeenCalled()
        })
    })

    describe('Expand Ticket link', () => {
        it('should render Expand Ticket button as a link', () => {
            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview {...defaultProps} />,
            )

            const expandLink = screen.getByRole('link', {
                name: /expand ticket/i,
            })
            expect(expandLink).toBeInTheDocument()
        })

        it('should have correct href with ticket id', () => {
            const ticket = createMockTicket({ id: 456 })

            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    ticket={ticket}
                />,
            )

            const expandLink = screen.getByRole('link', {
                name: /expand ticket/i,
            })
            expect(expandLink).toHaveAttribute('href', '/app/ticket/456')
        })

        it('should open in new tab', () => {
            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview {...defaultProps} />,
            )

            const expandLink = screen.getByRole('link', {
                name: /expand ticket/i,
            })
            expect(expandLink).toHaveAttribute('target', '_blank')
            expect(expandLink).toHaveAttribute('rel', 'noreferrer')
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

    describe('Edge cases', () => {
        it('should handle both isFirstTicket and isLastTicket being true (single ticket)', () => {
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

        it('should render correctly with different ticket ids', () => {
            const ticket = createMockTicket({ id: 999 })

            renderWithStoreAndQueryClientProvider(
                <TicketTimelineSidePanelPreview
                    {...defaultProps}
                    ticket={ticket}
                />,
            )

            expect(screen.getByText('Ticket #999')).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: /expand ticket/i }),
            ).toHaveAttribute('href', '/app/ticket/999')
        })
    })
})
