import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Event from '../Event'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('Event component', () => {
    const rechargeIntegrationId = 2
    const rechargeCustomerHash = 'sd478fs57dfds4f1'
    const subscriptionId = 6
    const chargeId = 8

    const shopifyIntegrationId = 1
    const orderId = 3
    const itemId = 5

    let store

    const baseEventFixture = {
        created_datetime: '2017-12-07T01:01:34.502206+00:00',
        isEvent: true,
        type: 'action-executed',
        user: {
            id: 1,
            firstname: 'Acme',
            lastname: 'Support',
            name: 'Acme Support',
            email: 'support@acme.gorgias.io'
        },
    }

    beforeEach(() => {
        const integrationsData = {}

        integrationsData[shopifyIntegrationId.toString()] = {
            orders: [{
                id: orderId,
                name: '#1234',
                line_items: [{
                    id: itemId,
                    name: 'Beautiful butterfly'
                }]
            }]
        }

        integrationsData[rechargeIntegrationId.toString()] = {
            customer: {
                hash: rechargeCustomerHash
            },
            subscriptions: [{
                id: subscriptionId
            }],
            charges: [{
                id: chargeId
            }]
        }

        store = mockStore({
            ticket: fromJS({
                requester: {
                    integrations: integrationsData
                }
            }),
            integrations: fromJS({
                integrations: [{
                    id: rechargeIntegrationId,
                    type: 'recharge',
                    name: 'my-store',
                    meta: {
                        store_name: 'my-store'
                    }
                }, {
                    id: shopifyIntegrationId,
                    type: 'shopify',
                    name: 'my-store',
                    meta: {
                        shop_name: 'my-store'
                    }
                }]
            })
        })
    })

    it('should display correctly a successful event for a Recharge Subscription action', () => {
        const event = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'rechargeCancelSubscription',
                integration_id: rechargeIntegrationId,
                payload: {
                    subscription_id: subscriptionId
                },
                status: 'success'
            }
        })

        const component = shallow(
            <Event
                store={store}
                event={event}
                isLast={false}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a failed event for a Recharge Subscription action', () => {
        const event = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'rechargeCancelSubscription',
                integration_id: rechargeIntegrationId,
                payload: {
                    subscription_id: subscriptionId
                },
                status: 'error',
                msg: 'the error is real'
            }
        })

        const component = shallow(
            <Event
                store={store}
                event={event}
                isLast={false}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a successful event for a Recharge Charge action', () => {
        const event = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'rechargeSkipCharge',
                integration_id: rechargeIntegrationId,
                payload: {
                    subscription_id: subscriptionId,
                    charge_id: chargeId
                },
                status: 'success'
            }
        })

        const component = shallow(
            <Event
                store={store}
                event={event}
                isLast={false}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a failed event for a Recharge Charge action', () => {
        const event = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'rechargeSkipCharge',
                integration_id: rechargeIntegrationId,
                payload: {
                    subscription_id: subscriptionId,
                    charge_id: chargeId
                },
                status: 'error',
                msg: 'the error is real'
            }
        })

        const component = shallow(
            <Event
                store={store}
                event={event}
                isLast={false}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a successful event for a Shopify Order action', () => {
        const event = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'shopifyFullRefundOrder',
                integration_id: shopifyIntegrationId,
                payload: {
                    order_id: orderId
                },
                status: 'success'
            }
        })

        const component = shallow(
            <Event
                store={store}
                event={event}
                isLast={false}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a failed event for a Shopify Order action', () => {
        const event = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'shopifyFullRefundOrder',
                integration_id: shopifyIntegrationId,
                payload: {
                    order_id: orderId
                },
                status: 'error',
                msg: 'the error is real'
            }
        })

        const component = shallow(
            <Event
                store={store}
                event={event}
                isLast={false}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a successful event for a Shopify Item action', () => {
        const event = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'shopifyRefundOrderItem',
                integration_id: shopifyIntegrationId,
                payload: {
                    order_id: orderId,
                    item_id: itemId,
                    quantity: 2,
                },
                status: 'success'
            }
        })

        const component = shallow(
            <Event
                store={store}
                event={event}
                isLast={false}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should display correctly a failed event for a Shopify Item action', () => {
        const event = fromJS({
            ...baseEventFixture,
            data: {
                action_name: 'shopifyRefundOrderItem',
                integration_id: shopifyIntegrationId,
                payload: {
                    order_id: orderId,
                    item_id: itemId,
                    quantity: 2,
                },
                status: 'error',
                msg: 'the error is real'
            }
        })

        const component = shallow(
            <Event
                store={store}
                event={event}
                isLast={false}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
