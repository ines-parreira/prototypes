import {render, screen, waitFor} from '@testing-library/react'
import {renderHook, act} from 'react-hooks-testing-library'
import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {
    bigCommerceCartFixture,
    bigCommerceConsignmentFixture,
    bigCommerceCustomerFixture,
    bigCommerceIntegrationFixture,
    bigCommerceShippingAddressesFixture,
} from 'fixtures/bigcommerce'
import OrderModalRenderWrapper, {
    OrderModal,
    useCheckout,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/OrderModal'
import {integrationsState} from 'fixtures/integrations'
import {
    IntegrationContext,
    IntegrationContextType,
} from 'providers/infobar/IntegrationContext'
import {
    BigCommerceActionType,
    BigCommerceCheckout,
} from 'models/integration/types'
import {
    addCheckoutBillingAddress,
    upsertCheckoutConsignment,
    onInit,
    checkProductsValidity,
    checkShippingAddressValidity,
    checkCheckoutValidity,
} from '../utils'
import * as utils from '../utils'

jest.mock('../utils')

jest.mock('store/middlewares/segmentTracker')

const defaultState = {
    integrations: fromJS(integrationsState),
}
const mockStore = configureMockStore([thunk])
const store = mockStore(defaultState)

describe('OrderModal', () => {
    const defaultProps: ComponentProps<typeof OrderModal> = {
        isOpen: true,
        data: {
            actionName: BigCommerceActionType.CreateOrder,
            customer: bigCommerceCustomerFixture(),
        },
        integration: bigCommerceIntegrationFixture(),
        shippingAddresses: bigCommerceShippingAddressesFixture,
        onClose: jest.fn(),
    }

    beforeAll(() => {
        ;(onInit as jest.MockedFunction<typeof onInit>).mockImplementation(
            () => new Promise((resolve) => resolve())
        )
    })

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render', async () => {
        const {baseElement} = render(
            <Provider store={store}>
                <OrderModal {...defaultProps} />
            </Provider>
        )

        await screen.findByText('Awaiting Fulfillment')
        expect(onInit).toHaveBeenCalled()

        expect(baseElement).toMatchSnapshot()
    })
})

describe('OrderModalConnected', () => {
    const defaultIntegrationContextValue = {
        integration: fromJS({}),
        integrationId: 515,
    }

    const defaultProps: ComponentProps<typeof OrderModalRenderWrapper> = {
        data: {
            actionName: BigCommerceActionType.CreateOrder,
            customer: bigCommerceCustomerFixture(),
        },
        isOpen: false,
        onClose: jest.fn(),
    }

    const renderSubject = ({
        integrationContextValue = defaultIntegrationContextValue,
        orderModalProps = defaultProps,
    }: {
        integrationContextValue?: IntegrationContextType
        orderModalProps?: ComponentProps<typeof OrderModalRenderWrapper>
    }) => {
        return render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <OrderModalRenderWrapper {...orderModalProps} />
                </IntegrationContext.Provider>
            </Provider>
        )
    }

    it('renders null when `isOpen` is false', () => {
        const {container} = renderSubject({})
        expect(container.firstChild).toBe(null)
    })

    it('renders null when IntegrationContext has no integrationId', () => {
        const {container} = renderSubject({
            integrationContextValue: {
                integrationId: null,
                integration: fromJS({}),
            },
        })
        expect(container.firstChild).toBe(null)
    })

    it('renders when `isOpen` is `true` and IntegrationContext has value', () => {
        renderSubject({orderModalProps: {...defaultProps, isOpen: true}})

        expect(screen.getByRole('button', {name: /Add order/i})).toBeTruthy()
    })

    it('`Add order` button does not send a create BigCommerce order action', () => {
        const bigcommerceCreateOrderSpy = jest.spyOn(
            utils,
            'bigcommerceCreateOrder'
        )
        renderSubject({orderModalProps: {...defaultProps, isOpen: true}})

        screen.getByRole('button', {name: /Add order/i}).click()

        expect(bigcommerceCreateOrderSpy).toHaveBeenCalledTimes(0)
    })

    // @todo: Fix test
    test.skip('`Add order` button sends a create BigCommerce order action', () => {
        const bigcommerceCreateOrderSpy = jest.spyOn(
            utils,
            'bigcommerceCreateOrder'
        )
        ;(
            checkProductsValidity as jest.MockedFunction<
                typeof checkProductsValidity
            >
        ).mockReturnValue(true)
        ;(
            checkShippingAddressValidity as jest.MockedFunction<
                typeof checkShippingAddressValidity
            >
        ).mockReturnValue(true)
        ;(
            checkCheckoutValidity as jest.MockedFunction<
                typeof checkCheckoutValidity
            >
        ).mockReturnValue(true)
        renderSubject({orderModalProps: {...defaultProps, isOpen: true}})

        screen.getByRole('button', {name: /Add order/i}).click()

        expect(bigcommerceCreateOrderSpy).toHaveBeenCalled()
    })
})

describe('useCheckout', () => {
    it('works as expected', async () => {
        const cartMock = bigCommerceCartFixture()
        const bigCommerceCheckoutFixture = {
            id: 'returned-checkout-id',
            cart: cartMock,
            consignments: [bigCommerceConsignmentFixture],
            shipping_cost_total_ex_tax: 27,
            subtotal_ex_tax: 777,
            tax_total: 111,
            grand_total: 888,
        } as BigCommerceCheckout
        const defaultProps = {integrationId: 188}

        const {result} = renderHook(() => useCheckout(defaultProps))

        expect(result.current).toMatchObject({
            cart: null,
            consignment: null,
            shippingAddress: null,
            totals: {
                subTotal: 0,
                taxes: 0,
                total: 0,
            },
        })

        // Initial cart provided
        act(() => result.current.setCart(cartMock))

        expect(upsertCheckoutConsignment).not.toHaveBeenCalled()
        expect(result.current).toMatchObject({
            cart: cartMock,
            consignment: null,
            shippingAddress: null,
            totals: {
                subTotal: cartMock.base_amount,
                shipping: 0,
                taxes: cartMock.cart_amount - cartMock.base_amount,
                total: cartMock.cart_amount,
            },
        })

        // Select shipping address
        ;(
            addCheckoutBillingAddress as jest.MockedFunction<
                typeof addCheckoutBillingAddress
            >
        ).mockReturnValueOnce(
            new Promise((resolve) => resolve(bigCommerceCheckoutFixture))
        )
        ;(
            upsertCheckoutConsignment as jest.MockedFunction<
                typeof upsertCheckoutConsignment
            >
        ).mockReturnValueOnce(
            new Promise((resolve) => resolve(bigCommerceCheckoutFixture))
        )

        act(() => {
            void result.current.onSelectAddress(
                bigCommerceShippingAddressesFixture[0]
            )
        })

        await waitFor(() => {
            expect(addCheckoutBillingAddress).toHaveBeenNthCalledWith(1, {
                cart: cartMock,
                integrationId: 188,
                selectedAddress: bigCommerceShippingAddressesFixture[0],
            })
        })
        expect(upsertCheckoutConsignment).toHaveBeenNthCalledWith(1, {
            cart: cartMock,
            integrationId: 188,
            shippingAddress: bigCommerceShippingAddressesFixture[0],
        })

        // we now have `consignment` and `shippingAddress` set
        expect(result.current).toMatchObject({
            cart: cartMock,
            consignment: bigCommerceConsignmentFixture,
            shippingAddress: bigCommerceShippingAddressesFixture[0],
            totals: {
                subTotal: 777,
                shipping: 27,
                taxes: 111,
                total: 888,
            },
        })
    })
})
