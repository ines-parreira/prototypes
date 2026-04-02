import type {
    OrderRefund,
    OrderRefundLineItem,
    OrderReturn,
} from '../../../../types'
import { groupOrderLineItems } from '../sections/groupOrderLineItems'

const makeItem = (id: number, quantity = 1) => ({
    id,
    title: `Item ${id}`,
    quantity,
    price: '25.00',
    sku: null,
    product_id: null,
    variant_id: null,
})

let refundIdCounter = 1
const makeRefundLineItem = (
    line_item_id: number,
    quantity: number,
    restock_type: OrderRefundLineItem['restock_type'],
): OrderRefundLineItem => ({
    id: refundIdCounter++,
    quantity,
    line_item_id,
    restock_type,
    subtotal: 0,
    total_tax: 0,
})

const makeRefund = (
    overrides: Partial<OrderRefund> &
        Pick<OrderRefund, 'refund_line_items' | 'transactions'>,
): OrderRefund => ({
    id: refundIdCounter++,
    order_id: 1,
    created_at: '2026-01-01T00:00:00Z',
    note: '',
    processed_at: '2026-01-01T00:00:00Z',
    ...overrides,
})

let returnIdCounter = 1
const makeReturn = (
    closed: boolean,
    return_line_items: OrderReturn['return_line_items'],
): OrderReturn => ({
    id: returnIdCounter++,
    closed_at: closed ? '2026-01-15T00:00:00Z' : null,
    return_line_items,
})

