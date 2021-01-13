// @flow

import React from 'react'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS, type Map, type Record} from 'immutable'

import {
    integrationDataItemProductFixture,
    shopifyCustomerFixture,
    shopifyCustomLineItemFixture,
    shopifyInvoicePayloadFixture,
    shopifyOrderFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from '../../../../../../../../../../../../fixtures/shopify.ts'
import {
    createOrderStateFixture,
    infobarActionsStateFixture,
} from '../../../../../../../../../../../../fixtures/infobarActions.ts'
import {getDuplicateOrderPayload} from '../../../../../../../../../../../../state/infobarActions/shopify/createOrder/actions.ts'
import {getCreateOrderState} from '../../../../../../../../../../../../state/infobarActions/shopify/createOrder/selectors.ts'
import {getIntegrationsByTypes} from '../../../../../../../../../../../../state/integrations/selectors.ts'
import {integrationsStateWithShopify} from '../../../../../../../../../../../../fixtures/integrations.ts'
import {initDraftOrderPayload} from '../../../../../../../../../../../../business/shopify/draftOrder.ts'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../../../../../../../constants/integration.ts'
import type {DraftOrderInvoice} from '../../../../../../../../../../../../constants/integrations/types/shopify'
import DraftOrderModal, {DraftOrderModalComponent} from '../DraftOrderModal'
import {ShopifyAction} from '../../../constants'

function initActions() {
    return {
        addCustomRow: jest.fn(),
        addRow: jest.fn(),
        onBulkChange: jest.fn().mockImplementation(
            (
                values: Array<{
                    name: string,
                    value: string | number | boolean | Object,
                }>,
                callback?: () => void
            ) => {
                if (callback) {
                    callback()
                }
            }
        ),
        onCancel: jest.fn(),
        onChange: jest.fn(),
        onClose: jest.fn(),
        onEmailInvoice: jest
            .fn()
            .mockImplementation(
                (
                    integrationId: number,
                    customerId: number,
                    orderId: number | null,
                    invoicePayload: Record<DraftOrderInvoice>,
                    onSuccess: () => void
                ) => {
                    onSuccess()
                }
            ),
        onInit: jest.fn(),
        onOpen: jest.fn(),
        onPayloadChange: jest.fn(),
        onCreateDraftOrder: jest
            .fn()
            .mockImplementation(() => Promise.resolve(fromJS({id: 1}))),
        onReset: jest.fn(),
        onSubmit: jest.fn(),
    }
}

function getProducts(order) {
    const products = new window.Map()

    order.get('line_items', []).forEach((lineItem) => {
        const productId = lineItem.get('product_id')
        const variant = fromJS(
            shopifyVariantFixture({
                id: lineItem.get('variant_id'),
                title: lineItem.get('variant_title'),
            })
        )
        let product: Map<*, *>

        if (products.has(productId)) {
            product = products.get(productId)
            product = product.update('variants', (variants) =>
                variants.push(variant)
            )
        } else {
            product = fromJS(
                shopifyProductFixture({
                    id: productId,
                    title: lineItem.get('title'),
                    variants: [variant],
                })
            )
        }

        products.set(productId, product)
    })

    return products
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
            const products = getProducts(order)
            const draftOrder = initDraftOrderPayload(customer, order, products)
            const payload = getDuplicateOrderPayload(draftOrder)
            const createOrderState = createOrderStateFixture({
                payload,
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
            const products = new window.Map()
            const draftOrder = initDraftOrderPayload(customer, order, products)
            const payload = getDuplicateOrderPayload(draftOrder)
            const createOrderState = createOrderStateFixture({
                payload,
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
            const products = getProducts(order)
            const draftOrder = initDraftOrderPayload(customer, order, products)
            const payload = getDuplicateOrderPayload(draftOrder)
            const createOrderState = createOrderStateFixture({
                payload,
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
            const products = getProducts(order)
            const draftOrder = initDraftOrderPayload(customer, order, products)
                .set('status', 'invoice_sent')
                .set('invoice_sent_at', '2020-02-26T21:31:34-05:00')
            const payload = getDuplicateOrderPayload(draftOrder)
            const createOrderState = createOrderStateFixture({
                payload,
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
                    draftOrder={draftOrder}
                    payload={getCreateOrderState(state).get('payload')}
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
            const products = getProducts(order)
            const draftOrder = initDraftOrderPayload(customer, order, products)
            const payload = getDuplicateOrderPayload(draftOrder)
            const createOrderState = createOrderStateFixture({
                payload,
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
            it('should call onCreateDraftOrder() then onSubmit()', async () => {
                await component.instance()._onSubmitPaid()

                expect(actions.onBulkChange).toHaveBeenCalledWith(
                    [
                        {name: 'draft_order_id', value: 1},
                        {name: 'payment_pending', value: false},
                    ],
                    expect.any(Function)
                )
                expect(actions.onSubmit).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })

        describe('_onSubmitPending()', () => {
            it('should call onCreateDraftOrder() then onSubmit()', async () => {
                await component.instance()._onSubmitPending()

                expect(actions.onBulkChange).toHaveBeenCalledWith(
                    [
                        {name: 'draft_order_id', value: 1},
                        {name: 'payment_pending', value: true},
                    ],
                    expect.any(Function)
                )
                expect(actions.onSubmit).toHaveBeenCalled()
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
