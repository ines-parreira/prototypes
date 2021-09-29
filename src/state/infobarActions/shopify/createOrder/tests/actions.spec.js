import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'

import {
    shopifyCalculatedDraftOrderFixture,
    shopifyCustomerFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyInvoicePayloadFixture,
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from '../../../../../fixtures/shopify.ts'
import {ShopifyAction} from '../../../../../pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/constants.ts'
import {
    INTEGRATION_DATA_ITEM_TYPE_PRODUCT,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../../../constants/integration.ts'
import {executeAction} from '../../../../infobar/actions.ts'
import {initialState} from '../reducers.ts'
import * as actions from '../actions.ts'

jest.mock('lodash/debounce', () => (fn) => {
    fn.cancel = jest.fn()
    return fn
})

jest.mock('../../../../infobar/actions.ts')
jest.useFakeTimers()

describe('infobarActions.shopify.createOrder actions', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const integrationId = 1
    const draftOrderId = 1
    const integrationDataItemType = INTEGRATION_DATA_ITEM_TYPE_PRODUCT
    const currencyCode = 'USD'
    const order = fromJS(shopifyOrderFixture())
    const customer = fromJS(shopifyCustomerFixture())
    const mockServer = new MockAdapter(axios)
    let store

    const getActions = () =>
        store.getActions().map((action) => {
            if (action.type === 'ADD_NOTIFICATION') {
                action.payload.id = 1
            }

            return action
        })

    function mockCalculateSuccess() {
        mockServer
            .onPost(
                `/integrations/${SHOPIFY_INTEGRATION_TYPE}/order/draft/calculate/`
            )
            .reply(200, {
                data: {
                    draftOrderCalculate: {
                        calculatedDraftOrder: shopifyCalculatedDraftOrderFixture(),
                    },
                },
            })
    }

    function mockCreateSuccess() {
        mockServer
            .onPost(`/integrations/${SHOPIFY_INTEGRATION_TYPE}/order/draft/`)
            .reply(200, {
                draft_order: {
                    id: draftOrderId,
                    name: '#D123',
                },
            })
    }

    beforeEach(() => {
        store = mockStore({
            infobarActions: {
                [SHOPIFY_INTEGRATION_TYPE]: {
                    createOrder: initialState,
                },
            },
        })

        mockServer.reset()
        window.localStorage.clear()
    })

    afterEach(() => {
        jest.clearAllTimers()
        window.localStorage.clear()
    })

    describe('onInit()', () => {
        let onError

        beforeEach(() => {
            onError = jest.fn()

            const product = shopifyProductFixture({
                id: 8345093387,
                title: 'Acidulous candy',
                variants: [
                    shopifyVariantFixture({
                        id: 31128766316567,
                        sku: '0987654321-1',
                        title: 'Red / A',
                        price: '1.00',
                    }),
                    shopifyVariantFixture({
                        id: 31128766349335,
                        sku: '0987654321-2',
                        title: 'Red / B',
                        price: '1.00',
                    }),
                ],
            })

            mockServer
                .onGet(
                    `/api/integrations/${integrationId}/${integrationDataItemType}`
                )
                .reply(200, {
                    data: [{data: product}],
                    meta: {
                        next_page: null,
                    },
                })
        })

        describe('on success', () => {
            beforeEach(mockCalculateSuccess)

            it('should init the state', async () => {
                await store.dispatch(
                    actions.onInit(
                        integrationId,
                        order,
                        customer,
                        currencyCode,
                        onError
                    )
                )
                expect(getActions()).toMatchSnapshot()
                expect(onError).not.toHaveBeenCalled()
            })

            it('should init the state when the customer has no currency', async () => {
                await store.dispatch(
                    actions.onInit(
                        integrationId,
                        null,
                        customer.delete('currency'),
                        'AUD',
                        onError
                    )
                )
                expect(getActions()).toMatchSnapshot()
                expect(onError).not.toHaveBeenCalled()
            })
        })

        describe('on error', () => {
            it('should call onError', async () => {
                mockServer
                    .onPost(
                        `/integrations/${SHOPIFY_INTEGRATION_TYPE}/order/draft/calculate`
                    )
                    .reply(500, {
                        error: {
                            msg:
                                "Error while calculating draft order. Details: <ul><li>Field 'foo' doesn't exist on type 'CalculatedDraftOrder'</li></ul>",
                        },
                    })

                await store.dispatch(
                    actions.onInit(
                        integrationId,
                        order,
                        customer,
                        currencyCode,
                        onError
                    )
                )
                expect(getActions()).toMatchSnapshot()
                expect(onError).toHaveBeenCalled()
            })
        })
    })

    describe('onPayloadChange()', () => {
        let payload

        beforeEach(() => {
            payload = fromJS(shopifyDraftOrderPayloadFixture())

            store = mockStore({
                infobarActions: {
                    [SHOPIFY_INTEGRATION_TYPE]: {
                        createOrder: initialState.set('payload', payload),
                    },
                },
            })
        })

        describe('on success', () => {
            it('should calculate draft order', async () => {
                mockCalculateSuccess()
                await store.dispatch(
                    actions.onPayloadChange(integrationId, payload)
                )
                expect(getActions()).toMatchSnapshot()
            })
        })
    })

    describe('addRow()', () => {
        it('should add row to the payload', async () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())

            store = mockStore({
                infobarActions: {
                    [SHOPIFY_INTEGRATION_TYPE]: {
                        createOrder: initialState.set('payload', payload),
                    },
                },
            })

            mockCalculateSuccess()

            const actionName = ShopifyAction.DUPLICATE_ORDER
            const product = shopifyProductFixture()
            const variant = product.variants[0]
            await store.dispatch(
                actions.addRow(actionName, integrationId, product, variant)
            )
            expect(getActions()).toMatchSnapshot()
        })
    })

    describe('addCustomRow()', () => {
        it('should add custom row to the payload', async () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())

            store = mockStore({
                infobarActions: {
                    [SHOPIFY_INTEGRATION_TYPE]: {
                        createOrder: initialState.set('payload', payload),
                    },
                },
            })

            mockCalculateSuccess()

            const lineItem = fromJS(shopifyLineItemFixture())
            await store.dispatch(actions.addCustomRow(integrationId, lineItem))
            expect(getActions()).toMatchSnapshot()
        })
    })

    describe('onReset()', () => {
        it('should reset state', async () => {
            await store.dispatch(actions.onReset())
            expect(getActions()).toMatchSnapshot()
        })
    })

    describe('onEmailInvoice()', () => {
        const orderId = 123
        const ticketId = 456
        const customerId = 789

        let draftOrderPayload
        let invoicePayload
        let onSuccess

        const initTest = (error) => {
            // Mock order creation
            draftOrderPayload = fromJS(shopifyDraftOrderPayloadFixture())
            invoicePayload = fromJS(shopifyInvoicePayloadFixture())
            onSuccess = jest.fn()

            store = mockStore({
                ticket: fromJS({
                    id: ticketId,
                }),
                infobarActions: {
                    [SHOPIFY_INTEGRATION_TYPE]: {
                        createOrder: initialState.set(
                            'payload',
                            draftOrderPayload
                        ),
                    },
                },
            })

            mockCreateSuccess()

            // Mock action "send invoice"
            const response = {status: error ? 'error' : 'success'}

            executeAction.mockImplementation((...args) => (...reduxArgs) => {
                const {executeAction: realImplementation} = jest.requireActual(
                    '../../../../infobar/actions.ts'
                )
                const result = realImplementation(...args)(...reduxArgs)
                const callback = args[4]
                callback(response)
                return result
            })

            mockServer
                .onPost('/api/actions/execute/')
                .reply(error ? 500 : 200, response)
        }

        it('should email invoice', (done) => {
            initTest(false)

            const promise = store.dispatch(
                actions.onEmailInvoice(
                    integrationId,
                    customerId,
                    orderId,
                    invoicePayload,
                    onSuccess
                )
            )

            process.nextTick(async () => {
                jest.runAllTimers()
                await promise
                expect(getActions()).toMatchSnapshot()
                done()
            })
        })

        it('should display an error', (done) => {
            initTest(true)

            const promise = store.dispatch(
                actions.onEmailInvoice(
                    integrationId,
                    customerId,
                    orderId,
                    invoicePayload,
                    onSuccess
                )
            )

            process.nextTick(async () => {
                jest.runAllTimers()
                await promise
                expect(getActions()).toMatchSnapshot()
                done()
            })
        })
    })
})
