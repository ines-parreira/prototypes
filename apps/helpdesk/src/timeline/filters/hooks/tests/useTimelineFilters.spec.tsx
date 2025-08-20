import { act, renderHook } from '@testing-library/react'

import { TicketCompact, TicketStatus } from '@gorgias/helpdesk-queries'

import { TicketChannel } from 'business/types/ticket'
import { Order } from 'constants/integrations/types/shopify'

import { TimelineItem, TimelineItemKind } from '../../../types'
import { ActiveFilters, useTimelineFilters } from '../useTimelineFilters'

jest.mock('common/segment')

const createMockTicket = (overrides: Partial<TicketCompact>): TicketCompact =>
    ({
        id: 1,
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
        status: 'open' as TicketStatus,
        subject: 'Test ticket',
        updated_datetime: '2024-01-01T12:30:00Z',
        priority: undefined,
        ...overrides,
    }) as TicketCompact

const mockOpenTicket = createMockTicket({
    id: 1,
    status: 'open' as TicketStatus,
    subject: 'Open ticket',
    snooze_datetime: null,
})

const mockClosedTicket = createMockTicket({
    id: 2,
    status: 'closed' as TicketStatus,
    subject: 'Closed ticket',
    snooze_datetime: null,
})

const mockSnoozedTicket = createMockTicket({
    id: 3,
    status: 'closed' as TicketStatus,
    subject: 'Snoozed ticket',
    snooze_datetime: '2024-01-02T10:00:00Z',
})

const mockOrder: Order = {
    id: 1,
    name: 'Order #1',
    line_items: [],
    financial_status: 'paid' as any,
    fulfillment_status: null,
    note: 'Test order',
    tags: '',
    shipping_address: {} as any,
    billing_address: {} as any,
    discount_codes: [],
    shipping_lines: [],
    total_line_items_price: '10.00',
    total_discounts: '0.00',
    subtotal_price: '10.00',
    total_tax: '0.00',
    total_price: '10.00',
    taxes_included: false,
    discount_applications: [],
    refunds: [],
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
}

const mockOpenTicketItem: TimelineItem = {
    kind: TimelineItemKind.Ticket,
    ticket: mockOpenTicket,
}

const mockClosedTicketItem: TimelineItem = {
    kind: TimelineItemKind.Ticket,
    ticket: mockClosedTicket,
}

const mockSnoozedTicketItem: TimelineItem = {
    kind: TimelineItemKind.Ticket,
    ticket: mockSnoozedTicket,
}

const mockOrderItem: TimelineItem = {
    kind: TimelineItemKind.Order,
    order: mockOrder,
}

const mockItems: TimelineItem[] = [
    mockOpenTicketItem,
    mockClosedTicketItem,
    mockSnoozedTicketItem,
    mockOrderItem,
]

