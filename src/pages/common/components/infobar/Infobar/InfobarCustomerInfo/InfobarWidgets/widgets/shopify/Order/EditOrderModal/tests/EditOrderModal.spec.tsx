import React, {ReactNode, ComponentProps, Component} from 'react'
import PropTypes from 'prop-types'
import {fromJS, Map, List} from 'immutable'
import {render, fireEvent} from '@testing-library/react'

import {
    integrationDataItemProductFixture,
    shopifyCustomerFixture,
    shopifyCustomLineItemFixture,
    shopifyOrderFixture,
    shopifyProductFixture,
    shopifyVariantFixture,
} from '../../../../../../../../../../../../fixtures/shopify'
import {getDuplicateOrderPayload} from '../../../../../../../../../../../../state/infobarActions/shopify/createOrder/actions'
import {integrationsStateWithShopify} from '../../../../../../../../../../../../fixtures/integrations'
import {initDraftOrderPayload} from '../../../../../../../../../../../../business/shopify/draftOrder'
import ProductSearchInput from '../../../../../../../../../../forms/ProductSearchInput/ProductSearchInput'
import {CustomerContext} from '../../../../../../../../../infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo'
import {ShopifyActionType} from '../../../types'
import {EditOrderModalContainer} from '../EditOrderModal'
import AddCustomItemPopover from '../../../shared/DraftOrderModal/AddCustomItemPopover/AddCustomItemPopover'

jest.mock('../../../../../../../../../../utils/labels', () => ({
    DatetimeLabel: ({dateTime}: {dateTime: string}) => (
        <div data-testid="DatetimeLabel">{dateTime}</div>
    ),
}))

jest.mock(
    '../../../../../../../../../Modal',
    () =>
        ({
            isOpen,
            children,
            onClose,
        }: {
            isOpen: boolean
            children: ReactNode
            onClose: () => void
        }) => {
            if (isOpen) {
                return (
                    <div data-testid="Modal" onClick={onClose}>
                        {children}
                    </div>
                )
            }
            return null
        }
)

const mockFromJS = fromJS
const mockIntegrationDataItemProductFixture = integrationDataItemProductFixture
const mockShopifyCustomLineItemFixture = shopifyCustomLineItemFixture

jest.mock(
    '../../../../../../../../../../forms/ProductSearchInput/ProductSearchInput',
    () =>
        ({onVariantClicked}: ComponentProps<typeof ProductSearchInput>) => {
            const item = mockIntegrationDataItemProductFixture()
            const variant = item.data.variants[0]

            return (
                <div data-testid="ProductSearchInput">
                    <div
                        data-testid="ProductSearchInput_result"
                        onClick={() => {
                            onVariantClicked(item, variant)
                        }}
                    >
                        Result
                    </div>
                </div>
            )
        }
)

jest.mock(
    '../../../shared/DraftOrderModal/AddCustomItemPopover/AddCustomItemPopover',
    () =>
        ({onSubmit}: ComponentProps<typeof AddCustomItemPopover>) => {
            return (
                <div data-testid="AddCustomItemPopover">
                    <div
                        data-testid="AddCustomItemPopover_submit"
                        onClick={() =>
                            onSubmit(
                                mockFromJS(mockShopifyCustomLineItemFixture())
                            )
                        }
                    >
                        Submit
                    </div>
                </div>
            )
        }
)

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

class MockLegacyContextWrapper extends Component<{
    children: ReactNode
    value?: {integrationId?: number}
}> {
    static childContextTypes = {
        integrationId: PropTypes.number.isRequired,
    }

    static defaultProps = {value: {}}

    getChildContext() {
        const {value} = this.props

        return {integrationId: 1, ...value}
    }

    render() {
        const {children} = this.props
        return children
    }
}

const order = fromJS(shopifyOrderFixture()) as Map<any, any>
const customer = fromJS(shopifyCustomerFixture())
const products = getProducts(order)
const draftOrder = initDraftOrderPayload(customer, order, products)
const payload = getDuplicateOrderPayload(draftOrder)
const minProps = {
    isOpen: true,
    header: 'Edit order',
    onOpen: jest.fn(),
    onChange: jest.fn(),
    onLineItemChange: jest.fn(),
    //eslint-disable-next-line @typescript-eslint/require-await
    onBulkChange: jest.fn(async (params, callBackFunc?: () => void) => {
        if (callBackFunc) {
            callBackFunc()
        }
    }),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
    data: {
        actionName: ShopifyActionType.EditOrder,
        order: fromJS(shopifyOrderFixture()),
        customer: fromJS(shopifyCustomerFixture()),
    },
    integrations: (
        integrationsStateWithShopify.get('integrations') as List<any>
    ).setIn([0, 'meta', 'currency'], 'EUR'),
    loading: false,
    loadingMessage: undefined,
    payload: null,
    calculatedEditOrder: fromJS({}),
    products: fromJS({}),
    addCustomRow: jest.fn(),
    addRow: jest.fn(),
    onCancel: jest.fn(),
    onInit: jest.fn(),
    onNotifyChange: jest.fn(),
    onNoteChange: jest.fn(),
    onPayloadChange: jest.fn(),
    onSubmitEditOrder: jest.fn().mockResolvedValue(draftOrder.set('id', 1)),
    onReset: jest.fn(),
}

