import createMetafieldVariable from '../createMetafieldVariable'

describe('createMetafieldVariable', () => {
    describe('returns undefined for non-matching values', () => {
        it.each([
            undefined,
            null,
            '',
            'random-string',
            '{{ticket.customer.name}}',
        ])('returns undefined for %p', (value) => {
            expect(createMetafieldVariable(value as string)).toBeUndefined()
        })
    })

    describe('customer metafield', () => {
        it('returns customer metafield variable', () => {
            const value =
                '{{ticket.customer.integrations[123].customer.metafields.loyalty_points.value}}'
            const result = createMetafieldVariable(value)

            expect(result).toEqual({
                type: 'shopify',
                name: 'loyalty_points',
                fullName: 'Customer metafield: loyalty_points',
                value,
                integration: 'shopify',
            })
        })
    })

    describe('order metafield', () => {
        it('returns order metafield variable', () => {
            const value =
                '{{ticket.customer.integrations[123].orders[0].metafields.tracking_number.value}}'
            const result = createMetafieldVariable(value)

            expect(result).toEqual({
                type: 'shopify',
                name: 'tracking_number',
                fullName: 'Order metafield: tracking_number',
                value,
                integration: 'shopify',
            })
        })
    })

    describe('draft order metafield', () => {
        it('returns draft order metafield variable', () => {
            const value =
                '{{ticket.customer.integrations[123].draft_orders[0].metafields.draft_status.value}}'
            const result = createMetafieldVariable(value)

            expect(result).toEqual({
                type: 'shopify',
                name: 'draft_status',
                fullName: 'Draft Order metafield: draft_status',
                value,
                integration: 'shopify',
            })
        })
    })

    describe('generic metafield', () => {
        it('returns generic metafield variable when no specific category matches', () => {
            const value = '{{some.path.metafields.custom_field.value}}'
            const result = createMetafieldVariable(value)

            expect(result).toEqual({
                type: 'shopify',
                name: 'custom_field',
                fullName: 'Metafield: custom_field',
                value,
                integration: 'shopify',
            })
        })
    })

    describe('metafield name extraction', () => {
        it('extracts metafield name with underscores', () => {
            const value = '{{path.metafields.my_custom_field_123.value}}'
            const result = createMetafieldVariable(value)

            expect(result?.name).toBe('my_custom_field_123')
        })

        it('extracts metafield name with numbers', () => {
            const value = '{{path.metafields.field123.value}}'
            const result = createMetafieldVariable(value)

            expect(result?.name).toBe('field123')
        })
    })
})
