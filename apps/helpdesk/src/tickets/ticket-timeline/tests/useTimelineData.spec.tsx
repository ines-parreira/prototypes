import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import type { TicketCompact } from '@gorgias/helpdesk-queries'

import { FinancialStatus } from 'constants/integrations/types/shopify'

import { useTimelineData } from '../hooks/useTimelineData'

// Mock dependencies
jest.mock('custom-fields/hooks/queries/useCustomFieldConditions', () => ({
    useCustomFieldConditions: jest.fn(() => ({
        customFieldConditions: {},
        isLoading: false,
    })),
}))

jest.mock('custom-fields/helpers/evaluateCustomFieldsConditions', () => ({
    evaluateCustomFieldsConditions: jest.fn(() => ({})),
}))

jest.mock('custom-fields/helpers/getValueLabels', () => ({
    getShortValueLabel: jest.fn((value) => String(value)),
}))

jest.mock('custom-fields/helpers/isFieldRequired', () => ({
    isFieldRequired: jest.fn(() => false),
}))

jest.mock('custom-fields/helpers/isFieldVisible', () => ({
    isFieldVisible: jest.fn(() => true),
}))

jest.mock('timeline/helpers/timelineItem', () => ({
    fromTicket: (ticket: any) => ({ kind: 'ticket', ticket }),
    fromOrder: (order: any) => ({ kind: 'order', order }),
}))

const createMockTicket = (
    overrides: Partial<TicketCompact> & { id: number },
): TicketCompact => ({
    uri: `https://example.com/tickets/${overrides.id}`,
    external_id: null,
    language: 'en',
    status: 'open',
    priority: 'normal',
    channel: 'email',
    via: 'email',
    customer: {
        id: 123,
        email: 'test@example.com',
        name: 'Test Customer',
    } as any,
    assignee_user: null,
    assignee_team: null,
    subject: `Test Ticket ${overrides.id}`,
    excerpt: 'Test excerpt',
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-01-01T00:00:00Z',
    opened_datetime: '2024-01-01T00:00:00Z',
    last_received_message_datetime: '2024-01-01T00:00:00Z',
    last_message_datetime: '2024-01-01T00:00:00Z',
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
    meta: {},
    ...overrides,
})

