import {AxiosResponse} from 'axios'
import thunk from 'redux-thunk'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {fromJS, Map} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {AnyAction} from 'redux'

import {
    shopifyCalculatedDraftOrderFixture,
    shopifyCustomerFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyInvoicePayloadFixture,
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from '../../../../../fixtures/shopify'
import {ShopifyAction} from '../../../../../pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/constants'
import {executeAction} from '../../../../infobar/actions'
import {initialState} from '../reducers'
import * as actions from '../actions'
import client from '../../../../../models/api/resources'
import {
    IntegrationDataItemType,
    IntegrationType,
} from '../../../../../models/integration/types'
import {RootState, StoreDispatch} from '../../../../types'

jest.mock('lodash/debounce', () => (fn: Record<string, unknown>) => {
    fn.cancel = jest.fn()
    return fn
})

jest.mock('../../../../infobar/actions')
jest.useFakeTimers()

describe('infobarActions.shopify.createOrder actions', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const integrationId = 1
    const draftOrderId = 1
    const integrationDataItemType =
        IntegrationDataItemType.IntegrationDataItemTypeProduct
    const currencyCode = 'USD'
    const order: Map<any, any> = fromJS(shopifyOrderFixture())
    const customer: Map<any, any> = fromJS(shopifyCustomerFixture())
    const mockServer = new MockAdapter(client)
    let store: MockStoreEnhanced<unknown, StoreDispatch>

    const getActions = () =>
        store
            .getActions()
            .map((action: AnyAction & {payload: Record<string, unknown>}) => {
                if (action.type === 'ADD_NOTIFICATION') {
                    action.payload.id = 1
                }

                return action
            })

    function mockCalculateSuccess() {
        mockServer
            .onPost(
                `/integrations/${IntegrationType.Shopify}/order/draft/calculate/`
            )
            .reply(200, {
                data: {
                    draftOrderCalculate: {
                        calculatedDraftOrder:
                            shopifyCalculatedDraftOrderFixture(),
                    },
                },
            })
    }

    function mockCreateSuccess() {
        mockServer
            .onPost(`/integrations/${IntegrationType.Shopify}/order/draft/`)
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
                [IntegrationType.Shopify]: {
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
        let onError: jest.Mock

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
                        `/integrations/${IntegrationType.Shopify}/order/draft/calculate`
                    )
                    .reply(500, {
                        error: {
                            msg: "Error while calculating draft order. Details: <ul><li>Field 'foo' doesn't exist on type 'CalculatedDraftOrder'</li></ul>",
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
        let payload: Map<any, any>

        beforeEach(() => {
            payload = fromJS(shopifyDraftOrderPayloadFixture())

            store = mockStore({
                infobarActions: {
                    [IntegrationType.Shopify]: {
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
                    [IntegrationType.Shopify]: {
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

    describe('onLineItemChange()', () => {
        let payload

        beforeEach(() => {
            payload = fromJS(shopifyDraftOrderPayloadFixture())

            store = mockStore({
                infobarActions: {
                    [IntegrationType.Shopify]: {
                        createOrder: initialState.set('payload', payload),
                    },
                },
            })
            mockCalculateSuccess()
        })

        it('edits the payload with the new product line', async () => {
            await store.dispatch(
                actions.onLineItemChange(integrationId, {
                    newLineItem: (
                        order.getIn(['line_items', 0]) as Map<any, any>
                    ).set('quantity', 6),
                    index: 0,
                })
            )
            expect(store.getActions()).toMatchSnapshot()
        })
        it('edits the payload with the removed product line', async () => {
            await store.dispatch(
                actions.onLineItemChange(integrationId, {
                    remove: true,
                    index: 0,
                })
            )
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('addCustomRow()', () => {
        it('should add custom row to the payload', async () => {
            const payload = fromJS(shopifyDraftOrderPayloadFixture())

            store = mockStore({
                infobarActions: {
                    [IntegrationType.Shopify]: {
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
            await (store.dispatch(actions.onReset()) as unknown as Promise<any>)
            expect(getActions()).toMatchSnapshot()
        })
    })

    describe('onEmailInvoice()', () => {
        const orderId = 123
        const ticketId = 456
        const customerId = 789

        let draftOrderPayload
        let invoicePayload: Map<any, any>
        let onSuccess: jest.Mock

        const initTest = (error: boolean) => {
            // Mock order creation
            draftOrderPayload = fromJS(shopifyDraftOrderPayloadFixture())
            invoicePayload = fromJS(shopifyInvoicePayloadFixture())
            onSuccess = jest.fn()

            store = mockStore({
                ticket: fromJS({
                    id: ticketId,
                }),
                infobarActions: {
                    [IntegrationType.Shopify]: {
                        createOrder: initialState.set(
                            'payload',
                            draftOrderPayload
                        ),
                    },
                },
            })

            mockCreateSuccess()

            // Mock action "send invoice"
            const response = {
                status: error ? 'error' : 'success',
            } as unknown as AxiosResponse

            ;(
                executeAction as jest.MockedFunction<typeof executeAction>
            ).mockImplementation(
                (...args: ArgumentsOf<typeof executeAction>) =>
                    (...reduxArgs: [StoreDispatch, () => RootState]) => {
                        const {executeAction: realImplementation} =
                            jest.requireActual('../../../../infobar/actions')
                        const result = (
                            realImplementation as typeof executeAction
                        )(...args)(...reduxArgs)
                        const callback = args[4]
                        callback!(response)
                        return result
                    }
            )

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
