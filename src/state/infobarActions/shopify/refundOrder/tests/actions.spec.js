import configureMockStore from 'redux-mock-store'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import axios from 'axios'

import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../constants/integration'
import {
    shopifyOrderFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture
} from '../../../../../fixtures/shopify'
import {initialState} from '../../refundOrder/reducers'
import * as actions from '../../refundOrder/actions'
import {initRefundOrderLineItems} from '../../../../../business/shopify/order'

jest.mock('lodash/debounce', () => (fn) => {
    fn.cancel = jest.fn()
    return fn
})

jest.useFakeTimers()

describe('infobarActions.shopify.refundOrder actions', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const integrationId = 1
    const order = fromJS(shopifyOrderFixture())
    const payload = fromJS(shopifyRefundOrderPayloadFixture())
    const orderId = order.get('id')
    const mockServer = new MockAdapter(axios)
    let store

    const getActions = () => store.getActions().map((action) => {
        if (action.type === 'ADD_NOTIFICATION') {
            action.payload.id = 1
        }

        return action
    })

    beforeEach(() => {
        store = mockStore({
            infobarActions: {
                [SHOPIFY_INTEGRATION_TYPE]: {
                    refundOrder: initialState
                        .set('orderId', orderId)
                        .set('payload', payload),
                },
            },
        })

        mockServer.reset()
    })

    afterEach(() => {
        jest.clearAllTimers()
    })

    describe('on success', () => {
        beforeEach(() => {
            mockServer
                .onPost(`/integrations/shopify/order/${orderId}/refunds/calculate/`)
                .reply(200, {
                    refund: shopifySuggestedRefundFixture(),
                })
        })

        describe('onInit()', () => {
            it('should init the state', async () => {
                await store.dispatch(actions.onInit(integrationId, order))
                expect(getActions()).toMatchSnapshot()
            })
        })

        describe('onLineItemsChange()', () => {
            it('should set line items and calculate refund', async () => {
                const lineItems = initRefundOrderLineItems(order)
                await store.dispatch(actions.onLineItemsChange(integrationId, lineItems))
                expect(getActions()).toMatchSnapshot()
            })
        })

        describe('onPayloadChange()', () => {
            it('should set payload and calculate refund', async () => {
                await store.dispatch(actions.onPayloadChange(integrationId, payload))
                expect(getActions()).toMatchSnapshot()
            })
        })
    })

    describe('on refundable', () => {
        beforeEach(() => {
            store = mockStore({
                infobarActions: {
                    [SHOPIFY_INTEGRATION_TYPE]: {
                        refundOrder: initialState
                            .set('orderId', orderId)
                            .set('payload', payload.set('restock', false)),
                    },
                },
            })

            mockServer
                .onPost(`/integrations/shopify/order/${orderId}/refunds/calculate/`)
                .reply(200, {
                    refund: shopifySuggestedRefundFixture(),
                })
        })

        describe('onInit()', () => {
            it('should set `restock` to `true` because the line item is restockable', async () => {
                await store.dispatch(actions.onInit(integrationId, order))
                expect(getActions()).toMatchSnapshot()
            })
        })
    })

    describe('on not refundable', () => {
        beforeEach(() => {
            mockServer
                .onPost(`/integrations/shopify/order/${orderId}/refunds/calculate/`)
                .reply(200, {
                    refund: shopifySuggestedRefundFixture({locationId: null}),
                })
        })

        describe('onInit()', () => {
            it('should set `restock` to `false` because the line item is not restockable', async () => {
                await store.dispatch(actions.onInit(integrationId, order))
                expect(getActions()).toMatchSnapshot()
            })
        })
    })

    describe('on error', () => {
        beforeEach(() => {
            mockServer
                .onPost(`/integrations/shopify/order/${orderId}/refunds/calculate/`)
                .reply(500, {
                    error: {
                        msg: 'foo',
                    },
                })
        })

        describe('onInit()', () => {
            it('should notify that an error occurred', async () => {
                await store.dispatch(actions.onInit(integrationId, order))
                expect(getActions()).toMatchSnapshot()
            })
        })
    })

    describe('onCancel()', () => {
        it('should cancel debounced call to calculateRefund()', async () => {
            await store.dispatch(actions.onCancel())
            expect(actions.calculateRefund.cancel).toHaveBeenCalled()
        })
    })

    describe('onReset()', () => {
        it('should reset state', async () => {
            await store.dispatch(actions.onReset())
            expect(getActions()).toMatchSnapshot()
        })
    })
})
