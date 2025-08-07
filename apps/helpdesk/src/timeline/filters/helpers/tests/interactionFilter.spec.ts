import { TicketCompact } from '@gorgias/helpdesk-queries'

import { Order } from 'constants/integrations/types/shopify'

import { ALL_FILTERS, INTERACTION_FILTER_OPTIONS } from '../../../constants'
import { fromOrder, fromTicket } from '../../../helpers/timelineItem'
import {
    InteractionFilterType,
    TimelineItem,
    TimelineItemKind,
} from '../../../types'
import { filterTicketsByType, getTypeOptionLabels } from '../interactionFilter'

describe('interactionFilter', () => {
    const mockTicket1: TicketCompact = {
        id: 1,
        created_datetime: '2024-01-01T10:00:00Z',
        subject: 'Test ticket 1',
    } as TicketCompact

    const mockTicket2: TicketCompact = {
        id: 2,
        created_datetime: '2024-01-02T10:00:00Z',
        subject: 'Test ticket 2',
    } as TicketCompact

    const mockOrder1: Order = {
        id: 1,
        created_at: '2024-01-01T10:00:00Z',
        line_items: [],
        financial_status: 'paid' as any,
        fulfillment_status: null,
        note: 'Test order 1',
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
        updated_at: '2024-01-01T10:00:00Z',
    }

    const mockOrder2: Order = {
        id: 2,
        created_at: '2024-01-02T10:00:00Z',
        line_items: [],
        financial_status: 'pending' as any,
        fulfillment_status: null,
        note: 'Test order 2',
        tags: '',
        shipping_address: {} as any,
        billing_address: {} as any,
        discount_codes: [],
        shipping_lines: [],
        total_line_items_price: '20.00',
        total_discounts: '0.00',
        subtotal_price: '20.00',
        total_tax: '0.00',
        total_price: '20.00',
        taxes_included: false,
        discount_applications: [],
        refunds: [],
        updated_at: '2024-01-02T10:00:00Z',
    }

    const ticketItem1: TimelineItem = fromTicket(mockTicket1)
    const ticketItem2: TimelineItem = fromTicket(mockTicket2)
    const orderItem1: TimelineItem = fromOrder(mockOrder1)
    const orderItem2: TimelineItem = fromOrder(mockOrder2)

    const mixedItems: TimelineItem[] = [
        ticketItem1,
        orderItem1,
        ticketItem2,
        orderItem2,
    ]

    describe('getTypeOptionLabels', () => {
        it('should return "All" when all interaction filter options are selected', () => {
            const selectedTypes: InteractionFilterType[] = ['ticket', 'order']
            const result = getTypeOptionLabels(selectedTypes)

            expect(result).toEqual(ALL_FILTERS)
        })

        it('should return ticket label when only ticket is selected', () => {
            const selectedTypes: InteractionFilterType[] = ['ticket']
            const result = getTypeOptionLabels(selectedTypes)

            expect(result).toEqual(['Ticket'])
        })

        it('should return order label when only order is selected', () => {
            const selectedTypes: InteractionFilterType[] = ['order']
            const result = getTypeOptionLabels(selectedTypes)

            expect(result).toEqual(['Order'])
        })

        it('should return empty array when no types are selected', () => {
            const selectedTypes: InteractionFilterType[] = []
            const result = getTypeOptionLabels(selectedTypes)

            expect(result).toEqual([])
        })

        it('should handle multiple types correctly', () => {
            const selectedTypes: InteractionFilterType[] = ['ticket', 'order']
            const result = getTypeOptionLabels(selectedTypes)

            expect(result).toEqual(ALL_FILTERS)
        })

        it('should filter out undefined values from missing filter options', () => {
            // This tests the .filter(Boolean) part of the function
            const selectedTypes = ['ticket'] as InteractionFilterType[]
            const result = getTypeOptionLabels(selectedTypes)

            expect(result).toEqual(['Ticket'])
            expect(result).not.toContain(undefined)
        })

        it('should match the length of INTERACTION_FILTER_OPTIONS for all selection', () => {
            const selectedTypes: InteractionFilterType[] = ['ticket', 'order']

            expect(selectedTypes.length).toBe(INTERACTION_FILTER_OPTIONS.length)
            expect(getTypeOptionLabels(selectedTypes)).toEqual(ALL_FILTERS)
        })
    })

    describe('filterTicketsByType', () => {
        describe('when all types are selected', () => {
            it('should return all items when both ticket and order are selected', () => {
                const selectedTypes: InteractionFilterType[] = [
                    'ticket',
                    'order',
                ]
                const result = filterTicketsByType(mixedItems, selectedTypes)

                expect(result).toHaveLength(4)
                expect(result).toEqual(mixedItems)
            })

            it('should return all items when selection length equals INTERACTION_FILTER_OPTIONS length', () => {
                const selectedTypes: InteractionFilterType[] = [
                    'ticket',
                    'order',
                ]

                expect(selectedTypes.length).toBe(
                    INTERACTION_FILTER_OPTIONS.length,
                )

                const result = filterTicketsByType(mixedItems, selectedTypes)
                expect(result).toEqual(mixedItems)
            })
        })

        describe('when only tickets are selected', () => {
            it('should return only ticket items when ticket is selected', () => {
                const selectedTypes: InteractionFilterType[] = ['ticket']
                const result = filterTicketsByType(mixedItems, selectedTypes)

                expect(result).toHaveLength(2)
                expect(result).toEqual([ticketItem1, ticketItem2])

                // Verify all returned items are tickets
                result.forEach((item) => {
                    expect(item.kind).toBe(TimelineItemKind.Ticket)
                })
            })

            it('should return empty array when no tickets exist and ticket is selected', () => {
                const onlyOrders = [orderItem1, orderItem2]
                const selectedTypes: InteractionFilterType[] = ['ticket']
                const result = filterTicketsByType(onlyOrders, selectedTypes)

                expect(result).toHaveLength(0)
                expect(result).toEqual([])
            })

            it('should handle single ticket item correctly', () => {
                const singleTicket = [ticketItem1]
                const selectedTypes: InteractionFilterType[] = ['ticket']
                const result = filterTicketsByType(singleTicket, selectedTypes)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual(ticketItem1)
                expect(result[0].kind).toBe(TimelineItemKind.Ticket)
            })
        })

        describe('when only orders are selected', () => {
            it('should return only order items when order is selected', () => {
                const selectedTypes: InteractionFilterType[] = ['order']
                const result = filterTicketsByType(mixedItems, selectedTypes)

                expect(result).toHaveLength(2)
                expect(result).toEqual([orderItem1, orderItem2])

                // Verify all returned items are orders
                result.forEach((item) => {
                    expect(item.kind).toBe(TimelineItemKind.Order)
                })
            })

            it('should return empty array when no orders exist and order is selected', () => {
                const onlyTickets = [ticketItem1, ticketItem2]
                const selectedTypes: InteractionFilterType[] = ['order']
                const result = filterTicketsByType(onlyTickets, selectedTypes)

                expect(result).toHaveLength(0)
                expect(result).toEqual([])
            })

            it('should handle single order item correctly', () => {
                const singleOrder = [orderItem1]
                const selectedTypes: InteractionFilterType[] = ['order']
                const result = filterTicketsByType(singleOrder, selectedTypes)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual(orderItem1)
                expect(result[0].kind).toBe(TimelineItemKind.Order)
            })
        })

        describe('edge cases', () => {
            it('should handle empty items array', () => {
                const emptyItems: TimelineItem[] = []
                const selectedTypes: InteractionFilterType[] = ['ticket']
                const result = filterTicketsByType(emptyItems, selectedTypes)

                expect(result).toHaveLength(0)
                expect(result).toEqual([])
            })

            it('should handle empty selected types array', () => {
                const selectedTypes: InteractionFilterType[] = []
                const result = filterTicketsByType(mixedItems, selectedTypes)

                // When no types are selected, it should filter out tickets (return non-tickets)
                expect(result).toHaveLength(2)
                expect(result).toEqual([orderItem1, orderItem2])
            })

            it('should prioritize ticket filtering when ticket is the first selected type', () => {
                // This tests the logic: if (selectedType[0] === 'ticket')
                const selectedTypes: InteractionFilterType[] = ['ticket']
                const result = filterTicketsByType(mixedItems, selectedTypes)

                expect(result).toEqual([ticketItem1, ticketItem2])
            })

            it('should filter to orders when ticket is not the first selected type', () => {
                // This tests the else branch that filters out tickets (returns orders)
                const selectedTypes: InteractionFilterType[] = ['order']
                const result = filterTicketsByType(mixedItems, selectedTypes)

                expect(result).toEqual([orderItem1, orderItem2])
            })
        })

        describe('integration with isTicket function', () => {
            it('should correctly identify ticket items', () => {
                const selectedTypes: InteractionFilterType[] = ['ticket']
                const result = filterTicketsByType(mixedItems, selectedTypes)

                result.forEach((item) => {
                    expect(item.kind).toBe(TimelineItemKind.Ticket)
                    expect('ticket' in item).toBe(true)
                    expect('order' in item).toBe(false)
                })
            })

            it('should correctly identify order items', () => {
                const selectedTypes: InteractionFilterType[] = ['order']
                const result = filterTicketsByType(mixedItems, selectedTypes)

                result.forEach((item) => {
                    expect(item.kind).toBe(TimelineItemKind.Order)
                    expect('order' in item).toBe(true)
                    expect('ticket' in item).toBe(false)
                })
            })
        })
    })

    describe('constants integration', () => {
        it('should work with actual INTERACTION_FILTER_OPTIONS constant', () => {
            expect(INTERACTION_FILTER_OPTIONS).toHaveLength(2)
            expect(INTERACTION_FILTER_OPTIONS[0].value).toBe('ticket')
            expect(INTERACTION_FILTER_OPTIONS[1].value).toBe('order')

            const allTypes = INTERACTION_FILTER_OPTIONS.map(
                (option) => option.value,
            ) as InteractionFilterType[]
            const result = getTypeOptionLabels(allTypes)

            expect(result).toEqual(ALL_FILTERS)
        })

        it('should work with actual ALL_FILTERS constant', () => {
            expect(ALL_FILTERS).toEqual(['All'])

            const allTypes: InteractionFilterType[] = ['ticket', 'order']
            const result = getTypeOptionLabels(allTypes)

            expect(result).toEqual(ALL_FILTERS)
        })
    })
})