describe('useTimelineFilters', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('initial state', () => {
        it('should return correct initial activeFilters', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const expectedActiveFilters: ActiveFilters = {
                type: {
                    ticket: true,
                    order: true,
                },
                status: {
                    open: true,
                    closed: true,
                    snooze: true,
                },
                sortOption: {
                    order: 'desc',
                    key: 'last_message_datetime',
                    label: 'Last updated',
                },
            }

            expect(result.current.activeFilters).toEqual(expectedActiveFilters)
        })

        it('should return correct initial selectedStatusKeys', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            expect(result.current.selectedStatusKeys).toEqual([
                'open',
                'closed',
                'snooze',
            ])
        })

        it('should return correct initial selectedTypeKeys', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            expect(result.current.selectedTypeKeys).toEqual(['ticket', 'order'])
        })

        it('should initialize with default range filter', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            expect(result.current.rangeFilter).toEqual({
                start: null,
                end: null,
            })
            expect(typeof result.current.setRangeFilter).toBe('function')
        })

        it('should initialize with default sort option and provide setSortOption function', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            expect(result.current.sortedTickets).toEqual(expect.any(Array))
            expect(result.current.sortedTickets.length).toBe(mockItems.length)
            expect(typeof result.current.setSortOption).toBe('function')
        })
    })

    describe('activeFilters state management', () => {
        it('should update activeFilters when setActiveFilters is called', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                type: {
                    ticket: true,
                    order: false,
                },
                status: {
                    open: true,
                    closed: false,
                    snooze: false,
                },
                sortOption: {
                    order: 'asc',
                    key: 'created_datetime',
                    label: 'Created',
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.activeFilters).toEqual(newActiveFilters)
        })

        it('should update selectedStatusKeys when status filters change', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                status: {
                    open: true,
                    closed: false,
                    snooze: false,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.selectedStatusKeys).toEqual(['open'])
        })

        it('should update selectedTypeKeys when type filters change', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                type: {
                    ticket: false,
                    order: true,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.selectedTypeKeys).toEqual(['order'])
        })
    })

    describe('filtering logic', () => {
        it('should filter by open status only', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                status: {
                    open: true,
                    closed: false,
                    snooze: false,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.sortedTickets).toHaveLength(1)
            expect(result.current.sortedTickets[0]).toEqual(mockOpenTicketItem)
        })

        it('should filter by closed status only', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                status: {
                    open: false,
                    closed: true,
                    snooze: false,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.sortedTickets).toHaveLength(1)
            expect(result.current.sortedTickets[0]).toEqual(
                mockClosedTicketItem,
            )
        })

        it('should filter by snoozed status only', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                status: {
                    open: false,
                    closed: false,
                    snooze: true,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.sortedTickets).toHaveLength(1)
            expect(result.current.sortedTickets[0]).toEqual(
                mockSnoozedTicketItem,
            )
        })

        it('should filter by ticket type only', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                type: {
                    ticket: true,
                    order: false,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.sortedTickets).toHaveLength(3)
            expect(result.current.sortedTickets).toEqual(
                expect.arrayContaining([
                    mockOpenTicketItem,
                    mockClosedTicketItem,
                    mockSnoozedTicketItem,
                ]),
            )
        })

        it('should filter by order type only', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                type: {
                    ticket: false,
                    order: true,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.sortedTickets).toHaveLength(1)
            expect(result.current.sortedTickets[0]).toEqual(mockOrderItem)
        })

        it('should return all items when no filters are selected', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                status: {
                    open: false,
                    closed: false,
                    snooze: false,
                },
                type: {
                    ticket: false,
                    order: false,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.sortedTickets).toHaveLength(mockItems.length)
        })

        it('should apply both status and type filters', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                status: {
                    open: true,
                    closed: false,
                    snooze: false,
                },
                type: {
                    ticket: true,
                    order: false,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.sortedTickets).toHaveLength(1)
            expect(result.current.sortedTickets[0]).toEqual(mockOpenTicketItem)
        })
    })

    describe('integration with real hooks', () => {
        it('should integrate filtering and sorting correctly', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                status: {
                    open: true,
                    closed: false,
                    snooze: false,
                },
                type: {
                    ticket: true,
                    order: false,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.sortedTickets).toHaveLength(1)
            expect(result.current.sortedTickets[0]).toEqual(mockOpenTicketItem)
        })

        it('should handle range filtering with other filters', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            expect(result.current.rangeFilter).toEqual({
                start: null,
                end: null,
            })
            expect(result.current.sortedTickets).toHaveLength(mockItems.length)
        })
    })

    describe('reactivity', () => {
        it('should update results when input items change', () => {
            const { result, rerender } = renderHook(
                ({ items }) => useTimelineFilters({ items }),
                { initialProps: { items: mockItems } },
            )

            expect(result.current.sortedTickets).toHaveLength(4)

            const newItems = [mockOpenTicketItem]
            rerender({ items: newItems })

            expect(result.current.sortedTickets).toHaveLength(1)
            expect(result.current.sortedTickets[0]).toEqual(mockOpenTicketItem)
        })

        it('should update results when filter selection changes', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            expect(result.current.sortedTickets).toHaveLength(4)

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                status: {
                    open: true,
                    closed: false,
                    snooze: false,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.sortedTickets).toHaveLength(1)
            expect(result.current.sortedTickets[0]).toEqual(mockOpenTicketItem)
        })

        it('should update results when type filter changes', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            expect(result.current.sortedTickets).toHaveLength(4)

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                type: {
                    ticket: true,
                    order: false,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.sortedTickets).toHaveLength(3)
            expect(result.current.sortedTickets).toEqual(
                expect.arrayContaining([
                    mockOpenTicketItem,
                    mockClosedTicketItem,
                    mockSnoozedTicketItem,
                ]),
            )
        })
    })

    describe('edge cases', () => {
        it('should handle empty items array', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: [] }),
            )

            expect(result.current.sortedTickets).toEqual([])
            expect(result.current.selectedStatusKeys).toEqual([
                'open',
                'closed',
                'snooze',
            ])
            expect(result.current.selectedTypeKeys).toEqual(['ticket', 'order'])
        })

        it('should handle partial status filter selection', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                status: {
                    open: true,
                    closed: true,
                    snooze: false,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.selectedStatusKeys).toEqual([
                'open',
                'closed',
            ])
        })

        it('should handle partial type filter selection', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                type: {
                    ticket: false,
                    order: true,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.selectedTypeKeys).toEqual(['order'])
        })

        it('should return empty arrays when no filters are selected', () => {
            const { result } = renderHook(() =>
                useTimelineFilters({ items: mockItems }),
            )

            const newActiveFilters: ActiveFilters = {
                ...result.current.activeFilters,
                status: {
                    open: false,
                    closed: false,
                    snooze: false,
                },
                type: {
                    ticket: false,
                    order: false,
                },
            }

            act(() => {
                result.current.setActiveFilters(newActiveFilters)
            })

            expect(result.current.selectedStatusKeys).toEqual([])
            expect(result.current.selectedTypeKeys).toEqual([])
        })
    })
})
