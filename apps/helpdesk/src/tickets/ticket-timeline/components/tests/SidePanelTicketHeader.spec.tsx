import type { TicketCustomField } from '@repo/tickets'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { IconName } from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'
import { TicketStatus } from '@gorgias/helpdesk-types'

import { TicketChannel } from 'business/types/ticket'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { SidePanelTicketHeader } from '../SidePanelTicketHeader'

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
        subject: 'Test ticket subject',
        updated_datetime: '2024-01-01T12:30:00Z',
        messages_count: 3,
        assignee_user: null,
        assignee_team: null,
        snooze_datetime: null,
        priority: 'normal',
        tags: [],
        custom_fields: [],
        integrations: [],
        ...overrides,
    }) as TicketCompact

const createMockCustomFields = (): TicketCustomField[] => [
    {
        id: 1,
        label: 'Priority',
        value: 'high',
        shortValueLabel: 'High',
    },
    {
        id: 2,
        label: 'Category',
        value: 'billing',
        shortValueLabel: 'Billing',
    },
]

describe('SidePanelTicketHeader', () => {
    const defaultProps = {
        ticket: createMockTicket(),
        customFields: createMockCustomFields(),
        conditionsLoading: false,
        iconName: 'email' as IconName,
        additionalActions: undefined,
    }

    describe('Rendering', () => {
        it('should render the ticket subject', () => {
            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader {...defaultProps} />,
            )

            expect(
                screen.getByRole('heading', { name: /test ticket subject/i }),
            ).toBeInTheDocument()
        })

        it('should render the channel icon', () => {
            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader {...defaultProps} />,
            )

            expect(
                screen.getByRole('img', { name: /email/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Status', () => {
        it('should render Open status for open tickets', () => {
            const ticket = createMockTicket({ status: TicketStatus.Open })

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader {...defaultProps} ticket={ticket} />,
            )

            expect(screen.getByText('Open')).toBeInTheDocument()
        })

        it('should render Closed status for closed tickets', () => {
            const ticket = createMockTicket({ status: TicketStatus.Closed })

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader {...defaultProps} ticket={ticket} />,
            )

            expect(screen.getByText('Closed')).toBeInTheDocument()
        })

        it('should render Snoozed status for snoozed tickets', () => {
            const ticket = createMockTicket({
                status: TicketStatus.Open,
                snooze_datetime: '2024-01-02T10:00:00Z',
            })

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader {...defaultProps} ticket={ticket} />,
            )

            expect(screen.getByText('Snoozed')).toBeInTheDocument()
        })
    })

    describe('Assignee', () => {
        it('should not render assignee tag when no assignee', () => {
            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader {...defaultProps} />,
            )

            expect(screen.queryByText('Unassigned')).not.toBeInTheDocument()
        })

        it('should render assignee name when assigned', () => {
            const ticket = createMockTicket({
                assignee_user: {
                    id: 1,
                    email: 'agent@example.com',
                    name: 'John Doe',
                    bio: null,
                    firstname: 'John',
                    lastname: 'Doe',
                    meta: null,
                },
            })

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader {...defaultProps} ticket={ticket} />,
            )

            expect(screen.getByText('John Doe')).toBeInTheDocument()
        })
    })

    describe('Custom fields', () => {
        it('should show loading state when conditions are loading', () => {
            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader
                    {...defaultProps}
                    conditionsLoading={true}
                />,
            )

            expect(screen.queryByText('Priority')).not.toBeInTheDocument()
        })

        it('should render custom fields when loaded', () => {
            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader {...defaultProps} />,
            )

            expect(screen.getByText('High')).toBeInTheDocument()
            expect(screen.getByText('Billing')).toBeInTheDocument()
        })

        it('should show "No ticket fields yet" when no custom fields', () => {
            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader
                    {...defaultProps}
                    customFields={[]}
                    conditionsLoading={false}
                />,
            )

            expect(screen.getByText('No ticket fields yet')).toBeInTheDocument()
        })
    })

    describe('Expand functionality', () => {
        it('should call onExpand when expand button is clicked', async () => {
            const user = userEvent.setup()
            const onExpand = jest.fn()

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader {...defaultProps} onExpand={onExpand} />,
            )

            await user.click(
                screen.getByRole('button', { name: /expand ticket/i }),
            )

            expect(onExpand).toHaveBeenCalledTimes(1)
        })
    })

    describe('Additional actions', () => {
        it('should render additional actions when provided', () => {
            const additionalActions = <button type="button">Close</button>

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader
                    {...defaultProps}
                    additionalActions={additionalActions}
                />,
            )

            expect(
                screen.getByRole('button', { name: /close/i }),
            ).toBeInTheDocument()
        })

        it('should not render additional actions section when not provided', () => {
            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader
                    {...defaultProps}
                    additionalActions={undefined}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /close/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('Tags', () => {
        it('should render tags when ticket has tags', () => {
            const ticket = createMockTicket({
                tags: [
                    { id: 1, name: 'urgent', decoration: null },
                    { id: 2, name: 'billing', decoration: null },
                ],
            })

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader {...defaultProps} ticket={ticket} />,
            )

            expect(screen.getByText('urgent')).toBeInTheDocument()
            expect(screen.getByText('billing')).toBeInTheDocument()
        })

        it('should not render tags section when ticket has no tags', () => {
            const ticket = createMockTicket({ tags: [] })

            renderWithStoreAndQueryClientProvider(
                <SidePanelTicketHeader {...defaultProps} ticket={ticket} />,
            )

            expect(screen.queryByText('urgent')).not.toBeInTheDocument()
        })
    })
})
