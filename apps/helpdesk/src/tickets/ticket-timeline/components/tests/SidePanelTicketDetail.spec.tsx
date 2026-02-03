import type { TicketCustomField } from '@repo/tickets'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { IconName } from '@gorgias/axiom'
import type { Ticket, TicketCompact } from '@gorgias/helpdesk-types'
import { TicketStatus } from '@gorgias/helpdesk-types'

import { TicketChannel } from 'business/types/ticket'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { SidePanelTicketDetail } from '../SidePanelTicketDetail'

jest.mock('tickets/ticket-detail/hooks/useTicket')
jest.mock('timeline/ticket-modal/hooks/useTicketModalContext')
jest.mock('@repo/feature-flags', () => ({
    useFlag: jest.fn(() => false),
    FeatureFlagKey: {
        TicketThreadRevamp: 'ticket_thread_revamp',
    },
}))
jest.mock('../TicketThread', () => ({
    TicketThread: ({
        ticketId,
        summary,
    }: {
        ticketId: number
        elements: unknown[]
        summary: Ticket['summary']
    }) => (
        <div data-testid="ticket-thread">
            <span>Ticket Thread #{ticketId}</span>
            {summary && <span>Summary: {summary.content}</span>}
        </div>
    ),
}))

jest.mock('../SidePanelTicketHeader', () => ({
    SidePanelTicketHeader: ({
        ticket,
        additionalActions,
        onExpand,
    }: {
        ticket: TicketCompact
        customFields: TicketCustomField[]
        conditionsLoading: boolean
        iconName: IconName
        additionalActions?: React.ReactNode
        onExpand?: () => void
    }) => (
        <div data-testid="side-panel-ticket-header">
            <span>Header for #{ticket.id}</span>
            {onExpand && (
                <button type="button" onClick={onExpand}>
                    Expand
                </button>
            )}
            {additionalActions}
        </div>
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

const createMockFullTicket = (overrides: Partial<Ticket> = {}) => {
    const baseTicket = createMockTicket()
    return {
        ...baseTicket,
        messages: [],
        summary: {
            content: 'Test summary',
            created_datetime: '2024-01-01T10:00:00Z',
            triggered_by: null,
            updated_datetime: '2024-01-01T10:00:00Z',
        },
        ...overrides,
    }
}

const createMockCustomFields = (): TicketCustomField[] => [
    {
        id: 1,
        label: 'Priority',
        value: 'high',
        shortValueLabel: 'High',
    },
]

describe('SidePanelTicketDetail', () => {
    const defaultProps = {
        ticket: createMockTicket(),
        customFields: createMockCustomFields(),
        conditionsLoading: false,
        iconName: 'email' as IconName,
        additionalHeaderActions: undefined,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        const { useTicket } = require('tickets/ticket-detail/hooks/useTicket')
        const {
            useTicketModalContext,
        } = require('timeline/ticket-modal/hooks/useTicketModalContext')

        useTicket.mockReturnValue({
            body: [],
            isLoading: false,
            ticket: createMockFullTicket(),
        })

        useTicketModalContext.mockReturnValue({
            isInsideSidePanel: true,
        })
    })

    describe('Loading state', () => {
        it('should render loading skeleton while ticket body is loading', () => {
            const {
                useTicket,
            } = require('tickets/ticket-detail/hooks/useTicket')
            useTicket.mockReturnValue({
                body: [],
                isLoading: true,
                ticket: null,
            })

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketDetail {...defaultProps} />,
            )

            expect(screen.getAllByLabelText('Loading')).toHaveLength(3)
        })

        it('should render loading skeleton when ticket is null', () => {
            const {
                useTicket,
            } = require('tickets/ticket-detail/hooks/useTicket')
            useTicket.mockReturnValue({
                body: [],
                isLoading: false,
                ticket: null,
            })

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketDetail {...defaultProps} />,
            )

            expect(screen.getAllByLabelText('Loading')).toHaveLength(3)
        })
    })

    describe('Header rendering', () => {
        it('should render SidePanelTicketHeader with correct props', () => {
            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketDetail {...defaultProps} />,
            )

            expect(
                screen.getByTestId('side-panel-ticket-header'),
            ).toBeInTheDocument()
            expect(screen.getByText('Header for #123')).toBeInTheDocument()
        })

        it('should pass additionalHeaderActions to header', () => {
            const additionalHeaderActions = <button type="button">Close</button>

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketDetail
                    {...defaultProps}
                    additionalHeaderActions={additionalHeaderActions}
                />,
            )

            expect(
                screen.getByRole('button', { name: /close/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Thread rendering', () => {
        it('should render TicketThread once data is loaded', async () => {
            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketDetail {...defaultProps} />,
            )

            await waitFor(() => {
                expect(screen.getByTestId('ticket-thread')).toBeInTheDocument()
            })
            expect(screen.getByText('Ticket Thread #123')).toBeInTheDocument()
        })

        it('should pass summary to TicketThread', async () => {
            const {
                useTicket,
            } = require('tickets/ticket-detail/hooks/useTicket')
            useTicket.mockReturnValue({
                body: [],
                isLoading: false,
                ticket: createMockFullTicket({
                    summary: {
                        content: 'Custom summary',
                        created_datetime: '2024-01-01T10:00:00Z',
                        triggered_by: null,
                        updated_datetime: '2024-01-01T10:00:00Z',
                    },
                }),
            })

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketDetail {...defaultProps} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByText('Summary: Custom summary'),
                ).toBeInTheDocument()
            })
        })

        it('should pass elements to TicketThread', async () => {
            const mockElements = [
                { id: 1, type: 'message' },
                { id: 2, type: 'note' },
            ]
            const {
                useTicket,
            } = require('tickets/ticket-detail/hooks/useTicket')
            useTicket.mockReturnValue({
                body: mockElements,
                isLoading: false,
                ticket: createMockFullTicket(),
            })

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketDetail {...defaultProps} />,
            )

            await waitFor(() => {
                expect(screen.getByTestId('ticket-thread')).toBeInTheDocument()
            })
        })
    })

    describe('Expand functionality', () => {
        it('should call onExpand when expand button is clicked', async () => {
            const user = userEvent.setup()
            const onExpand = jest.fn()

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketDetail {...defaultProps} onExpand={onExpand} />,
            )

            await user.click(screen.getByRole('button', { name: /expand/i }))

            expect(onExpand).toHaveBeenCalledTimes(1)
        })

        it('should not render expand button when onExpand is not provided', () => {
            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketDetail {...defaultProps} />,
            )

            expect(
                screen.queryByRole('button', { name: /expand/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('Feature flags', () => {
        it('should apply ticket-thread-revamp class when feature flag is enabled', () => {
            const { useFlag } = require('@repo/feature-flags')
            useFlag.mockReturnValue(true)

            const { container } = renderWithStoreAndQueryClientProvider(
                <SidePanelTicketDetail {...defaultProps} />,
            )

            const containerElement = container.querySelector(
                '.ticket-thread-revamp',
            )
            expect(containerElement).toBeInTheDocument()
        })

        it('should not apply ticket-thread-revamp class when feature flag is disabled', () => {
            const { useFlag } = require('@repo/feature-flags')
            useFlag.mockReturnValue(false)

            const { container } = renderWithStoreAndQueryClientProvider(
                <SidePanelTicketDetail {...defaultProps} />,
            )

            const containerElement = container.querySelector(
                '.ticket-thread-revamp',
            )
            expect(containerElement).not.toBeInTheDocument()
        })
    })
})
