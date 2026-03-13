import { renderHook } from '@repo/testing'

import {
    ProcedureTemplatesData,
    useProceduresTemplates,
} from './useProceduresTemplates'

describe('useProceduresTemplates', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return all procedure templates', () => {
        const { result } = renderHook(() => useProceduresTemplates())

        expect(result.current.proceduresTemplates).toHaveLength(
            ProcedureTemplatesData.length,
        )
    })

    it.each([
        [
            'Order status, tracking or delivery timing',
            'WHEN: The customer asks about order status, tracking, or delivery timing',
        ],
        [
            'One or more items missing from an order',
            'WHEN: The customer reports that one or more items are missing from their order',
        ],
        ['Order cancellations', 'WHEN: The customer asks to cancel an order'],
        [
            'Shipping address updates or edits in an order',
            'WHEN: The customer asks to edit or update the shipping address for an order',
        ],
        [
            'Product edits in an order (replace product, remove product)',
            'WHEN: The customer asks to edit the products in an order',
        ],
        [
            'Item is damaged, defective, broken or not working as expected',
            'WHEN: The customer reports that an item is damaged, defective, broken, or not working as expected',
        ],
        [
            'Returns and exchanges',
            'WHEN: The customer asks about a return, exchange, or refund status',
        ],
        [
            'Promo codes and free shipping',
            'WHEN: The customer asks about promo codes or free shipping',
        ],
        [
            'Subscription modification (pause, skip, resume)',
            'WHEN: The customer asks to modify their subscription (pause, skip or resume)',
        ],
        [
            'Subscription cancellations',
            'WHEN: The customer asks to cancel their subscription',
        ],
    ])('should map "%s" to guidance "%s"', (procedureName, guidanceName) => {
        const { result } = renderHook(() => useProceduresTemplates())

        const template = result.current.proceduresTemplates.find(
            (t) => t.name === procedureName,
        )

        expect(template?.guidance?.name).toBe(guidanceName)
    })
})
