import { renderHook } from 'utils/testing/renderHook'

import useHumanReadableOrderConditions from '../useHumanReadableOrderConditions'

describe('useHumanReadableOrderConditions()', () => {
    it('should handle string variable options', () => {
        const { result } = renderHook(() =>
            useHumanReadableOrderConditions({
                variables: [
                    {
                        name: 'Fulfillment status',
                        value: 'objects.order.external_fulfillment_status',
                        nodeType: 'order_selection',
                        type: 'string',
                        options: [
                            { value: null, label: 'unfulfilled' },
                            { value: 'partial', label: 'partially fulfilled' },
                            { value: 'fulfilled', label: 'fulfilled' },
                            { value: 'restocked', label: 'restocked' },
                        ],
                    },
                ],
                conditions: [
                    {
                        equals: [
                            {
                                var: 'objects.order.external_fulfillment_status',
                            },
                            null,
                        ],
                    },
                ],
            }),
        )

        expect(result.current).toEqual(['Fulfillment status is unfulfilled'])
    })
})
