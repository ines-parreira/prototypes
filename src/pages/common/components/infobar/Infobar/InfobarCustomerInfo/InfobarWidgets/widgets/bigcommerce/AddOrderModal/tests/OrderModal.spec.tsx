import {render, screen, waitFor} from '@testing-library/react'
import {renderHook, act} from '@testing-library/react-hooks'
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
    checkAddressValidity,
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
        availableAddresses: bigCommerceShippingAddressesFixture,
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
        const {rerender, baseElement} = render(<div id="App" />)
        rerender(
            <>
                <div id="App" />
                <Provider store={store}>
                    <OrderModal {...defaultProps} />
                </Provider>
            </>
        )

        await screen.findByText('Address')

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
        defaultProps.isOpen = true
        const {rerender} = render(<div id="App" />)
        rerender(
            <>
                <div id="App" />
                <Provider store={store}>
                    <IntegrationContext.Provider
                        value={defaultIntegrationContextValue}
                    >
                        <OrderModalRenderWrapper {...defaultProps} />
                    </IntegrationContext.Provider>
                </Provider>
            </>
        )

        expect(
            screen.getByRole('button', {name: /Create draft order/i})
        ).toBeTruthy()
    })

    it('`Create order` button does not send a create BigCommerce order action', () => {
        const bigcommerceCreateOrderSpy = jest.spyOn(
            utils,
            'bigcommerceCreateOrder'
        )
        const {rerender} = render(<div id="App" />)
        rerender(
            <>
                <div id="App" />
                <Provider store={store}>
                    <IntegrationContext.Provider
                        value={defaultIntegrationContextValue}
                    >
                        <OrderModalRenderWrapper {...defaultProps} />
                    </IntegrationContext.Provider>
                </Provider>
            </>
        )

        screen.getByRole('button', {name: /Create draft order/i}).click()

        expect(bigcommerceCreateOrderSpy).toHaveBeenCalledTimes(0)
    })

    // @todo: Fix test
    test.skip('`Create order` button sends a create BigCommerce order action', () => {
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
            checkAddressValidity as jest.MockedFunction<
                typeof checkAddressValidity
            >
        ).mockReturnValue(true)
        ;(
            checkCheckoutValidity as jest.MockedFunction<
                typeof checkCheckoutValidity
            >
        ).mockReturnValue(true)
        renderSubject({orderModalProps: {...defaultProps, isOpen: true}})

        screen.getByRole('button', {name: /Create draft order/i}).click()

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
        const defaultProps = {
            integrationId: 188,
            setIsTotalPriceLoading: jest.fn(),
            availableAddresses: bigCommerceShippingAddressesFixture,
            customAddresses: [],
            setCustomAddresses: jest.fn(),
        }

        const {result} = renderHook(() => useCheckout(defaultProps))

        expect(result.current).toMatchObject({
            cart: null,
            consignment: null,
            billingAddress: null,
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
            billingAddress: null,
            shippingAddress: null,
            totals: {
                subTotal: 78,
                shipping: 0,
                taxes: 15.599999999999994,
                total: cartMock.cart_amount,
            },
        })

        // Select billing address
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
                bigCommerceShippingAddressesFixture[0],
                'billing'
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
                subTotal: 78,
                shipping: 27,
                taxes: 11.400000000000006,
                total: 93.6,
            },
        })
    })
})
