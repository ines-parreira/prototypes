// @flow

import React from 'react'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS, type Record} from 'immutable'

import {
    integrationDataItemProductFixture,
    shopifyCustomerFixture,
    shopifyCustomLineItemFixture,
    shopifyInvoicePayloadFixture,
    shopifyOrderFixture,
    shopifyProductFixture,
} from '../../../../../../../../../../../../fixtures/shopify'
import {
    createOrderStateFixture,
    infobarActionsStateFixture,
} from '../../../../../../../../../../../../fixtures/infobarActions'
import {getDuplicateOrderPayload} from '../../../../../../../../../../../../state/infobarActions/shopify/createOrder/actions'
import {getCreateOrderState} from '../../../../../../../../../../../../state/infobarActions/shopify/createOrder/selectors'
import {getIntegrationsByTypes} from '../../../../../../../../../../../../state/integrations/selectors'
import {integrationsStateWithShopify} from '../../../../../../../../../../../../fixtures/integrations'
import {initDraftOrderPayload} from '../../../../../../../../../../../../business/shopify/draftOrder'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../../../../../../../constants/integration'
import * as Shopify from '../../../../../../../../../../../../constants/integrations/shopify'
import DraftOrderModal, {DraftOrderModalComponent} from '../DraftOrderModal'
import {ShopifyAction} from '../../../constants'

function initActions() {
    return {
        addCustomRow: jest.fn(),
        addRow: jest.fn(),
        onBulkChange: jest.fn(),
        onCancel: jest.fn(),
        onChange: jest
            .fn()
            .mockImplementation(
                (
                    name: string,
                    value: string | number | boolean | Object,
                    callback?: () => void
                ) => {
                    if (callback) {
                        callback()
                    }
                }
            ),
        onClose: jest.fn(),
        onEmailInvoice: jest
            .fn()
            .mockImplementation(
                (
                    integrationId: number,
                    customerId: number,
                    orderId: number | null,
                    invoicePayload: Record<Shopify.DraftOrderInvoice>,
                    onSuccess: () => void
                ) => {
                    onSuccess()
                }
            ),
        onInit: jest.fn(),
        onInitCleanUp: jest.fn(),
        onOpen: jest.fn(),
        onPayloadChange: jest.fn(),
        onReset: jest.fn(),
        onSubmit: jest.fn(),
        onSubmitCleanUp: jest.fn(),
    }
}

describe('<DraftOrderModal/>', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    let actions

    beforeEach(() => {
        actions = initActions()
    })

    describe('render()', () => {
        it('should render as closed', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const component = shallow(
                <DraftOrderModal
                    store={store}
                    header="Duplicate order"
                    isOpen={false}
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
                        order: fromJS(shopifyOrderFixture()),
                        customer: fromJS(shopifyCustomerFixture()),
                    }}
                    {...actions}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as open', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const component = shallow(
                <DraftOrderModal
                    store={store}
                    header="Duplicate order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
                        order: fromJS(shopifyOrderFixture()),
                        customer: fromJS(shopifyCustomerFixture()),
                    }}
                    {...actions}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})

