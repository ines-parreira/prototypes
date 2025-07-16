import { ComponentProps } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
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

import * as utils from '../utils'

jest.mock('../utils', () => ({
    ...jest.requireActual('../utils'),
    onInit: jest.fn(),
    checkProductsValidity: jest.fn(),
    checkAddressValidity: jest.fn(),
    checkCheckoutValidity: jest.fn(),
    addCheckoutBillingAddress: jest.fn(),
    upsertCheckoutConsignment: jest.fn(),
    bigcommerceCreateOrderFromCheckoutCart: jest.fn(),
}))

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

    beforeEach(() => {
        jest.clearAllMocks()
        ;(
            utils.onInit as jest.MockedFunction<typeof utils.onInit>
        ).mockResolvedValue(undefined)
    })

    it('should render Create Order', async () => {
        await act(async () => {
            render(
                <>
                    <div id="App" />
                    <Provider store={store}>
                        <OrderModal {...createOrderProps} />
                    </Provider>
                </>,
            )
        })

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
        await act(async () => {
            render(
                <>
                    <div id="App" />
                    <Provider store={store}>
                        <OrderModal {...duplicateOrderProps} />
                    </Provider>
                </>,
            )
        })

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

    beforeEach(() => {
        jest.clearAllMocks()
        ;(
            utils.onInit as jest.MockedFunction<typeof utils.onInit>
        ).mockResolvedValue(undefined)
        ;(utils.checkProductsValidity as jest.Mock).mockReturnValue(true)
        ;(utils.checkAddressValidity as jest.Mock).mockReturnValue(true)
        ;(utils.checkCheckoutValidity as jest.Mock).mockReturnValue(true)
    })

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

    it('Create Order - renders when `isOpen` is `true` and IntegrationContext has value', async () => {
        await act(async () => {
            renderSubject({
                orderModalProps: { ...createOrderProps, isOpen: true },
            })
        })

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /Create draft order/i }),
            ).toBeInTheDocument()
        })
    })

    it('Duplicate Order - renders when `isOpen` is `true` and IntegrationContext has value', async () => {
        await act(async () => {
            renderSubject({
                orderModalProps: { ...duplicateOrderProps, isOpen: true },
            })
        })

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /Create draft order/i }),
            ).toBeInTheDocument()
        })
    })

    it('`Create order` button does not send a create BigCommerce order action when isOpen is false', async () => {
        const bigcommerceCreateOrderSpy = jest.spyOn(
            utils,
            'bigcommerceCreateOrderFromCheckoutCart',
        )

        renderSubject({
            orderModalProps: createOrderProps, // isOpen is false
        })

        // Modal should not be rendered, so no button to click
        expect(bigcommerceCreateOrderSpy).not.toHaveBeenCalled()
    })

    it('`Create order` button sends a create BigCommerce order action when validation passes', async () => {
        const user = userEvent.setup()
        const bigcommerceCreateOrderSpy = jest.spyOn(
            utils,
            'bigcommerceCreateOrderFromCheckoutCart',
        )

        await act(async () => {
            renderSubject({
                orderModalProps: { ...createOrderProps, isOpen: true },
            })
        })

        const createButton = await screen.findByRole('button', {
            name: /Create draft order/i,
        })

        // Wrap the click in act to handle all state updates
        await act(async () => {
            await user.click(createButton)
        })

        await waitFor(() => {
            expect(bigcommerceCreateOrderSpy).toHaveBeenCalled()
        })
    })
})

describe('useCheckout', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

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

        expect(utils.upsertCheckoutConsignment).not.toHaveBeenCalled()
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
        ;(utils.addCheckoutBillingAddress as jest.Mock).mockResolvedValue(
            bigCommerceCheckoutFixture,
        )
        ;(utils.upsertCheckoutConsignment as jest.Mock).mockResolvedValue(
            bigCommerceCheckoutFixture,
        )

        await act(async () => {
            await result.current.onSelectAddress(
                bigCommerceShippingAddressesFixture[0],
                'billing',
                'test2@gorgias.com',
            )
        })

        await waitFor(() => {
            expect(utils.addCheckoutBillingAddress).toHaveBeenCalledWith({
                cart: cartMock,
                integrationId: 188,
                selectedAddress: bigCommerceShippingAddressesFixture[0],
            })

            expect(utils.upsertCheckoutConsignment).toHaveBeenCalledWith({
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
})
