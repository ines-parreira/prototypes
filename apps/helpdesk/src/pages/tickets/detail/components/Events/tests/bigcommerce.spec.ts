import { fromJS, Map } from 'immutable'

import bigcommerceEvent from '../bigcommerce'

describe('bigcommerceEvent', () => {
    const actionConfig = {
        name: 'name',
        label: 'label',
        objectType: 'objectType',
    }

    it('Should return undefined if nothing match', () => {
        const event = bigcommerceEvent({
            integration: Map(),
            actionConfig,
            payload: Map(),
            data: Map(),
        })
        expect(event).toBeUndefined()
    })

    it('Should return undefined if actionConfig is a bigcommerceRefundOrder but no order id', () => {
        const event = bigcommerceEvent({
            integration: Map(),
            actionConfig: { ...actionConfig, name: 'bigcommerceRefundOrder' },
            payload: Map(),
            data: Map(),
        })

        expect(event).toBeUndefined()
    })

    it('Should return a refund event if actionConfig is a bigcommerceRefundOrder', () => {
        const event = bigcommerceEvent({
            integration: fromJS({
                meta: {
                    store_hash: 'shop_hash',
                },
            }),
            actionConfig: { ...actionConfig, name: 'bigcommerceRefundOrder' },
            payload: fromJS({
                bigcommerce_order_id: 1,
            }),
            data: Map(),
        })

        expect(event).toStrictEqual({
            objectLabel: '#1',
            objectLink:
                'https://store-shop_hash.mybigcommerce.com/manage/orders/1',
        })
    })

    it.each(['bigcommerceDuplicateOrder', 'bigcommerceCreateOrder'])(
        'Should return undefined if actionConfig is a %s but no checkoutId',
        (actionName) => {
            const event = bigcommerceEvent({
                integration: Map(),
                actionConfig: { ...actionConfig, name: actionName },
                payload: Map(),
                data: Map(),
            })

            expect(event).toBeUndefined()
        },
    )

    it.each(['bigcommerceDuplicateOrder', 'bigcommerceCreateOrder'])(
        'Should return undefined if actionConfig is a %s but no draft order match',
        (actionName) => {
            const event = bigcommerceEvent({
                integration: Map(),
                actionConfig: { ...actionConfig, name: actionName },
                payload: fromJS({
                    bigcommerce_checkout_id: 1,
                }),
                data: fromJS({
                    draft_orders: [{ cart_id: 2 }],
                }),
            })

            expect(event).toBeUndefined()
        },
    )

    it.each(['bigcommerceDuplicateOrder', 'bigcommerceCreateOrder'])(
        'Should return %s event if actionConfig is a %s',
        (actionName) => {
            const event = bigcommerceEvent({
                integration: fromJS({
                    meta: {
                        store_hash: 'shop_hash',
                    },
                }),
                actionConfig: { ...actionConfig, name: actionName },
                payload: fromJS({
                    bigcommerce_checkout_id: 1,
                }),
                data: fromJS({
                    draft_orders: [{ cart_id: 1, id: 123 }],
                }),
            })

            expect(event).toStrictEqual({
                objectLabel: '#123',
                objectLink:
                    'https://store-shop_hash.mybigcommerce.com/manage/orders/123',
            })
        },
    )

    it.each(['bigcommerceDuplicateOrder', 'bigcommerceCreateOrder'])(
        'Should return %s event if actionConfig is a %s',
        (actionName) => {
            const event = bigcommerceEvent({
                integration: fromJS({
                    meta: {
                        store_hash: 'shop_hash',
                    },
                }),
                actionConfig: { ...actionConfig, name: actionName },
                payload: fromJS({
                    bigcommerce_checkout_id: 1,
                }),
                data: fromJS({
                    orders: [{ cart_id: 1, id: 123 }],
                }),
            })

            expect(event).toStrictEqual({
                objectLabel: '#123',
                objectLink:
                    'https://store-shop_hash.mybigcommerce.com/manage/orders/123',
            })
        },
    )
})
