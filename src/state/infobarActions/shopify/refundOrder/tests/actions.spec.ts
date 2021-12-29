import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import MockAdapter from 'axios-mock-adapter'
import {fromJS, Map} from 'immutable'
import thunk from 'redux-thunk'
import {AnyAction} from '@reduxjs/toolkit'

import {
    shopifyOrderFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../fixtures/shopify'
import {initialState} from '../reducers'
import * as actions from '../../refundOrder/actions'
import {initRefundOrderLineItems} from '../../../../../business/shopify/order'
import client from '../../../../../models/api/resources'
import {StoreDispatch} from '../../../../types'
import {IntegrationType} from '../../../../../models/integration/types'

jest.mock('lodash/debounce', () => (fn: Record<string, unknown>) => {
    fn.cancel = jest.fn()
    return fn
})

jest.useFakeTimers()

describe('infobarActions.shopify.refundOrder actions', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const integrationId = 1
    const order: Map<any, any> = fromJS(shopifyOrderFixture())
    const payload: Map<any, any> = fromJS(shopifyRefundOrderPayloadFixture())
    const orderId: number = order.get('id')
    const mockServer = new MockAdapter(client)
    const refundWithoutShipping = (
        fromJS(shopifySuggestedRefundFixture()) as Map<any, any>
    ).setIn(['shipping', 'maximum_refundable'], '10.00')
    const refund = refundWithoutShipping
        .setIn(['shipping', 'amount'], '10.00')
        .setIn(['shipping', 'tax'], '00.90')

    let store: MockStoreEnhanced<unknown, StoreDispatch>

    const getActions = () =>
        store
            .getActions()
            .map((action: AnyAction & {payload: {id: number}}) => {
                if (action.type === 'reapop/upsertNotification') {
                    action.payload.id = 1
                }

                return action
            })

    beforeEach(() => {
        store = mockStore({
            infobarActions: {
                [IntegrationType.Shopify]: {
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

            describe('onLineItemChange()', () => {
                it('should set line item and calculate refund', async () => {
                    const lineItems = initRefundOrderLineItems(order)
                    await store.dispatch(
                        actions.onLineItemChange(
                            integrationId,
                            lineItems.get(0),
                            0
                        )
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
                    [IntegrationType.Shopify]: {
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
            await (store.dispatch(
                actions.onCancel('')
            ) as unknown as Promise<any>)
            expect(actions.calculateRefund.cancel).toHaveBeenCalled()
        })
    })

    describe('onReset()', () => {
        it('should reset state', async () => {
            await (store.dispatch(actions.onReset()) as unknown as Promise<any>)
            expect(getActions()).toMatchSnapshot()
        })
    })
})
