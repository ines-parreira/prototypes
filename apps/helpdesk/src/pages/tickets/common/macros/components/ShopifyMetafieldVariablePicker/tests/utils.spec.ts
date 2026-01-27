import { CATEGORIES, getMetafieldVariableValue } from '../utils'

describe('getMetafieldVariableValue', () => {
    it('returns correct variable string for Customer category', () => {
        const result = getMetafieldVariableValue(
            123,
            'Customer',
            'loyalty_points',
        )

        expect(result).toBe(
            '{{ticket.customer.integrations[123].customer.metafields.loyalty_points.value}}',
        )
    })

    it('returns correct variable string for Order category', () => {
        const result = getMetafieldVariableValue(
            456,
            'Order',
            'tracking_number',
        )

        expect(result).toBe(
            '{{ticket.customer.integrations[456].orders[0].metafields.tracking_number.value}}',
        )
    })

    it('returns correct variable string for DraftOrder category', () => {
        const result = getMetafieldVariableValue(
            789,
            'DraftOrder',
            'discount_code',
        )

        expect(result).toBe(
            '{{ticket.customer.integrations[789].draft_orders[0].metafields.discount_code.value}}',
        )
    })

    it('handles different integration IDs', () => {
        const result1 = getMetafieldVariableValue(1, 'Customer', 'key')
        const result2 = getMetafieldVariableValue(99999, 'Customer', 'key')

        expect(result1).toBe(
            '{{ticket.customer.integrations[1].customer.metafields.key.value}}',
        )
        expect(result2).toBe(
            '{{ticket.customer.integrations[99999].customer.metafields.key.value}}',
        )
    })

    it('handles different metafield keys', () => {
        const result1 = getMetafieldVariableValue(1, 'Customer', 'simple_key')
        const result2 = getMetafieldVariableValue(
            1,
            'Customer',
            'namespace.complex_key',
        )

        expect(result1).toBe(
            '{{ticket.customer.integrations[1].customer.metafields.simple_key.value}}',
        )
        expect(result2).toBe(
            '{{ticket.customer.integrations[1].customer.metafields.namespace.complex_key.value}}',
        )
    })
})

describe('CATEGORIES', () => {
    it('contains all expected categories', () => {
        expect(CATEGORIES).toHaveLength(3)
    })

    it('has Customer category with correct properties', () => {
        const customer = CATEGORIES.find((c) => c.id === 'Customer')
        expect(customer).toEqual({ id: 'Customer', name: 'Customer' })
    })

    it('has Order category with correct properties', () => {
        const order = CATEGORIES.find((c) => c.id === 'Order')
        expect(order).toEqual({ id: 'Order', name: 'Last Order' })
    })

    it('has DraftOrder category with correct properties', () => {
        const draftOrder = CATEGORIES.find((c) => c.id === 'DraftOrder')
        expect(draftOrder).toEqual({
            id: 'DraftOrder',
            name: 'Last Draft Order',
        })
    })
})
