import type { OrderEcommerceData } from '../../../../types'
import { sortOrdersByDateDesc } from '../sortOrders'

const makeOrder = (
    createdAt: string,
    overrides?: Partial<OrderEcommerceData>,
): OrderEcommerceData => ({
    id: `order-${createdAt}`,
    account_id: 1,
    created_datetime: createdAt,
    updated_datetime: createdAt,
    data: {
        id: 1,
        order_number: 1,
        name: `#${createdAt}`,
        created_at: createdAt,
        updated_at: createdAt,
        currency: 'USD',
        total_price: '100.00',
        financial_status: 'paid',
        fulfillment_status: null,
        line_items: [],
        customer: {} as OrderEcommerceData['data']['customer'],
    },
    source_type: 'shopify',
    integration_id: 1,
    external_id: '1',
    ...overrides,
})

describe('sortOrdersByDateDesc', () => {
    it('sorts orders newest-first', () => {
        const oldest = makeOrder('2024-01-15T10:00:00Z')
        const middle = makeOrder('2024-01-16T10:00:00Z')
        const newest = makeOrder('2024-01-17T10:00:00Z')

        const result = sortOrdersByDateDesc([oldest, newest, middle])

        expect(result.map((o) => o.data.created_at)).toEqual([
            '2024-01-17T10:00:00Z',
            '2024-01-16T10:00:00Z',
            '2024-01-15T10:00:00Z',
        ])
    })

    it('returns empty array for empty input', () => {
        expect(sortOrdersByDateDesc([])).toEqual([])
    })

    it('does not mutate the input array', () => {
        const orders = [
            makeOrder('2024-01-15T10:00:00Z'),
            makeOrder('2024-01-17T10:00:00Z'),
        ]
        const originalFirst = orders[0]

        const result = sortOrdersByDateDesc(orders)

        expect(orders[0]).toBe(originalFirst)
        expect(result).not.toBe(orders)
    })

    it('handles single-element array', () => {
        const order = makeOrder('2024-01-15T10:00:00Z')

        const result = sortOrdersByDateDesc([order])

        expect(result).toEqual([order])
    })

    it('pushes orders with missing created_at to the end', () => {
        const valid = makeOrder('2024-01-15T10:00:00Z')
        const invalid = makeOrder(undefined as unknown as string)

        const result = sortOrdersByDateDesc([invalid, valid])

        expect(result[0].data.created_at).toBe('2024-01-15T10:00:00Z')
    })

    it('preserves relative order for identical timestamps', () => {
        const first = makeOrder('2024-01-15T10:00:00Z', { id: 'first' })
        const second = makeOrder('2024-01-15T10:00:00Z', { id: 'second' })

        const result = sortOrdersByDateDesc([first, second])

        expect(result.map((o) => o.id)).toEqual(['first', 'second'])
    })
})
