import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'

import {
    shopifyDraftOrderPayloadFixture,
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyProductFixture,
    shopifyShippingLineFixture
} from '../../../../../fixtures/shopify'
import {initialState} from '../../../../infobarActions/shopify/duplicateOrder/reducers'
import {INTEGRATION_DATA_ITEM_TYPE_PRODUCT, SHOPIFY_INTEGRATION_TYPE} from '../../../../../constants/integration'
import * as actions from '../actions'
import localStorageManager from '../../../../../services/localStorageManager'

jest.mock('lodash/debounce', () => (fn) => (...args) => {
    return new Promise((resolve) => {
        global.process.nextTick(() => {
            resolve(fn(...args))
        })
    })
})

jest.mock('lodash/debounce', () => (fn) => fn)
jest.useFakeTimers()

describe('infobarActions.shopify.duplicateOrder actions', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const integrationId = 1
    const draftOrderId = 1
    const integrationDataItemType = INTEGRATION_DATA_ITEM_TYPE_PRODUCT
    const order = fromJS(shopifyOrderFixture())
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
                    duplicateOrder: initialState,
                },
            },
        })

        mockServer.reset()
    })

    afterEach(() => {
        jest.clearAllTimers()
    })

    describe('onInit()', () => {
        let onError

        beforeEach(() => {
            onError = jest.fn()

            mockServer
                .onGet(`/api/integrations/${integrationId}/${integrationDataItemType}`)
                .reply(200, {
                    data: [
                        {data: {id: 1, foo: 'bar'}},
                        {data: {id: 2, foo: 'bar'}},
                        {data: {id: 3, foo: 'bar'}},
                    ],
                    meta: {
                        next_page: null,
                    },
                })
        })

        describe('on success', () => {
            beforeEach(() => {
                mockServer
                    .onPost('/integrations/shopify/order/draft/')
                    .reply(200, {
                        draft_order: {
                            id: draftOrderId,
                            foo: 'bar',
                        },
                    })
            })

            it('should init the state', async () => {
                await store.dispatch(actions.onInit(integrationId, order, onError))
                expect(getActions()).toMatchSnapshot()
                expect(onError).not.toHaveBeenCalled()
            })

            it('should init the state when there is a shipping line', async () => {
                const shippingLines = fromJS([shopifyShippingLineFixture()])
                const orderWithShippingLine = order.set('shipping_lines', shippingLines)
                await store.dispatch(actions.onInit(integrationId, orderWithShippingLine, onError))
                expect(getActions()).toMatchSnapshot()
                expect(onError).not.toHaveBeenCalled()
            })
        })

        describe('on polling', () => {
            it('should poll draft order values', (done) => {
                mockServer
                    .onPost('/integrations/shopify/order/draft/')
                    .reply(200, {
                        draft_order: {
                            id: draftOrderId,
                            foo: 'bar',
                        },
                        retry_after: 3,
                    })

                mockServer
                    .onGet(`/integrations/shopify/order/draft/${draftOrderId}/`)
                    .reply(200, {
                        draft_order: {
                            id: draftOrderId,
                            foo: 'updated',
                        },
                    })

                const promise = store.dispatch(actions.onInit(integrationId, order, onError))

                process.nextTick(async () => {
                    jest.runAllTimers()
                    await promise
                    expect(getActions()).toMatchSnapshot()
                    expect(onError).not.toHaveBeenCalled()
                    done()
                })
            })
        })

        describe('on error', () => {
            it('should call onError', async () => {
                mockServer
                    .onPost(`/integrations/${SHOPIFY_INTEGRATION_TYPE}/order/draft/`)
                    .reply(500, {
                        error: {
                            msg: 'foo',
                        },
                    })

                await store.dispatch(actions.onInit(integrationId, order, onError))
                expect(getActions()).toMatchSnapshot()
                expect(onError).toHaveBeenCalled()
            })
        })
    })

    describe('onCleanUp()', () => {
        it('should delete temporary draft orders', async () => {
            const shopifyLocalStorage = localStorageManager.integrations[SHOPIFY_INTEGRATION_TYPE]
            const ids = [1, 2, 3]
            shopifyLocalStorage.draftOrders.setList(ids)

            ids.forEach((id) => {
                mockServer
                    .onDelete(`/integrations/${SHOPIFY_INTEGRATION_TYPE}/order/draft/${id}/`)
                    .reply(204)
            })

            await store.dispatch(actions.onCleanUp())
            expect(mockServer.history).toMatchSnapshot()
        })
    })

    describe('onPayloadChange()', () => {
        let payload

        beforeEach(() => {
            payload = fromJS(shopifyDraftOrderPayloadFixture())

            store = mockStore({
                infobarActions: {
                    [SHOPIFY_INTEGRATION_TYPE]: {
                        duplicateOrder: initialState
                            .set('draftOrder', fromJS({
                                id: draftOrderId,
                            }))
                            .set('payload', payload),
                    },
                },
            })
        })

        describe('on success', () => {
            it('should update draft order', async () => {
                mockServer
                    .onPut(`/integrations/${SHOPIFY_INTEGRATION_TYPE}/order/draft/${draftOrderId}/`)
                    .reply(200, {
                        draft_order: {
                            id: draftOrderId,
                            foo: 'bar',
                        },
                    })

                await store.dispatch(actions.onPayloadChange(integrationId, payload))
                expect(getActions()).toMatchSnapshot()
            })
        })

        describe('on polling', () => {
            it('should update draft order and poll its values', (done) => {
                mockServer
                    .onPut(`/integrations/${SHOPIFY_INTEGRATION_TYPE}/order/draft/${draftOrderId}/`)
                    .reply(200, {
                        draft_order: {
                            id: draftOrderId,
                            foo: 'bar',
                        },
                        retry_after: 3,
                    })

                mockServer
                    .onGet(`/integrations/shopify/order/draft/${draftOrderId}/`)
                    .reply(200, {
                        draft_order: {
                            id: draftOrderId,
                            foo: 'updated',
                        },
                    })

                const promise = store.dispatch(actions.onPayloadChange(integrationId, payload))

                process.nextTick(async () => {
                    jest.runAllTimers()
                    await promise
                    expect(getActions()).toMatchSnapshot()
                    done()
                })
            })
        })
    })

    describe('addRow()', () => {
        it('should add row to the payload', async () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())

            store = mockStore({
                infobarActions: {
                    [SHOPIFY_INTEGRATION_TYPE]: {
                        duplicateOrder: initialState
                            .set('draftOrder', fromJS({
                                id: draftOrderId,
                            }))
                            .set('payload', payload),
                    },
                },
            })

            mockServer
                .onPut(`/integrations/${SHOPIFY_INTEGRATION_TYPE}/order/draft/${draftOrderId}/`)
                .reply(200, {
                    draft_order: {
                        id: draftOrderId,
                        foo: 'bar',
                    },
                })

            const product = shopifyProductFixture()
            const variant = product.variants[0]
            await store.dispatch(actions.addRow(integrationId, product, variant))
            expect(getActions()).toMatchSnapshot()
        })
    })

    describe('addCustomRow()', () => {
        it('should add custom row to the payload', async () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())

            store = mockStore({
                infobarActions: {
                    [SHOPIFY_INTEGRATION_TYPE]: {
                        duplicateOrder: initialState
                            .set('draftOrder', fromJS({
                                id: draftOrderId,
                            }))
                            .set('payload', payload),
                    },
                },
            })

            mockServer
                .onPut(`/integrations/${SHOPIFY_INTEGRATION_TYPE}/order/draft/${draftOrderId}/`)
                .reply(200, {
                    draft_order: {
                        id: draftOrderId,
                        foo: 'bar',
                    },
                })

            const lineItem = fromJS(shopifyLineItemFixture())
            await store.dispatch(actions.addCustomRow(integrationId, lineItem))
            expect(getActions()).toMatchSnapshot()
        })
    })

    describe('onCancel()', () => {
        it('should delete temporary draft order', async () => {
            const shopifyLocalStorage = localStorageManager.integrations[SHOPIFY_INTEGRATION_TYPE]
            shopifyLocalStorage.draftOrders.setList([draftOrderId])

            mockServer
                .onDelete(`/integrations/${SHOPIFY_INTEGRATION_TYPE}/order/draft/${draftOrderId}/`)
                .reply(204)

            await store.dispatch(actions.onCancel())
            expect(mockServer.history).toMatchSnapshot()
        })
    })

    describe('onSubmit()', () => {
        it('should remove ID of the draft order from temporary list', async () => {
            const shopifyLocalStorage = localStorageManager.integrations[SHOPIFY_INTEGRATION_TYPE]
            shopifyLocalStorage.draftOrders.setList([draftOrderId])

            store = mockStore({
                infobarActions: {
                    [SHOPIFY_INTEGRATION_TYPE]: {
                        duplicateOrder: initialState.set('draftOrder', fromJS({
                            id: draftOrderId,
                        })),
                    },
                },
            })

            await store.dispatch(actions.onSubmit())
            const ids = shopifyLocalStorage.draftOrders.getList()
            expect(ids).toEqual(new Set())
        })
    })
})
