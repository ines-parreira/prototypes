import React from 'react'
import {shallow, ShallowWrapper} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS, Map, List} from 'immutable'

import {
    integrationDataItemProductFixture,
    shopifyCustomerFixture,
    shopifyCustomLineItemFixture,
    shopifyInvoicePayloadFixture,
    shopifyOrderFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from '../../../../../../../../../../../../fixtures/shopify'
import {
    createOrderStateFixture,
    infobarActionsStateFixture,
} from '../../../../../../../../../../../../fixtures/infobarActions'
import {getDuplicateOrderPayload} from '../../../../../../../../../../../../state/infobarActions/shopify/createOrder/actions'
import {getCreateOrderState} from '../../../../../../../../../../../../state/infobarActions/shopify/createOrder/selectors'
import {getIntegrationsByTypes} from '../../../../../../../../../../../../state/integrations/selectors'
import {RootState} from '../../../../../../../../../../../../state/types'
import {IntegrationType} from '../../../../../../../../../../../../models/integration/types'
import {integrationsStateWithShopify} from '../../../../../../../../../../../../fixtures/integrations'
import {initDraftOrderPayload} from '../../../../../../../../../../../../business/shopify/draftOrder'
import {DraftOrderModalContainer} from '../DraftOrderModal'
import {ShopifyActionType} from '../../../types'

function initActions() {
    return {
        addCustomRow: jest.fn(),
        addRow: jest.fn(),
        onBulkChange: jest.fn().mockImplementation(
            (
                values: Array<{
                    name: string
                    value: string | number | boolean | Record<string, unknown>
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
                    invoicePayload: Map<any, any>,
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

function getProducts(order: Map<any, any>) {
    const products = new window.Map()

    ;(order.get('line_items', []) as List<any>).forEach(
        (lineItem: Map<any, any>) => {
            const productId = lineItem.get('product_id')
            const variant = fromJS(
                shopifyVariantFixture({
                    id: lineItem.get('variant_id'),
                    title: lineItem.get('variant_title'),
                })
            )
            let product: Map<any, any>

            if (products.has(productId)) {
                product = products.get(productId)
                product = product.update('variants', (variants: List<any>) =>
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
        }
    )

    return products
}

describe('<DraftOrderModal/>', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const context = {integrationId: 1, customerId: 2}
    let actions: ReturnType<typeof initActions>

    beforeEach(() => {
        actions = initActions()
    })

    describe('render()', () => {
        it('should render as closed', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const state = store.getState() as RootState

            const component = shallow(
                <DraftOrderModalContainer
                    integrations={getIntegrationsByTypes([
                        IntegrationType.ShopifyIntegrationType,
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
                        actionName: ShopifyActionType.DuplicateOrder,
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

            const state = store.getState() as RootState

            const component = shallow(
                <DraftOrderModalContainer
                    integrations={getIntegrationsByTypes([
                        IntegrationType.ShopifyIntegrationType,
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
                        actionName: ShopifyActionType.DuplicateOrder,
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

            const state = store.getState() as RootState

            const component = shallow(
                <DraftOrderModalContainer
                    integrations={getIntegrationsByTypes([
                        IntegrationType.ShopifyIntegrationType,
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
                        actionName: ShopifyActionType.DuplicateOrder,
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
            const order = (fromJS(shopifyOrderFixture()) as Map<any, any>).set(
                'line_items',
                []
            )
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

            const state = store.getState() as RootState

            const component = shallow(
                <DraftOrderModalContainer
                    integrations={getIntegrationsByTypes([
                        IntegrationType.ShopifyIntegrationType,
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
                        actionName: ShopifyActionType.DuplicateOrder,
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

            const state = store.getState() as RootState

            const component = shallow(
                <DraftOrderModalContainer
                    integrations={getIntegrationsByTypes([
                        IntegrationType.ShopifyIntegrationType,
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
                        actionName: ShopifyActionType.DuplicateOrder,
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

            const state = store.getState() as RootState

            const component = shallow(
                <DraftOrderModalContainer
                    integrations={getIntegrationsByTypes([
                        IntegrationType.ShopifyIntegrationType,
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
                        actionName: ShopifyActionType.DuplicateOrder,
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
                [ShopifyActionType.CreateOrder, undefined],
                [
                    ShopifyActionType.DuplicateOrder,
                    fromJS(shopifyOrderFixture()),
                ],
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

                const state = store.getState() as RootState

                const component = shallow<DraftOrderModalContainer>(
                    <DraftOrderModalContainer
                        integrations={getIntegrationsByTypes([
                            IntegrationType.ShopifyIntegrationType,
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
        let order: Map<any, any>
        let component: ShallowWrapper<any, any, DraftOrderModalContainer>

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

            const state = store.getState() as RootState

            component = shallow(
                <DraftOrderModalContainer
                    integrations={getIntegrationsByTypes([
                        IntegrationType.ShopifyIntegrationType,
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
                        actionName: ShopifyActionType.DuplicateOrder,
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

                const actionName = ShopifyActionType.DuplicateOrder
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
            it('should call onCreateDraftOrder() then onSubmit()', (done) => {
                component.instance()._onSubmitPaid()
                setImmediate(() => {
                    expect(actions.onBulkChange).toHaveBeenCalledWith(
                        [
                            {name: 'draft_order_id', value: 1},
                            {name: 'payment_pending', value: false},
                        ],
                        expect.any(Function)
                    )
                    expect(actions.onSubmit).toHaveBeenCalled()
                    expect(actions.onReset).toHaveBeenCalled()
                    done()
                })
            })
        })

        describe('_onSubmitPending()', () => {
            it('should call onCreateDraftOrder() then onSubmit()', (done) => {
                component.instance()._onSubmitPending()
                setImmediate(() => {
                    expect(actions.onBulkChange).toHaveBeenCalledWith(
                        [
                            {name: 'draft_order_id', value: 1},
                            {name: 'payment_pending', value: true},
                        ],
                        expect.any(Function)
                    )
                    expect(actions.onSubmit).toHaveBeenCalled()
                    expect(actions.onReset).toHaveBeenCalled()
                    done()
                })
            })
        })

        describe('_onCancel()', () => {
            it('should call onCancel()', () => {
                component.instance()._onCancel('foo')

                const actionName = ShopifyActionType.DuplicateOrder
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

                const actionName = ShopifyActionType.DuplicateOrder
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

                const actionName = ShopifyActionType.DuplicateOrder
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
