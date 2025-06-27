import { ComponentProps } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    bigCommerceCartFixture,
    bigCommerceConsignmentWithSelectedShippingMethodFixture,
    bigCommerceCustomerFixture,
    bigCommerceIntegrationFixture,
    bigCommerceOrderFixture,
    bigCommerceShippingAddressesFixture,
} from 'fixtures/bigcommerce'
import { integrationsState } from 'fixtures/integrations'
import {
    BigCommerceActionType,
    BigCommerceCheckout,
} from 'models/integration/types'
import OrderModalRenderWrapper, {
    OrderModal,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/OrderModal'
import { useCheckout } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/OrderModalHelper'
import {
    IntegrationContext,
    IntegrationContextType,
} from 'providers/infobar/IntegrationContext'
import { renderHook } from 'utils/testing/renderHook'

import {
    addCheckoutBillingAddress,
    checkAddressValidity,
    checkCheckoutValidity,
    checkProductsValidity,
    onInit,
    upsertCheckoutConsignment,
} from '../utils'
import * as utils from '../utils'

jest.mock('../utils')

jest.mock('common/segment')

const defaultState = {
    integrations: fromJS(integrationsState),
}
const mockStore = configureMockStore([thunk])
const store = mockStore(defaultState)

describe('OrderModal', () => {
    const createOrderProps: ComponentProps<typeof OrderModal> = {
        isOpen: true,
        data: {
            actionName: BigCommerceActionType.CreateOrder,
            customer: bigCommerceCustomerFixture(),
            order: null,
        },
        integration: bigCommerceIntegrationFixture(),
        availableAddresses: bigCommerceShippingAddressesFixture,
        onClose: jest.fn(),
    }

    const duplicateOrderProps: ComponentProps<typeof OrderModal> = {
        isOpen: true,
        data: {
            actionName: BigCommerceActionType.DuplicateOrder,
            customer: bigCommerceCustomerFixture(),
            order: fromJS(bigCommerceOrderFixture),
        },
        integration: bigCommerceIntegrationFixture(),
        availableAddresses: bigCommerceShippingAddressesFixture,
        onClose: jest.fn(),
    }

    beforeAll(() => {
        ;(onInit as jest.MockedFunction<typeof onInit>).mockImplementation(
            () => new Promise((resolve) => resolve()),
        )
    })

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render Create Order', async () => {
        render(
            <>
                <div id="App" />
                <Provider store={store}>
                    <OrderModal {...createOrderProps} />
                </Provider>
            </>,
        )

        // Wait for the modal to render
        await screen.findByText('Address')

        // Check that the modal title is correct for create order
        expect(screen.getByText('Create order')).toBeInTheDocument()

        // Check that the modal has the correct structure and elements
        expect(screen.getByRole('dialog')).toBeInTheDocument()

        // Check for radio buttons for order type selection
        expect(screen.getAllByLabelText('Draft order')).toHaveLength(2)
        expect(screen.getAllByLabelText('Paid order')).toHaveLength(2)

        // Check for the Products section
        expect(screen.getByText('Products')).toBeInTheDocument()

        // Check for the Address section
        expect(screen.getByText('Address')).toBeInTheDocument()

        // Check for Comments & Notes section
        expect(screen.getByText('Comments & Notes')).toBeInTheDocument()

        // Check for form labels
        expect(screen.getByLabelText('Comment')).toBeInTheDocument()
        expect(screen.getByLabelText('Staff note')).toBeInTheDocument()

        // Check for action buttons
        expect(
            screen.getByRole('button', { name: /Cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Create Draft Order/i }),
        ).toBeInTheDocument()

        // Check for close button in header
        expect(screen.getByText(/close/i)).toBeInTheDocument()

        // Check for shipping address checkbox
        expect(
            screen.getByLabelText(
                'Shipping address is same as billing address',
            ),
        ).toBeInTheDocument()
    })

    it('should render Duplicate Order', async () => {
        render(
            <>
                <div id="App" />
                <Provider store={store}>
                    <OrderModal {...duplicateOrderProps} />
                </Provider>
            </>,
        )

        // Wait for the modal to render
        await screen.findByText('Address')

        // Check that the modal title is correct for duplicate order
        expect(screen.getByText('Duplicate order')).toBeInTheDocument()

        // Check that the modal has the correct structure and elements
        expect(screen.getByRole('dialog')).toBeInTheDocument()

        // Check for radio buttons for order type selection
        expect(screen.getAllByLabelText('Draft order')).toHaveLength(2)
        expect(screen.getAllByLabelText('Paid order')).toHaveLength(2)

        // Check for the Products section
        expect(screen.getByText('Products')).toBeInTheDocument()

        // Check for the Address section
        expect(screen.getByText('Address')).toBeInTheDocument()

        // Check for Comments & Notes section
        expect(screen.getByText('Comments & Notes')).toBeInTheDocument()

        // Check for form labels
        expect(screen.getByLabelText('Comment')).toBeInTheDocument()
        expect(screen.getByLabelText('Staff note')).toBeInTheDocument()

        // Check for action buttons
        expect(
            screen.getByRole('button', { name: /Cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Create Draft Order/i }),
        ).toBeInTheDocument()

        // Check for close button in header
        expect(screen.getByText(/close/i)).toBeInTheDocument()

        // Check for shipping address checkbox
        expect(
            screen.getByLabelText(
                'Shipping address is same as billing address',
            ),
        ).toBeInTheDocument()
    })
})