describe('<EditOrderModal/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render when the modal is closed', () => {
        const {container} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer {...minProps} isOpen={false} />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a spinner when missing data', () => {
        const {container} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer {...minProps} />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render with a populated order table when data is populated', () => {
        const {container} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer
                        {...minProps}
                        products={products}
                        payload={payload}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render with an empty order table when data is empty', () => {
        const order = (fromJS(shopifyOrderFixture()) as Map<any, any>).set(
            'line_items',
            []
        )
        const products = fromJS([])
        const draftOrder = initDraftOrderPayload(customer, order, products)
        const payload = getDuplicateOrderPayload(draftOrder)
        const {container} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer
                        {...minProps}
                        products={products}
                        payload={payload}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render with a default currency if missing from integrations', () => {
        const {container} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer
                        {...minProps}
                        integrations={minProps.integrations.removeIn([
                            0,
                            'meta',
                            'currency',
                        ])}
                        products={products}
                        payload={payload}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should call onInit when modal is opened', () => {
        const {rerender} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer
                        {...minProps}
                        isOpen={false}
                        products={products}
                        payload={payload}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        rerender(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer
                        {...minProps}
                        isOpen
                        products={products}
                        payload={payload}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        expect(minProps.onInit).toBeCalledWith(
            1,
            order,
            customer,
            'EUR',
            expect.any(Function)
        )
    })

    it('should add a row when clicking on a variant', () => {
        const item = integrationDataItemProductFixture()
        const product = item.data
        const variant = product.variants[0]
        const {getByTestId} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer
                        {...minProps}
                        products={products}
                        payload={payload}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        fireEvent.click(getByTestId('ProductSearchInput_result'))
        expect(minProps.addRow).toHaveBeenCalledWith(
            ShopifyActionType.EditOrder,
            1,
            product,
            variant
        )
    })

    it('should add a custom row when clicking on add a custom item', () => {
        const draftOrder = initDraftOrderPayload(customer, order, products)
        const payload = getDuplicateOrderPayload(draftOrder)
        const lineItem = fromJS(shopifyCustomLineItemFixture())
        const {getByTestId} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer
                        {...minProps}
                        products={products}
                        payload={payload}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        fireEvent.click(getByTestId('AddCustomItemPopover_submit'))
        expect(minProps.addCustomRow).toHaveBeenCalledWith(1, lineItem)
    })

    it('should cancel when closing the modal"', () => {
        const draftOrder = initDraftOrderPayload(customer, order, products)
        const payload = getDuplicateOrderPayload(draftOrder)
        const {getByTestId} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer
                        {...minProps}
                        products={products}
                        payload={payload}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        fireEvent.click(getByTestId('Modal'))
        expect(minProps.onCancel).toHaveBeenCalledWith(
            ShopifyActionType.EditOrder,
            1,
            'header'
        )
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })

    it('should cancel when clicking on "Cancel"', () => {
        const draftOrder = initDraftOrderPayload(customer, order, products)
        const payload = getDuplicateOrderPayload(draftOrder)
        const {getByText} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer
                        {...minProps}
                        products={products}
                        payload={payload}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        fireEvent.click(getByText(/Cancel/i))
        expect(minProps.onCancel).toHaveBeenCalledWith(
            ShopifyActionType.EditOrder,
            1,
            'footer'
        )
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })

    it('should cancel when closing the missing scope modal', () => {
        const draftOrder = initDraftOrderPayload(customer, order, products)
        const payload = getDuplicateOrderPayload(draftOrder)
        const {getByTestId} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderModalContainer
                        {...minProps}
                        integrations={(
                            integrationsStateWithShopify.get(
                                'integrations'
                            ) as List<any>
                        ).setIn([0, 'meta', 'oauth', 'scope'], 'foo')}
                        products={products}
                        payload={payload}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        fireEvent.click(getByTestId('Modal'))
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })
})
