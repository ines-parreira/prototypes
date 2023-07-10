import {fromJS, Map} from 'immutable'

import rechargeEvent from '../recharge'

describe('rechargeEvent', () => {
    const actionConfig = {
        name: 'name',
        label: 'label',
        objectType: 'objectType',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('Should return undefined if nothing match', () => {
        const event = rechargeEvent({
            integration: Map(),
            actionConfig,
            payload: Map(),
            data: Map(),
        })
        expect(event).toBeUndefined()
    })

    it('Should return a subscription a broken event if actionConfig is a subscription', () => {
        const event = rechargeEvent({
            integration: Map(),
            actionConfig: {...actionConfig, objectType: 'subscription'},
            payload: Map(),
            data: fromJS({
                subscriptions: [],
            }),
        })

        expect(event).toStrictEqual({
            objectLabel: undefined,
            objectLink:
                'https://undefined.myshopify.com/tools/recurring/customers/undefined/subscriptions/undefined',
        })
    })

    it('Should return a subscription a broken event if actionConfig is a subscription', () => {
        const event = rechargeEvent({
            integration: Map(),
            actionConfig: {...actionConfig, objectType: 'subscription'},
            payload: fromJS({subscription_id: 1}),
            data: fromJS({}),
        })

        expect(event).toStrictEqual({
            objectLabel: undefined,
            objectLink:
                'https://undefined.myshopify.com/tools/recurring/customers/undefined/subscriptions/undefined',
        })
    })

    it('Should return a subscription a broken event if actionConfig is a subscription', () => {
        const event = rechargeEvent({
            integration: Map(),
            actionConfig: {...actionConfig, objectType: 'subscription'},
            payload: fromJS({subscription_id: 1}),
            data: fromJS({
                subscriptions: [{id: 2}],
            }),
        })

        expect(event).toStrictEqual({
            objectLabel: undefined,
            objectLink:
                'https://undefined.myshopify.com/tools/recurring/customers/undefined/subscriptions/undefined',
        })
    })

    it('Should return a subscription an event if actionConfig is a subscription', () => {
        const event = rechargeEvent({
            integration: fromJS({
                meta: {
                    store_name: 'store_name',
                },
            }),
            actionConfig: {...actionConfig, objectType: 'subscription'},
            payload: fromJS({subscription_id: 1}),
            data: fromJS({
                subscriptions: [{id: 1}],
                customer: {
                    hash: 'hash',
                },
            }),
        })

        expect(event).toStrictEqual({
            objectLabel: 1,
            objectLink:
                'https://store_name.myshopify.com/tools/recurring/customers/hash/subscriptions/1',
        })
    })

    it('Should return a charge broken event if actionConfig is a charge', () => {
        const event = rechargeEvent({
            integration: Map(),
            actionConfig: {...actionConfig, objectType: 'charge'},
            payload: Map(),
            data: Map(),
        })

        expect(event).toStrictEqual({
            objectLabel: undefined,
            objectLink:
                'https://undefined.myshopify.com/tools/recurring/customers/undefined/orders',
        })
    })

    it('Should return a charge broken event if actionConfig is a charge', () => {
        const event = rechargeEvent({
            integration: Map(),
            actionConfig: {...actionConfig, objectType: 'charge'},
            payload: Map(),
            data: fromJS({
                charges: [],
            }),
        })

        expect(event).toStrictEqual({
            objectLabel: undefined,
            objectLink:
                'https://undefined.myshopify.com/tools/recurring/customers/undefined/orders',
        })
    })

    it('Should return a charge broken event if actionConfig is a charge', () => {
        const event = rechargeEvent({
            integration: Map(),
            actionConfig: {...actionConfig, objectType: 'charge'},
            payload: fromJS({charge_id: 1}),
            data: fromJS({
                charges: [{id: 2}],
            }),
        })

        expect(event).toStrictEqual({
            objectLabel: undefined,
            objectLink:
                'https://undefined.myshopify.com/tools/recurring/customers/undefined/orders',
        })
    })

    it('Should return a charge event if actionConfig is a charge', () => {
        const event = rechargeEvent({
            integration: fromJS({
                meta: {
                    store_name: 'store_name',
                },
            }),
            actionConfig: {...actionConfig, objectType: 'charge'},
            payload: fromJS({charge_id: 1}),
            data: fromJS({
                charges: [{id: 1}],
                customer: {
                    hash: 'hash',
                },
            }),
        })

        expect(event).toStrictEqual({
            objectLabel: 1,
            objectLink:
                'https://store_name.myshopify.com/tools/recurring/customers/hash/orders',
        })
    })
})
