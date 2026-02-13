import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import moment from 'moment'
import { vi } from 'vitest'

import type { TicketCompact } from '@gorgias/helpdesk-types'
import { ExpressionFieldType } from '@gorgias/helpdesk-types'

import type { TicketTimelineWidgetProps } from '../TicketTimelineWidget'
import { TicketTimelineWidget } from '../TicketTimelineWidget'
import type { EnrichedTicket } from '../types'
import { formatTicketTime } from '../utils'

const createTicketCompact = (
    overrides: Partial<TicketCompact>,
): TicketCompact => {
    return {
        id: 1,
        uri: 'https://example.com',
        external_id: null,
        language: 'en',
        status: 'open',
        priority: 'normal',
        channel: 'email',
        via: 'email',
        customer: {
            id: 123,
            email: 'customer@example.com',
            name: 'Test Customer',
            firstname: 'Test',
            lastname: 'Customer',
        } as any,
        assignee_user: null,
        assignee_team: null,
        subject: 'Test Subject',
        excerpt: 'Test excerpt',
        created_datetime: '2025-01-01T00:00:00Z',
        updated_datetime: '2025-01-01T00:00:00Z',
        opened_datetime: '2025-01-01T00:00:00Z',
        last_received_message_datetime: '2025-01-01T00:00:00Z',
        last_message_datetime: '2025-01-01T00:00:00Z',
        last_sent_message_not_delivered: false,
        spam: false,
        trashed_datetime: null,
        closed_datetime: null,
        snooze_datetime: null,
        is_unread: false,
        tags: [],
        custom_fields: null,
        integrations: [],
        messages_count: 1,
        from_agent: false,
        ...overrides,
    } as TicketCompact
}

const mockGetShortValueLabel = (value?: string | number | boolean) =>
    String(value || '')

const createEnrichedTicket = (
    ticket: TicketCompact,
    evaluationResults: Record<number, ExpressionFieldType | undefined> = {},
    conditionsLoading = false,
    customFields: Array<{ id: number; label: string; value: any }> = [],
    iconName: any = 'comm-mail',
): EnrichedTicket => ({
    ticket,
    evaluationResults,
    conditionsLoading,
    customFields: customFields.map((field) => ({
        ...field,
        shortValueLabel: mockGetShortValueLabel(field.value),
    })),
    iconName,
})

const defaultProps: TicketTimelineWidgetProps = {
    tickets: [],
    totalNumber: 0,
    openTicketsNumber: 0,
    snoozedTicketsNumber: 0,
    isLoading: false,
    customerName: undefined,
    onToggleTimeline: vi.fn(),
}

const renderComponent = (props: Partial<TicketTimelineWidgetProps> = {}) => {
    return render(<TicketTimelineWidget {...defaultProps} {...props} />)
}

