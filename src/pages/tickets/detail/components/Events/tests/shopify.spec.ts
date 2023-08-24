import {fromJS, Map} from 'immutable'

import shopifyEvent from '../shopify'

describe('shopifyEvent', () => {
    const actionConfig = {
        name: 'name',
        label: 'label',
        objectType: 'objectType',
    }

    it('Should return undefined if nothing match', () => {
        const event = shopifyEvent({
            integration: Map(),
            actionConfig,
            payload: Map(),
            data: Map(),
        })
        expect(event).toBeUndefined()
    })

    it('Should return a draftOrder broken event if actionConfig is a draftOrder', () => {
        const event = shopifyEvent({
            integration: Map(),
            actionConfig: {...actionConfig, objectType: 'draftOrder'},
            payload: Map(),
            data: Map(),
        })

        expect(event).toStrictEqual({
            objectLabel: undefined,
            objectLink:
                'https://undefined.myshopify.com/admin/draft_orders/undefined',
        })
    })

    it('Should return a draftOrder event if actionConfig is a draftOrder', () => {
        const event = shopifyEvent({
            integration: fromJS({
                meta: {
                    shop_name: 'shop_name',
                },
            }),
            actionConfig: {...actionConfig, objectType: 'draftOrder'},
            payload: fromJS({
                draft_order_id: 1,
                draft_order_name: 'draft_order_name',
            }),
            data: Map(),
        })

        expect(event).toStrictEqual({
            objectLabel: 'draft_order_name',
            objectLink: 'https://shop_name.myshopify.com/admin/draft_orders/1',
        })
    })

    it('Should an empty event if not order id', () => {
        const event = shopifyEvent({
            integration: Map(),
            actionConfig,
            payload: fromJS({
                order_id: 1,
            }),
            data: Map(),
        })

        expect(event).toBeUndefined()
    })

    it('Should return a broke order event if actionConfig is a order', () => {
        const event = shopifyEvent({
            integration: Map(),
            actionConfig: {...actionConfig, objectType: 'order'},
            payload: fromJS({
                order_id: 1,
            }),
            data: Map(),
        })

        expect(event).toStrictEqual({
            objectLabel: undefined,
            objectLink:
                'https://undefined.myshopify.com/admin/orders/undefined',
        })
    })

    it('Should return an order event if actionConfig is a order', () => {
        const event = shopifyEvent({
            integration: fromJS({
                meta: {
                    shop_name: 'shop_name',
                },
            }),
            actionConfig: {...actionConfig, objectType: 'order'},
            payload: fromJS({
                order_id: 1,
            }),
            data: fromJS({
                orders: [
                    {
                        name: 'order_name',
                        id: 1,
                    },
                ],
            }),
        })

        expect(event).toStrictEqual({
            objectLabel: 'order_name',
            objectLink: 'https://shop_name.myshopify.com/admin/orders/1',
        })
    })

    it('Should return a broke item event if actionConfig is a item', () => {
        const event = shopifyEvent({
            integration: Map(),
            actionConfig: {...actionConfig, objectType: 'item'},
            payload: fromJS({
                order_id: 1,
            }),
            data: Map(),
        })

        expect(event).toStrictEqual({
            objectLabel: 'undefined × undefined',
            objectLink:
                'https://undefined.myshopify.com/admin/orders/undefined',
        })
    })

    it('Should return an item event if actionConfig is a item', () => {
        const event = shopifyEvent({
            integration: fromJS({
                meta: {
                    shop_name: 'shop_name',
                },
            }),
            actionConfig: {...actionConfig, objectType: 'item'},
            payload: fromJS({
                order_id: 1,
                item_id: 1,
                quantity: 1,
            }),
            data: fromJS({
                orders: [
                    {
                        name: 'order_name',
                        id: 1,
                        line_items: [
                            {
                                id: 1,
                                name: 'item_name',
                            },
                        ],
                    },
                ],
            }),
        })

        expect(event).toStrictEqual({
            objectLabel: '1 × item_name',
            objectLink: 'https://shop_name.myshopify.com/admin/orders/1',
        })
    })
})