const createMockOrder = (id: number) => ({
    id,
    name: `Order #${id}`,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    currency: 'USD',
    total_price: '100.00',
    financial_status: FinancialStatus.Paid,
    fulfillment_status: null,
    line_items: [],
    note: '',
    tags: '',
    shipping_address: {} as any,
    billing_address: {} as any,
    discount_codes: [],
    shipping_lines: [],
    total_line_items_price: '100.00',
    total_discounts: '0.00',
    subtotal_price: '100.00',
    total_tax: '0.00',
    taxes_included: false,
    discount_applications: [],
    refunds: [],
})

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useTimelineData', () => {
    const mockChannelToIcon = jest.fn(() => 'comm-mail' as any)

    const defaultParams = {
        tickets: [],
        orders: [],
        customFieldDefinitions: [],
        channelToIcon: mockChannelToIcon,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Ticket counts', () => {
        it('should calculate total number of tickets', () => {
            const tickets = [
                createMockTicket({ id: 1 }),
                createMockTicket({ id: 2 }),
                createMockTicket({ id: 3 }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            expect(result.current.totalNumber).toBe(3)
        })

        it('should count open tickets correctly', () => {
            const tickets = [
                createMockTicket({ id: 1, status: 'open' }),
                createMockTicket({ id: 2, status: 'open' }),
                createMockTicket({ id: 3, status: 'closed' }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            expect(result.current.openTicketsNumber).toBe(2)
        })

        it('should count snoozed tickets correctly', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    snooze_datetime: '2024-12-31T00:00:00Z',
                }),
                createMockTicket({
                    id: 2,
                    snooze_datetime: '2024-12-31T00:00:00Z',
                }),
                createMockTicket({ id: 3 }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            expect(result.current.snoozedTicketsNumber).toBe(2)
        })

        it('should count closed tickets correctly', () => {
            const tickets = [
                createMockTicket({ id: 1, status: 'closed' }),
                createMockTicket({ id: 2, status: 'closed' }),
                createMockTicket({ id: 3, status: 'open' }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            expect(result.current.closedTicketsNumber).toBe(2)
        })

        it('should not count snoozed tickets as closed', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    status: 'closed',
                    snooze_datetime: '2024-12-31T00:00:00Z',
                }),
                createMockTicket({ id: 2, status: 'closed' }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            expect(result.current.closedTicketsNumber).toBe(1)
            expect(result.current.snoozedTicketsNumber).toBe(1)
        })
    })

    describe('Status filtering', () => {
        it('should initialize with all status filters selected', () => {
            const { result } = renderHook(
                () => useTimelineData(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.statusFilters.size).toBe(3)
            expect(result.current.statusFilters.has('open')).toBe(true)
            expect(result.current.statusFilters.has('closed')).toBe(true)
            expect(result.current.statusFilters.has('snoozed')).toBe(true)
        })

        it('should toggle status filter on', () => {
            const { result } = renderHook(
                () => useTimelineData(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            act(() => {
                result.current.toggleStatusFilter('open')
            })

            expect(result.current.statusFilters.has('open')).toBe(false)
            expect(result.current.statusFilters.size).toBe(2)
        })

        it('should toggle status filter back on', () => {
            const { result } = renderHook(
                () => useTimelineData(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            act(() => {
                result.current.toggleStatusFilter('open')
                result.current.toggleStatusFilter('open')
            })

            expect(result.current.statusFilters.has('open')).toBe(true)
            expect(result.current.statusFilters.size).toBe(3)
        })

        it('should filter tickets by status', () => {
            const tickets = [
                createMockTicket({ id: 1, status: 'open' }),
                createMockTicket({ id: 2, status: 'closed' }),
                createMockTicket({
                    id: 3,
                    snooze_datetime: '2024-12-31T00:00:00Z',
                }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            // Filter out closed tickets
            act(() => {
                result.current.toggleStatusFilter('closed')
            })

            expect(result.current.enrichedTickets).toHaveLength(2)
            expect(result.current.enrichedTickets[0].ticket.id).toBe(1)
            expect(result.current.enrichedTickets[1].ticket.id).toBe(3)
        })

        it('should handle toggleSelectedStatus (FilterKey to StatusFilter mapping)', () => {
            const { result } = renderHook(
                () => useTimelineData(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            act(() => {
                result.current.toggleSelectedStatus('snooze')
            })

            expect(result.current.statusFilters.has('snoozed')).toBe(false)
        })
    })

    describe('Range filtering', () => {
        it('should initialize with null range (show all)', () => {
            const { result } = renderHook(
                () => useTimelineData(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.rangeFilter).toEqual({
                start: null,
                end: null,
            })
        })

        it('should update range filter', () => {
            const { result } = renderHook(
                () => useTimelineData(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            const newRange = {
                start: new Date('2024-01-01').getTime(),
                end: new Date('2024-01-31').getTime(),
            }

            act(() => {
                result.current.setRangeFilter(newRange)
            })

            expect(result.current.rangeFilter).toEqual(newRange)
        })

        it('should filter tickets by date range', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    created_datetime: '2024-01-15T00:00:00Z',
                }),
                createMockTicket({
                    id: 2,
                    created_datetime: '2024-02-15T00:00:00Z',
                }),
                createMockTicket({
                    id: 3,
                    created_datetime: '2024-03-15T00:00:00Z',
                }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            act(() => {
                result.current.setRangeFilter({
                    start: new Date('2024-01-01').getTime(),
                    end: new Date('2024-01-31').getTime(),
                })
            })

            expect(result.current.enrichedTickets).toHaveLength(1)
            expect(result.current.enrichedTickets[0].ticket.id).toBe(1)
        })

        it('should filter orders by date range', () => {
            const orders = [
                { ...createMockOrder(1), created_at: '2024-01-15T00:00:00Z' },
                { ...createMockOrder(2), created_at: '2024-02-15T00:00:00Z' },
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, orders }),
                { wrapper: createWrapper() },
            )

            act(() => {
                // Enable order filter
                result.current.setInteractionTypeFilters({
                    ticket: false,
                    order: true,
                })

                result.current.setRangeFilter({
                    start: new Date('2024-01-01').getTime(),
                    end: new Date('2024-01-31').getTime(),
                })
            })

            const orderItems = result.current.timelineItems.filter(
                (item) => item.kind === 'order',
            )
            expect(orderItems).toHaveLength(1)
        })
    })

    describe('Interaction type filtering', () => {
        it('should initialize with tickets filter enabled and orders disabled', () => {
            const { result } = renderHook(
                () => useTimelineData(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.interactionTypeFilters).toEqual({
                ticket: true,
                order: false,
            })
        })

        it('should show only tickets when ticket filter is enabled', () => {
            const tickets = [createMockTicket({ id: 1 })]
            const orders = [createMockOrder(1)]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets, orders }),
                { wrapper: createWrapper() },
            )

            expect(result.current.timelineItems).toHaveLength(1)
            expect(result.current.timelineItems[0].kind).toBe('ticket')
        })

        it('should show only orders when order filter is enabled', () => {
            const tickets = [createMockTicket({ id: 1 })]
            const orders = [createMockOrder(1)]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets, orders }),
                { wrapper: createWrapper() },
            )

            act(() => {
                result.current.setInteractionTypeFilters({
                    ticket: false,
                    order: true,
                })
            })

            expect(result.current.timelineItems).toHaveLength(1)
            expect(result.current.timelineItems[0].kind).toBe('order')
        })

        it('should show both when both filters are enabled', () => {
            const tickets = [createMockTicket({ id: 1 })]
            const orders = [createMockOrder(1)]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets, orders }),
                { wrapper: createWrapper() },
            )

            act(() => {
                result.current.setInteractionTypeFilters({
                    ticket: true,
                    order: true,
                })
            })

            expect(result.current.timelineItems).toHaveLength(2)
        })
    })

    describe('Sorting', () => {
        it('should initialize with updated-desc sort', () => {
            const { result } = renderHook(
                () => useTimelineData(defaultParams),
                {
                    wrapper: createWrapper(),
                },
            )

            expect(result.current.sortOption).toBe('updated-desc')
        })

        it('should sort tickets by updated descending', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    last_message_datetime: '2024-01-01T00:00:00Z',
                }),
                createMockTicket({
                    id: 2,
                    last_message_datetime: '2024-01-03T00:00:00Z',
                }),
                createMockTicket({
                    id: 3,
                    last_message_datetime: '2024-01-02T00:00:00Z',
                }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            expect(result.current.enrichedTickets[0].ticket.id).toBe(2)
            expect(result.current.enrichedTickets[1].ticket.id).toBe(3)
            expect(result.current.enrichedTickets[2].ticket.id).toBe(1)
        })

        it('should sort tickets by updated ascending', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    last_message_datetime: '2024-01-03T00:00:00Z',
                }),
                createMockTicket({
                    id: 2,
                    last_message_datetime: '2024-01-01T00:00:00Z',
                }),
                createMockTicket({
                    id: 3,
                    last_message_datetime: '2024-01-02T00:00:00Z',
                }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            act(() => {
                result.current.setSortOption('updated-asc')
            })

            expect(result.current.enrichedTickets[0].ticket.id).toBe(2)
            expect(result.current.enrichedTickets[1].ticket.id).toBe(3)
            expect(result.current.enrichedTickets[2].ticket.id).toBe(1)
        })

        it('should sort tickets by created descending', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    created_datetime: '2024-01-01T00:00:00Z',
                }),
                createMockTicket({
                    id: 2,
                    created_datetime: '2024-01-03T00:00:00Z',
                }),
                createMockTicket({
                    id: 3,
                    created_datetime: '2024-01-02T00:00:00Z',
                }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            act(() => {
                result.current.setSortOption('created-desc')
            })

            expect(result.current.enrichedTickets[0].ticket.id).toBe(2)
            expect(result.current.enrichedTickets[1].ticket.id).toBe(3)
            expect(result.current.enrichedTickets[2].ticket.id).toBe(1)
        })

        it('should sort tickets by created ascending', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    created_datetime: '2024-01-03T00:00:00Z',
                }),
                createMockTicket({
                    id: 2,
                    created_datetime: '2024-01-01T00:00:00Z',
                }),
                createMockTicket({
                    id: 3,
                    created_datetime: '2024-01-02T00:00:00Z',
                }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            act(() => {
                result.current.setSortOption('created-asc')
            })

            expect(result.current.enrichedTickets[0].ticket.id).toBe(2)
            expect(result.current.enrichedTickets[1].ticket.id).toBe(3)
            expect(result.current.enrichedTickets[2].ticket.id).toBe(1)
        })

        it('should sort combined timeline items (tickets and orders)', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    last_message_datetime: '2024-01-01T00:00:00Z',
                }),
            ]
            const orders = [
                { ...createMockOrder(1), updated_at: '2024-01-02T00:00:00Z' },
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets, orders }),
                { wrapper: createWrapper() },
            )

            act(() => {
                result.current.setInteractionTypeFilters({
                    ticket: true,
                    order: true,
                })
            })

            // Should be sorted by updated descending: order (Jan 2), then ticket (Jan 1)
            expect(result.current.timelineItems[0].kind).toBe('order')
            expect(result.current.timelineItems[1].kind).toBe('ticket')
        })
    })

    describe('Ticket enrichment', () => {
        it('should enrich tickets with custom fields', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    custom_fields: {
                        1: { id: 1, value: 'Test Value' },
                    } as any,
                }),
            ]

            const customFieldDefinitions = [
                {
                    id: 1,
                    label: 'Test Field',
                    type: 'text',
                } as any,
            ]

            const { result } = renderHook(
                () =>
                    useTimelineData({
                        ...defaultParams,
                        tickets,
                        customFieldDefinitions,
                    }),
                { wrapper: createWrapper() },
            )

            expect(result.current.enrichedTickets[0].customFields).toHaveLength(
                1,
            )
            expect(result.current.enrichedTickets[0].customFields[0]).toEqual({
                id: 1,
                label: 'Test Field',
                value: 'Test Value',
                shortValueLabel: 'Test Value',
            })
        })

        it('should add icon name to enriched tickets', () => {
            const tickets = [createMockTicket({ id: 1, channel: 'email' })]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            expect(result.current.enrichedTickets[0].iconName).toBe('comm-mail')
            expect(mockChannelToIcon).toHaveBeenCalledWith('email')
        })

        it('should handle tickets with null custom_fields', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    custom_fields: null,
                }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            expect(result.current.enrichedTickets[0].customFields).toEqual([])
        })
    })

    describe('Combined filters', () => {
        it('should apply status and range filters together', () => {
            const tickets = [
                createMockTicket({
                    id: 1,
                    status: 'open',
                    created_datetime: '2024-01-15T00:00:00Z',
                }),
                createMockTicket({
                    id: 2,
                    status: 'closed',
                    created_datetime: '2024-01-15T00:00:00Z',
                }),
                createMockTicket({
                    id: 3,
                    status: 'open',
                    created_datetime: '2024-02-15T00:00:00Z',
                }),
            ]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            act(() => {
                // Filter to only open tickets
                result.current.toggleStatusFilter('closed')
                result.current.toggleStatusFilter('snoozed')

                // Filter to January only
                result.current.setRangeFilter({
                    start: new Date('2024-01-01').getTime(),
                    end: new Date('2024-01-31').getTime(),
                })
            })

            // Should only show open tickets from January
            expect(result.current.enrichedTickets).toHaveLength(1)
            expect(result.current.enrichedTickets[0].ticket.id).toBe(1)
        })

        it('should return all tickets when all status filters are toggled off', () => {
            const tickets = [createMockTicket({ id: 1 })]

            const { result } = renderHook(
                () => useTimelineData({ ...defaultParams, tickets }),
                { wrapper: createWrapper() },
            )

            act(() => {
                result.current.toggleStatusFilter('open')
                result.current.toggleStatusFilter('closed')
                result.current.toggleStatusFilter('snoozed')
            })

            // When no status filters are active, it returns all tickets
            expect(result.current.enrichedTickets).toHaveLength(1)
        })
    })
})