describe('groupOrderLineItems', () => {
    it('puts all items in active when no refunds or returns', () => {
        const items = [makeItem(1), makeItem(2)]
        const result = groupOrderLineItems(items)

        expect(result.active).toHaveLength(2)
        expect(result.returnInProgress).toHaveLength(0)
        expect(result.returnClosed).toHaveLength(0)
        expect(result.removed).toHaveLength(0)
    })

    it('puts items with open returns in returnInProgress', () => {
        const items = [makeItem(1), makeItem(2)]
        const returns = [makeReturn(false, [{ line_item_id: 1, quantity: 1 }])]

        const result = groupOrderLineItems(items, [], returns)

        expect(result.returnInProgress).toHaveLength(1)
        expect(result.returnInProgress[0].lineItem.id).toBe(1)
        expect(result.active).toHaveLength(1)
        expect(result.active[0].lineItem.id).toBe(2)
    })

    it('puts items with closed returns in returnClosed', () => {
        const items = [makeItem(1)]
        const returns = [makeReturn(true, [{ line_item_id: 1, quantity: 1 }])]

        const result = groupOrderLineItems(items, [], returns)

        expect(result.returnClosed).toHaveLength(1)
        expect(result.active).toHaveLength(0)
    })

    it('puts cancel restock_type items in removed', () => {
        const items = [makeItem(1), makeItem(2)]
        const refunds = [
            makeRefund({
                refund_line_items: [makeRefundLineItem(1, 1, 'cancel')],
                transactions: [],
            }),
        ]

        const result = groupOrderLineItems(items, refunds)

        expect(result.removed).toHaveLength(1)
        expect(result.removed[0].lineItem.id).toBe(1)
        expect(result.active).toHaveLength(1)
    })

    it('puts no_restock items in removed', () => {
        const items = [makeItem(1)]
        const refunds = [
            makeRefund({
                refund_line_items: [makeRefundLineItem(1, 1, 'no_restock')],
                transactions: [],
            }),
        ]

        const result = groupOrderLineItems(items, refunds)

        expect(result.removed).toHaveLength(1)
        expect(result.active).toHaveLength(0)
    })

    it('puts return restock_type in returnClosed, not removed or active', () => {
        const items = [makeItem(1)]
        const refunds = [
            makeRefund({
                refund_line_items: [makeRefundLineItem(1, 1, 'return')],
                transactions: [],
            }),
        ]

        const result = groupOrderLineItems(items, refunds)

        expect(result.removed).toHaveLength(0)
        expect(result.active).toHaveLength(0)
        expect(result.returnClosed).toHaveLength(1)
        expect(result.returnClosed[0].lineItem.id).toBe(1)
        expect(result.returnClosed[0].quantity).toBe(1)
    })

    it('does not double-count when both returns array and restock_type return exist', () => {
        const items = [makeItem(1, 2)]
        const returns = [makeReturn(true, [{ line_item_id: 1, quantity: 1 }])]
        const refunds = [
            makeRefund({
                refund_line_items: [makeRefundLineItem(1, 1, 'return')],
                transactions: [],
            }),
        ]

        const result = groupOrderLineItems(items, refunds, returns)

        expect(result.returnClosed).toHaveLength(1)
        expect(result.returnClosed[0].quantity).toBe(1)
        expect(result.active).toHaveLength(1)
        expect(result.active[0].quantity).toBe(1)
    })

    it('handles mixed returns and removed items', () => {
        const items = [makeItem(1, 3), makeItem(2, 2)]
        const returns = [
            makeReturn(false, [{ line_item_id: 1, quantity: 1 }]),
            makeReturn(true, [{ line_item_id: 1, quantity: 1 }]),
        ]
        const refunds = [
            makeRefund({
                refund_line_items: [makeRefundLineItem(2, 2, 'cancel')],
                transactions: [],
            }),
        ]

        const result = groupOrderLineItems(items, refunds, returns)

        expect(result.returnInProgress).toHaveLength(1)
        expect(result.returnInProgress[0].quantity).toBe(1)
        expect(result.returnClosed).toHaveLength(1)
        expect(result.returnClosed[0].quantity).toBe(1)
        expect(result.active).toHaveLength(1)
        expect(result.active[0].quantity).toBe(1)
        expect(result.removed).toHaveLength(1)
        expect(result.removed[0].quantity).toBe(2)
    })

    it('treats returns without closed_at as in progress', () => {
        const items = [makeItem(1)]
        const returns = [
            {
                id: 1,
                closed_at: null,
                return_line_items: [{ line_item_id: 1, quantity: 1 }],
            },
        ]

        const result = groupOrderLineItems(items, [], returns)

        expect(result.returnInProgress).toHaveLength(1)
    })

    it('treats returns without closed_at field as in progress', () => {
        const items = [makeItem(1)]
        const returns = [
            { id: 1, return_line_items: [{ line_item_id: 1, quantity: 1 }] },
        ]

        const result = groupOrderLineItems(items, [], returns)

        expect(result.returnInProgress).toHaveLength(1)
    })

    it('clamps quantity when refund exceeds line item quantity', () => {
        const items = [makeItem(1, 2)]
        const refunds = [
            makeRefund({
                refund_line_items: [makeRefundLineItem(1, 5, 'cancel')],
                transactions: [],
            }),
        ]

        const result = groupOrderLineItems(items, refunds)

        expect(result.removed).toHaveLength(1)
        expect(result.removed[0].quantity).toBe(2)
        expect(result.active).toHaveLength(0)
    })

    it('clamps quantity when return exceeds line item quantity', () => {
        const items = [makeItem(1, 1)]
        const returns = [makeReturn(false, [{ line_item_id: 1, quantity: 3 }])]

        const result = groupOrderLineItems(items, [], returns)

        expect(result.returnInProgress).toHaveLength(1)
        expect(result.returnInProgress[0].quantity).toBe(1)
        expect(result.active).toHaveLength(0)
    })

    it('treats legacy_restock as return (returnClosed)', () => {
        const items = [makeItem(1)]
        const refunds = [
            makeRefund({
                refund_line_items: [makeRefundLineItem(1, 1, 'legacy_restock')],
                transactions: [],
            }),
        ]

        const result = groupOrderLineItems(items, refunds)

        expect(result.returnClosed).toHaveLength(1)
        expect(result.active).toHaveLength(0)
        expect(result.removed).toHaveLength(0)
    })

    it('handles GraphQL uppercase restock_type CANCEL', () => {
        const items = [makeItem(1)]
        const refunds = [
            makeRefund({
                refund_line_items: [
                    makeRefundLineItem(1, 1, 'CANCEL' as 'cancel'),
                ],
                transactions: [],
            }),
        ]

        const result = groupOrderLineItems(items, refunds)

        expect(result.removed).toHaveLength(1)
        expect(result.active).toHaveLength(0)
    })

    it('handles GraphQL uppercase restock_type RETURN', () => {
        const items = [makeItem(1)]
        const refunds = [
            makeRefund({
                refund_line_items: [
                    makeRefundLineItem(1, 1, 'RETURN' as 'return'),
                ],
                transactions: [],
            }),
        ]

        const result = groupOrderLineItems(items, refunds)

        expect(result.returnClosed).toHaveLength(1)
        expect(result.active).toHaveLength(0)
    })

    it('handles GraphQL uppercase return status CLOSED', () => {
        const items = [makeItem(1)]
        const returns = [
            {
                id: 1,
                status: 'CLOSED',
                return_line_items: [{ line_item_id: 1, quantity: 1 }],
            },
        ]

        const result = groupOrderLineItems(items, [], returns)

        expect(result.returnClosed).toHaveLength(1)
        expect(result.active).toHaveLength(0)
    })
})