describe('TicketTimelineWidget', () => {
    describe('Loading states', () => {
        it('should show skeleton when loading', () => {
            renderComponent({ isLoading: true, totalNumber: 2 })

            const skeletons = screen.getAllByLabelText('Loading')
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('should not show skeleton when not loading', () => {
            renderComponent({ isLoading: false, totalNumber: 0 })

            expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
        })
    })

    describe('WidgetHeader', () => {
        it('should display total ticket count', () => {
            renderComponent({
                totalNumber: 5,
                openTicketsNumber: 2,
                snoozedTicketsNumber: 1,
            })

            expect(screen.getByText('Tickets')).toBeInTheDocument()
            expect(screen.getByText('5')).toBeInTheDocument()
        })

        it('should display pagination indicator when totalNumber exceeds fetchLimit', () => {
            renderComponent({
                totalNumber: 10,
                openTicketsNumber: 5,
                snoozedTicketsNumber: 2,
                fetchLimit: 10,
            })

            expect(screen.getByText('10+')).toBeInTheDocument()
        })

        it('should display pagination indicator when totalNumber is greater than fetchLimit', () => {
            renderComponent({
                totalNumber: 15,
                openTicketsNumber: 5,
                snoozedTicketsNumber: 2,
                fetchLimit: 10,
            })

            expect(screen.getByText('10+')).toBeInTheDocument()
        })

        it('should display exact count when totalNumber is less than fetchLimit', () => {
            renderComponent({
                totalNumber: 8,
                openTicketsNumber: 5,
                snoozedTicketsNumber: 2,
                fetchLimit: 10,
            })

            expect(screen.getByText('8')).toBeInTheDocument()
            expect(screen.queryByText('10+')).not.toBeInTheDocument()
        })

        it('should display exact count when fetchLimit is not provided', () => {
            renderComponent({
                totalNumber: 15,
                openTicketsNumber: 5,
                snoozedTicketsNumber: 2,
            })

            expect(screen.getByText('15')).toBeInTheDocument()
            expect(screen.queryByText('10+')).not.toBeInTheDocument()
        })

        it('should display open tickets count when there are multiple tickets', () => {
            renderComponent({
                totalNumber: 3,
                openTicketsNumber: 2,
                snoozedTicketsNumber: 0,
            })

            expect(screen.getByText('2 Open')).toBeInTheDocument()
        })

        it('should display snoozed tickets count when present', () => {
            renderComponent({
                totalNumber: 3,
                openTicketsNumber: 1,
                snoozedTicketsNumber: 2,
            })

            expect(screen.getByText('2 Snoozed')).toBeInTheDocument()
        })

        it('should display customer name for first ticket', () => {
            renderComponent({
                totalNumber: 1,
                customerName: 'John Doe',
            })

            expect(
                screen.getByText("This is John Doe's first ticket"),
            ).toBeInTheDocument()
        })

        it('should not display customer name when there are multiple tickets', () => {
            renderComponent({
                totalNumber: 2,
                customerName: 'John Doe',
            })

            expect(screen.queryByText(/first ticket/)).not.toBeInTheDocument()
        })
    })

    describe('TicketsList display logic', () => {
        it('should not display tickets list when there is only one ticket', () => {
            const ticket = createTicketCompact({ id: 1 })
            renderComponent({
                tickets: [createEnrichedTicket(ticket)],
                totalNumber: 1,
            })

            expect(screen.queryByText('Show all')).not.toBeInTheDocument()
        })

        it('should display tickets list when there are multiple tickets', () => {
            const tickets = [
                createEnrichedTicket(
                    createTicketCompact({ id: 1, subject: 'Ticket 1' }),
                ),
                createEnrichedTicket(
                    createTicketCompact({ id: 2, subject: 'Ticket 2' }),
                ),
            ]
            renderComponent({
                tickets: tickets,
                totalNumber: 2,
            })

            expect(screen.getByText('Ticket 1')).toBeInTheDocument()
            expect(screen.getByText('Ticket 2')).toBeInTheDocument()
            expect(screen.getByText('Show all')).toBeInTheDocument()
        })

        it('should not display tickets list when loading', () => {
            renderComponent({
                tickets: [],
                totalNumber: 2,
                isLoading: true,
            })

            expect(screen.queryByText('Show all')).not.toBeInTheDocument()
        })
    })

    describe('Toggle timeline button', () => {
        it('should call onToggleTimeline when clicking "Show all"', async () => {
            const user = userEvent.setup()
            const onToggleTimeline = vi.fn()
            const tickets = [
                createEnrichedTicket(createTicketCompact({ id: 1 })),
                createEnrichedTicket(createTicketCompact({ id: 2 })),
            ]

            renderComponent({
                tickets: tickets,
                totalNumber: 2,
                onToggleTimeline,
            })

            const button = screen.getByText('Show all')
            await act(() => user.click(button))

            expect(onToggleTimeline).toHaveBeenCalled()
        })
    })

    describe('Ticket selection', () => {
        it('should call onSelectTicket when clicking a ticket card', async () => {
            const user = userEvent.setup()
            const onSelectTicket = vi.fn()
            const ticket1 = createEnrichedTicket(
                createTicketCompact({ id: 1, subject: 'First Ticket' }),
            )
            const ticket2 = createEnrichedTicket(
                createTicketCompact({ id: 2, subject: 'Second Ticket' }),
            )
            const tickets = [ticket1, ticket2]

            renderComponent({
                tickets: tickets,
                totalNumber: 2,
                onSelectTicket,
            })

            const firstTicketCard = screen
                .getByText('First Ticket')
                .closest('div')
            await act(() => user.click(firstTicketCard!))

            expect(onSelectTicket).toHaveBeenCalledWith(ticket1)
        })

        it('should not call onSelectTicket when no handler is provided', async () => {
            const user = userEvent.setup()
            const tickets = [
                createEnrichedTicket(
                    createTicketCompact({ id: 1, subject: 'First Ticket' }),
                ),
            ]

            renderComponent({
                tickets: tickets,
                totalNumber: 2,
            })

            const ticketCard = screen.getByText('First Ticket').closest('div')
            await act(() => user.click(ticketCard!))
        })
    })

    describe('TicketsList rendering', () => {
        it('should render ticket with correct channel icon', () => {
            const tickets = [
                createEnrichedTicket(
                    createTicketCompact({ id: 1, channel: 'email' }),
                    {},
                    false,
                    [],
                    'comm-mail',
                ),
                createEnrichedTicket(
                    createTicketCompact({ id: 2, channel: 'chat' }),
                    {},
                    false,
                    [],
                    'comm-chat-dots',
                ),
            ]

            renderComponent({
                tickets: tickets,
                totalNumber: 2,
            })

            expect(screen.getByLabelText('comm-mail')).toBeInTheDocument()
            expect(screen.getByLabelText('comm-chat-dots')).toBeInTheDocument()
        })

        it('should render ticket with status badge', () => {
            const tickets = [
                createEnrichedTicket(
                    createTicketCompact({ id: 1, status: 'open' }),
                ),
            ]

            renderComponent({
                tickets: tickets,
                totalNumber: 2,
            })

            expect(screen.getByText('Open')).toBeInTheDocument()
        })

        it('should render ticket with assignee', () => {
            const tickets = [
                createEnrichedTicket(
                    createTicketCompact({
                        id: 1,
                        assignee_user: {
                            id: 1,
                            name: 'Agent Name',
                            email: 'agent@example.com',
                        } as any,
                    }),
                ),
            ]

            renderComponent({
                tickets: tickets,
                totalNumber: 2,
            })

            expect(screen.getByText('Agent Name')).toBeInTheDocument()
        })

        it('should render ticket with messages count', () => {
            const tickets = [
                createEnrichedTicket(
                    createTicketCompact({ id: 1, messages_count: 10 }),
                ),
            ]

            renderComponent({
                tickets: tickets,
                totalNumber: 2,
            })

            expect(screen.getByText('10 messages')).toBeInTheDocument()
        })
    })

    describe('Custom fields', () => {
        it('should display "No ticket fields yet" when no fields', () => {
            const tickets = [
                createEnrichedTicket(
                    createTicketCompact({ id: 1, custom_fields: null }),
                ),
            ]

            renderComponent({
                tickets: tickets,
                totalNumber: 2,
            })

            expect(screen.getByText('No ticket fields yet')).toBeInTheDocument()
        })

        it('should display custom field with value', () => {
            const tickets = [
                createEnrichedTicket(
                    createTicketCompact({
                        id: 1,
                        custom_fields: {
                            1: { id: 1, value: 'Test Value' },
                        } as any,
                    }),
                    {},
                    false,
                    [{ id: 1, label: 'Test Field', value: 'Test Value' }],
                ),
            ]

            renderComponent({
                tickets: tickets,
                totalNumber: 2,
            })

            expect(screen.getByText('Test Field:')).toBeInTheDocument()
            expect(screen.getByText('Test Value')).toBeInTheDocument()
        })

        it('should filter AI-managed fields', () => {
            const tickets = [
                createEnrichedTicket(
                    createTicketCompact({
                        id: 1,
                        custom_fields: {
                            1: { id: 1, value: 'Regular Value' },
                            2: { id: 2, value: 'AI Value' },
                        } as any,
                    }),
                    {},
                    false,
                    [{ id: 1, label: 'Regular Field', value: 'Regular Value' }],
                ),
            ]

            renderComponent({
                tickets: tickets,
                totalNumber: 2,
            })

            expect(screen.getByText('Regular Field:')).toBeInTheDocument()
            expect(screen.queryByText('AI Field:')).not.toBeInTheDocument()
        })

        it('should show conditionally visible fields', () => {
            const tickets = [
                {
                    ...createEnrichedTicket(
                        createTicketCompact({
                            id: 1,
                            custom_fields: {
                                1: { id: 1, value: 'Conditional Value' },
                            } as any,
                        }),
                        {
                            1: ExpressionFieldType.Visible,
                        },
                        false,
                        [
                            {
                                id: 1,
                                label: 'Conditional Field',
                                value: 'Conditional Value',
                            },
                        ],
                        'comm-mail',
                    ),
                },
            ]

            renderComponent({
                tickets: tickets,
                totalNumber: 2,
            })

            expect(screen.getByText('Conditional Field:')).toBeInTheDocument()
            expect(screen.getByText('Conditional Value')).toBeInTheDocument()
        })
    })

    describe('formatTicketTime', () => {
        it('should format time in minutes when less than 60 minutes ago', () => {
            const now = moment('2025-01-01T12:00:00Z')
            const createdDatetime = moment('2025-01-01T11:30:00Z').toISOString()

            const result = formatTicketTime(createdDatetime, now)

            expect(result).toBe('30m ago')
        })

        it('should format time as 0m ago when less than 1 minute', () => {
            const now = moment('2025-01-01T12:00:00Z')
            const createdDatetime = moment('2025-01-01T11:59:30Z').toISOString()

            const result = formatTicketTime(createdDatetime, now)

            expect(result).toBe('0m ago')
        })

        it('should format time in hours when between 1 and 24 hours ago', () => {
            const now = moment('2025-01-01T12:00:00Z')
            const createdDatetime = moment('2025-01-01T08:00:00Z').toISOString()

            const result = formatTicketTime(createdDatetime, now)

            expect(result).toBe('4hr ago')
        })

        it('should format time in hours when exactly 1 hour ago', () => {
            const now = moment('2025-01-01T12:00:00Z')
            const createdDatetime = moment('2025-01-01T11:00:00Z').toISOString()

            const result = formatTicketTime(createdDatetime, now)

            expect(result).toBe('1hr ago')
        })

        it('should format time in hours when 23 hours ago', () => {
            const now = moment('2025-01-01T12:00:00Z')
            const createdDatetime = moment('2024-12-31T13:00:00Z').toISOString()

            const result = formatTicketTime(createdDatetime, now)

            expect(result).toBe('23hr ago')
        })

        it('should format time in days when 1 day ago (singular)', () => {
            const now = moment('2025-01-02T12:00:00Z')
            const createdDatetime = moment('2025-01-01T12:00:00Z').toISOString()

            const result = formatTicketTime(createdDatetime, now)

            expect(result).toBe('1 day ago')
        })

        it('should format time in days when between 2 and 6 days ago (plural)', () => {
            const now = moment('2025-01-05T12:00:00Z')
            const createdDatetime = moment('2025-01-02T12:00:00Z').toISOString()

            const result = formatTicketTime(createdDatetime, now)

            expect(result).toBe('3 days ago')
        })

        it('should format time in days when 6 days ago', () => {
            const now = moment('2025-01-07T12:00:00Z')
            const createdDatetime = moment('2025-01-01T12:00:00Z').toISOString()

            const result = formatTicketTime(createdDatetime, now)

            expect(result).toBe('6 days ago')
        })

        it('should format as MM/DD/YY when 7 days or more ago', () => {
            const now = moment('2025-01-08T12:00:00Z')
            const createdDatetime = moment('2025-01-01T12:00:00Z').toISOString()

            const result = formatTicketTime(createdDatetime, now)

            expect(result).toBe('01/01/25')
        })

        it('should format as MM/DD/YY when 30 days ago', () => {
            const now = moment('2025-02-01T12:00:00Z')
            const createdDatetime = moment('2025-01-02T12:00:00Z').toISOString()

            const result = formatTicketTime(createdDatetime, now)

            expect(result).toBe('01/02/25')
        })

        it('should format as MM/DD/YY when more than a year ago', () => {
            const now = moment('2025-06-01T12:00:00Z')
            const createdDatetime = moment('2024-05-15T12:00:00Z').toISOString()

            const result = formatTicketTime(createdDatetime, now)

            expect(result).toBe('05/15/24')
        })

        it('should use current time when now parameter is not provided', () => {
            const fiveMinutesAgo = moment().subtract(5, 'minutes').toISOString()

            const result = formatTicketTime(fiveMinutesAgo)

            expect(result).toBe('5m ago')
        })
    })
})