describe('<DraftOrderModalComponent/>', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const context = {integrationId: 1, customerId: 2}
    let actions

    beforeEach(() => {
        actions = initActions()
    })

    describe('render()', () => {
        it('should render as closed', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const state = store.getState()

            const component = shallow(
                <DraftOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getCreateOrderState(state).get('loading')}
                    loadingMessage={getCreateOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getCreateOrderState(state).get('payload')}
                    draftOrder={getCreateOrderState(state).get('draftOrder')}
                    products={getCreateOrderState(state).get('products')}
                    header="Duplicate order"
                    isOpen={false}
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
                        order: fromJS(shopifyOrderFixture()),
                        customer: fromJS(shopifyCustomerFixture()),
                    }}
                    {...actions}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as open, without order table', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const state = store.getState()

            const component = shallow(
                <DraftOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getCreateOrderState(state).get('loading')}
                    loadingMessage={getCreateOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getCreateOrderState(state).get('payload')}
                    draftOrder={getCreateOrderState(state).get('draftOrder')}
                    products={getCreateOrderState(state).get('products')}
                    header="Duplicate order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
                        order: fromJS(shopifyOrderFixture()),
                        customer: fromJS(shopifyCustomerFixture()),
                    }}
                    {...actions}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as open, with order table', () => {
            const order = fromJS(shopifyOrderFixture())
            const customer = fromJS(shopifyCustomerFixture())
            const product = fromJS(shopifyProductFixture())
            const products = new Map([[product.get('id'), product]])
            const draftOrder = initDraftOrderPayload(customer, order, products)
            const payload = getDuplicateOrderPayload(draftOrder)
            const createOrderState = createOrderStateFixture({
                payload,
                draftOrder,
            })

            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture({createOrderState}),
            })

            const state = store.getState()

            const component = shallow(
                <DraftOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getCreateOrderState(state).get('loading')}
                    loadingMessage={getCreateOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getCreateOrderState(state).get('payload')}
                    draftOrder={getCreateOrderState(state).get('draftOrder')}
                    products={getCreateOrderState(state).get('products')}
                    header="Duplicate order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
                        order,
                        customer,
                    }}
                    {...actions}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as open, with empty order table', () => {
            const order = fromJS(shopifyOrderFixture()).set('line_items', [])
            const customer = fromJS(shopifyCustomerFixture())
            const products = new Map()
            const draftOrder = initDraftOrderPayload(customer, order, products)
            const payload = getDuplicateOrderPayload(draftOrder)
            const createOrderState = createOrderStateFixture({
                payload,
                draftOrder,
            })

            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture({createOrderState}),
            })

            const state = store.getState()

            const component = shallow(
                <DraftOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getCreateOrderState(state).get('loading')}
                    loadingMessage={getCreateOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getCreateOrderState(state).get('payload')}
                    draftOrder={getCreateOrderState(state).get('draftOrder')}
                    products={getCreateOrderState(state).get('products')}
                    header="Duplicate order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
                        order,
                        customer,
                    }}
                    {...actions}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as open, with order table and default currency, when its missing', () => {
            const order = fromJS(shopifyOrderFixture())
            const customer = fromJS(shopifyCustomerFixture())
            const product = fromJS(shopifyProductFixture())
            const products = new Map([[product.get('id'), product]])
            const draftOrder = initDraftOrderPayload(customer, order, products)
            const payload = getDuplicateOrderPayload(draftOrder)
            const createOrderState = createOrderStateFixture({
                payload,
                draftOrder,
            })

            const store = mockStore({
                integrations: integrationsStateWithShopify.removeIn([
                    'integrations',
                    0,
                    'meta',
                    'currency',
                ]),
                infobarActions: infobarActionsStateFixture({createOrderState}),
            })

            const state = store.getState()

            const component = shallow(
                <DraftOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getCreateOrderState(state).get('loading')}
                    loadingMessage={getCreateOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getCreateOrderState(state).get('payload')}
                    draftOrder={getCreateOrderState(state).get('draftOrder')}
                    products={getCreateOrderState(state).get('products')}
                    header="Duplicate order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
                        order,
                        customer,
                    }}
                    {...actions}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as open, with invoice sent', () => {
            const order = fromJS(shopifyOrderFixture())
            const customer = fromJS(shopifyCustomerFixture())
            const product = fromJS(shopifyProductFixture())
            const products = new Map([[product.get('id'), product]])
            const draftOrder = initDraftOrderPayload(customer, order, products)
                .set('status', 'invoice_sent')
                .set('invoice_sent_at', '2020-02-26T21:31:34-05:00')
            const payload = getDuplicateOrderPayload(draftOrder)
            const createOrderState = createOrderStateFixture({
                payload,
                draftOrder,
            })

            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture({createOrderState}),
            })

            const state = store.getState()

            const component = shallow(
                <DraftOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getCreateOrderState(state).get('loading')}
                    loadingMessage={getCreateOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getCreateOrderState(state).get('payload')}
                    draftOrder={getCreateOrderState(state).get('draftOrder')}
                    products={getCreateOrderState(state).get('products')}
                    header="Duplicate order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
                        order,
                        customer,
                    }}
                    {...actions}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('on open', () => {
        describe('componentWillReceiveProps()', () => {
            it.each([
                [ShopifyAction.CREATE_ORDER, undefined],
                [ShopifyAction.DUPLICATE_ORDER, fromJS(shopifyOrderFixture())],
            ])('should call onInit()', (actionName, order) => {
                const currencyCode = 'USD'
                const customer = fromJS(shopifyCustomerFixture())
                const createOrderState = createOrderStateFixture()

                const store = mockStore({
                    integrations: integrationsStateWithShopify,
                    infobarActions: infobarActionsStateFixture({
                        createOrderState,
                    }),
                })

                const state = store.getState()

                const component = shallow(
                    <DraftOrderModalComponent
                        integrations={getIntegrationsByTypes([
                            SHOPIFY_INTEGRATION_TYPE,
                        ])(state)}
                        loading={getCreateOrderState(state).get('loading')}
                        loadingMessage={getCreateOrderState(state).get(
                            'loadingMessage'
                        )}
                        payload={getCreateOrderState(state).get('payload')}
                        draftOrder={getCreateOrderState(state).get(
                            'draftOrder'
                        )}
                        products={getCreateOrderState(state).get('products')}
                        header="Duplicate order"
                        isOpen={false}
                        data={{
                            actionName,
                            order,
                            customer,
                        }}
                        {...actions}
                    />,
                    {context}
                )

                component.setProps({isOpen: true})

                expect(actions.onInit).toBeCalledWith(
                    context.integrationId,
                    order,
                    customer,
                    currencyCode,
                    component.instance()._onInitError
                )
            })
        })
    })

    describe('actions', () => {
        let order
        let component

        beforeEach(() => {
            order = fromJS(shopifyOrderFixture())

            const customer = fromJS(shopifyCustomerFixture())
            const product = fromJS(shopifyProductFixture())
            const products = new Map([[product.get('id'), product]])
            const draftOrder = initDraftOrderPayload(customer, order, products)
            const payload = getDuplicateOrderPayload(draftOrder)
            const createOrderState = createOrderStateFixture({
                payload,
                draftOrder,
            })

            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture({createOrderState}),
            })

            const state = store.getState()

            component = shallow(
                <DraftOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getCreateOrderState(state).get('loading')}
                    loadingMessage={getCreateOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getCreateOrderState(state).get('payload')}
                    draftOrder={getCreateOrderState(state).get('draftOrder')}
                    products={getCreateOrderState(state).get('products')}
                    header="Duplicate order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
                        order,
                        customer,
                    }}
                    {...actions}
                />,
                {context}
            )
        })

        describe('_onVariantClicked()', () => {
            it('should call addRow()', () => {
                const item = integrationDataItemProductFixture()
                const product = item.data
                const variant = product.variants[0]

                component.instance()._onVariantClicked(item, variant)

                const actionName = ShopifyAction.DUPLICATE_ORDER
                expect(actions.addRow).toHaveBeenCalledWith(
                    actionName,
                    context.integrationId,
                    product,
                    variant
                )
            })
        })

        describe('_onAddCustomItem()', () => {
            it('should call addCustomRow()', () => {
                const lineItem = fromJS(shopifyCustomLineItemFixture())

                component.instance()._onAddCustomItem(lineItem)

                expect(actions.addCustomRow).toHaveBeenCalledWith(
                    context.integrationId,
                    lineItem
                )
            })
        })

        describe('_onEmailInvoice()', () => {
            it('should call onEmailInvoice()', () => {
                const invoicePayload = fromJS(shopifyInvoicePayloadFixture())

                component.instance()._onEmailInvoice(invoicePayload)

                expect(actions.onEmailInvoice).toHaveBeenCalledWith(
                    context.integrationId,
                    context.customerId,
                    order.get('id'),
                    invoicePayload,
                    expect.any(Function)
                )

                expect(actions.onClose).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })

        describe('_onSubmitPaid()', () => {
            it('should call onSubmit()', () => {
                component.instance()._onSubmitPaid()

                expect(actions.onChange).toHaveBeenCalledWith(
                    'payment_pending',
                    false,
                    expect.any(Function)
                )
                expect(actions.onSubmit).toHaveBeenCalled()
                expect(actions.onSubmitCleanUp).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })

        describe('_onSubmitPending()', () => {
            it('should call onSubmit()', () => {
                component.instance()._onSubmitPending()

                expect(actions.onChange).toHaveBeenCalledWith(
                    'payment_pending',
                    true,
                    expect.any(Function)
                )
                expect(actions.onSubmit).toHaveBeenCalled()
                expect(actions.onSubmitCleanUp).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })

        describe('_onCancel()', () => {
            it('should call onCancel()', () => {
                component.instance()._onCancel('foo')

                const actionName = ShopifyAction.DUPLICATE_ORDER
                expect(actions.onCancel).toHaveBeenCalledWith(
                    actionName,
                    context.integrationId,
                    'foo'
                )
                expect(actions.onClose).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })

        describe('_onCancelViaHeader()', () => {
            it('should call onCancel()', () => {
                component.instance()._onCancelViaHeader()

                const actionName = ShopifyAction.DUPLICATE_ORDER
                expect(actions.onCancel).toHaveBeenCalledWith(
                    actionName,
                    context.integrationId,
                    'header'
                )
                expect(actions.onClose).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })

        describe('_onCancelViaFooter()', () => {
            it('should call onCancel()', () => {
                component.instance()._onCancelViaFooter()

                const actionName = ShopifyAction.DUPLICATE_ORDER
                expect(actions.onCancel).toHaveBeenCalledWith(
                    actionName,
                    context.integrationId,
                    'footer'
                )
                expect(actions.onClose).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })

        describe('_onMissingScopeClose()', () => {
            it('should call onClose()', () => {
                component.instance()._onCancelViaHeader()

                expect(actions.onClose).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })
    })
})
