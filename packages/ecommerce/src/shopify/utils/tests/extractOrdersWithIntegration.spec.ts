import { describe, expect, it } from 'vitest'

import { extractOrdersWithIntegration } from '../extractOrdersWithIntegration'

type TestOrder = { id: number }

const shopify = (orders?: TestOrder[]) => ({
    __integration_type__: 'shopify',
    orders,
})

describe('extractOrdersWithIntegration', () => {
    it.each([
        ['undefined', undefined],
        ['empty object', {}],
        [
            'integration without orders key',
            { '1': { __integration_type__: 'shopify' } },
        ],
        ['integration with empty orders', { '1': shopify([]) }],
    ])(
        'should return empty array when integrations is %s',
        (_, integrations) => {
            expect(extractOrdersWithIntegration(integrations as any)).toEqual(
                [],
            )
        },
    )

    it('should extract orders from shopify integrations only', () => {
        const result = extractOrdersWithIntegration({
            '10': shopify([{ id: 1 }]),
            '20': { __integration_type__: 'other', orders: [{ id: 2 }] },
        })

        expect(result).toEqual([{ order: { id: 1 }, integrationId: 10 }])
    })

    it('should map multiple orders with parsed integration id', () => {
        const result = extractOrdersWithIntegration({
            '42': shopify([{ id: 1 }, { id: 2 }]),
            '99': shopify([{ id: 3 }]),
        })

        expect(result).toEqual([
            { order: { id: 1 }, integrationId: 42 },
            { order: { id: 2 }, integrationId: 42 },
            { order: { id: 3 }, integrationId: 99 },
        ])
    })
})