describe('OrderModalConnected', () => {
    const defaultIntegrationContextValue = {
        integration: fromJS({}),
        integrationId: 515,
    }

    const createOrderProps: ComponentProps<typeof OrderModalRenderWrapper> = {
        data: {
            actionName: BigCommerceActionType.CreateOrder,
            customer: bigCommerceCustomerFixture(),
            order: null,
        },
        isOpen: false,
        onClose: jest.fn(),
    }

    const duplicateOrderProps: ComponentProps<typeof OrderModalRenderWrapper> =
        {
            data: {
                actionName: BigCommerceActionType.DuplicateOrder,
                customer: bigCommerceCustomerFixture(),
                order: fromJS(bigCommerceOrderFixture),
            },
            isOpen: false,
            onClose: jest.fn(),
        }

    const renderSubject = ({
        integrationContextValue = defaultIntegrationContextValue,
        orderModalProps = createOrderProps,
    }: {
        integrationContextValue?: IntegrationContextType
        orderModalProps?: ComponentProps<typeof OrderModalRenderWrapper>
    }) => {
        return render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <OrderModalRenderWrapper {...orderModalProps} />
                </IntegrationContext.Provider>
            </Provider>,
        )
    }

    it('Create Order - renders null when `isOpen` is false', () => {
        const { container } = renderSubject({})
        expect(container.firstChild).toBe(null)
    })

    it('Duplicate Order - renders null when `isOpen` is false', () => {
        const { container } = renderSubject({
            orderModalProps: duplicateOrderProps,
        })
        expect(container.firstChild).toBe(null)
    })

    it('Create Order - renders null when IntegrationContext has no integrationId', () => {
        const { container } = renderSubject({
            integrationContextValue: {
                integrationId: null,
                integration: fromJS({}),
            },
        })
        expect(container.firstChild).toBe(null)
    })

    it('Duplicate Order - renders null when IntegrationContext has no integrationId', () => {
        const { container } = renderSubject({
            integrationContextValue: {
                integrationId: null,
                integration: fromJS({}),
            },
            orderModalProps: duplicateOrderProps,
        })
        expect(container.firstChild).toBe(null)
    })

    it('Create Order - renders when `isOpen` is `true` and IntegrationContext has value', () => {
        createOrderProps.isOpen = true
        const { rerender } = render(<div id="App" />)
        rerender(
            <>
                <div id="App" />
                <Provider store={store}>
                    <IntegrationContext.Provider
                        value={defaultIntegrationContextValue}
                    >
                        <OrderModalRenderWrapper {...createOrderProps} />
                    </IntegrationContext.Provider>
                </Provider>
            </>,
        )

        expect(
            screen.getByRole('button', { name: /Create draft order/i }),
        ).toBeTruthy()
    })

    it('Duplicate Order - renders when `isOpen` is `true` and IntegrationContext has value', () => {
        duplicateOrderProps.isOpen = true
        const { rerender } = render(<div id="App" />)
        rerender(
            <>
                <div id="App" />
                <Provider store={store}>
                    <IntegrationContext.Provider
                        value={defaultIntegrationContextValue}
                    >
                        <OrderModalRenderWrapper {...duplicateOrderProps} />
                    </IntegrationContext.Provider>
                </Provider>
            </>,
        )

        expect(
            screen.getByRole('button', { name: /Create draft order/i }),
        ).toBeTruthy()
    })

    it('`Create order` button does not send a create BigCommerce order action', () => {
        const bigcommerceCreateOrderSpy = jest.spyOn(
            utils,
            'bigcommerceCreateOrderFromCheckoutCart',
        )
        const { rerender } = render(<div id="App" />)
        rerender(
            <>
                <div id="App" />
                <Provider store={store}>
                    <IntegrationContext.Provider
                        value={defaultIntegrationContextValue}
                    >
                        <OrderModalRenderWrapper {...createOrderProps} />
                    </IntegrationContext.Provider>
                </Provider>
            </>,
        )

        screen.getByRole('button', { name: /Create draft order/i }).click()

        expect(bigcommerceCreateOrderSpy).toHaveBeenCalledTimes(0)
    })

    it('`Create order` button does not send a create BigCommerce order action', () => {
        const bigcommerceCreateOrderSpy = jest.spyOn(
            utils,
            'bigcommerceCreateOrderFromCheckoutCart',
        )
        const { rerender } = render(<div id="App" />)
        rerender(
            <>
                <div id="App" />
                <Provider store={store}>
                    <IntegrationContext.Provider
                        value={defaultIntegrationContextValue}
                    >
                        <OrderModalRenderWrapper {...duplicateOrderProps} />
                    </IntegrationContext.Provider>
                </Provider>
            </>,
        )

        screen.getByRole('button', { name: /Create draft order/i }).click()

        expect(bigcommerceCreateOrderSpy).toHaveBeenCalledTimes(0)
    })

    // TODO(React18): fix this test
    test.skip('`Create order` button sends a create BigCommerce order action', () => {
        const bigcommerceCreateOrderSpy = jest.spyOn(
            utils,
            'bigcommerceCreateOrderFromCheckoutCart',
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
        renderSubject({
            orderModalProps: { ...createOrderProps, isOpen: true },
        })

        screen.getByRole('button', { name: /Create draft order/i }).click()

        expect(bigcommerceCreateOrderSpy).toHaveBeenCalled()
    })
})

describe('useCheckout', () => {
    it('works as expected', async () => {
        const cartMock = bigCommerceCartFixture()
        const bigCommerceCheckoutFixture = {
            id: 'returned-checkout-id',
            cart: cartMock,
            consignments: [
                bigCommerceConsignmentWithSelectedShippingMethodFixture,
            ],
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

        const { result } = renderHook(() => useCheckout(defaultProps))

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
            new Promise((resolve) => resolve(bigCommerceCheckoutFixture)),
        )
        ;(
            upsertCheckoutConsignment as jest.MockedFunction<
                typeof upsertCheckoutConsignment
            >
        ).mockReturnValueOnce(
            new Promise((resolve) => resolve(bigCommerceCheckoutFixture)),
        )

        act(() => {
            void result.current.onSelectAddress(
                bigCommerceShippingAddressesFixture[0],
                'billing',
                'test2@gorgias.com',
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
            consignment:
                bigCommerceConsignmentWithSelectedShippingMethodFixture,
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
