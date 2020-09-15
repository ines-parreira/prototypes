import configureMockStore from 'redux-mock-store'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import axios from 'axios'

import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../constants/integration'
import {
    shopifyOrderFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../fixtures/shopify'
import {initialState} from '../reducers.ts'
import * as actions from '../../refundOrder/actions.ts'
import {initRefundOrderLineItems} from '../../../../../business/shopify/order.ts'

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
    const refundWithoutShipping = fromJS(shopifySuggestedRefundFixture()).setIn(
        ['shipping', 'maximum_refundable'],
        '10.00'
    )
    const refund = refundWithoutShipping
        .setIn(['shipping', 'amount'], '10.00')
        .setIn(['shipping', 'tax'], '00.90')

    let store

    const getActions = () =>
        store.getActions().map((action) => {
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
        describe('onInit()', () => {
            beforeEach(() => {
                mockServer
                    // First call that fetches maximum refundable value
                    .onPost(
                        `/integrations/shopify/order/${orderId}/refunds/calculate/`
                    )
                    .replyOnce(200, {
                        refund: refundWithoutShipping.toJS(),
                    })
                    // First call that fetches correct tax value for maximum refundable value
                    .onPost(
                        `/integrations/shopify/order/${orderId}/refunds/calculate/`
                    )
                    .replyOnce(200, {
                        refund: refund.toJS(),
                    })
            })

            it('should init the state', async () => {
                await store.dispatch(actions.onInit(integrationId, order))
                expect(getActions()).toMatchSnapshot()
            })
        })

        describe('on initialized', () => {
            beforeEach(() => {
                mockServer
                    .onPost(
                        `/integrations/shopify/order/${orderId}/refunds/calculate/`
                    )
                    .replyOnce(200, {
                        refund: refund.toJS(),
                    })
            })

            describe('onLineItemsChange()', () => {
                it('should set line items and calculate refund', async () => {
                    const lineItems = initRefundOrderLineItems(order)
                    await store.dispatch(
                        actions.onLineItemsChange(integrationId, lineItems)
                    )
                    expect(getActions()).toMatchSnapshot()
                })
            })

            describe('onPayloadChange()', () => {
                it('should set payload and calculate refund', async () => {
                    await store.dispatch(
                        actions.onPayloadChange(integrationId, payload)
                    )
                    expect(getActions()).toMatchSnapshot()
                })
            })
        })
    })

    describe('on restockable', () => {
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
                .onPost(
                    `/integrations/shopify/order/${orderId}/refunds/calculate/`
                )
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

    describe('on not restockable', () => {
        beforeEach(() => {
            mockServer
                .onPost(
                    `/integrations/shopify/order/${orderId}/refunds/calculate/`
                )
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
                // First call that fetches maximum refundable value
                .onPost(
                    `/integrations/shopify/order/${orderId}/refunds/calculate/`
                )
                .replyOnce(200, {
                    refund: refundWithoutShipping.toJS(),
                })
                // First call that should fetch correct tax value for maximum refundable value
                .onPost(
                    `/integrations/shopify/order/${orderId}/refunds/calculate/`
                )
                .replyOnce(500, {
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
