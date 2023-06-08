import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import userEvent from '@testing-library/user-event'
import {
    BigCommerceActionType,
    BigCommerceGeneralErrorMessage,
    BigCommerceOrder,
    BigCommerceRefundableItemType,
    BigCommerceRefundType,
    CalculateOrderRefundDataNestedResponse,
    CalculateOrderRefundDataResponse,
} from 'models/integration/types'
import {integrationsState} from 'fixtures/integrations'
import {
    IntegrationContext,
    IntegrationContextType,
} from 'providers/infobar/IntegrationContext'
import {
    CustomerContext,
    CustomerContextType,
} from 'providers/infobar/CustomerContext'
import {
    bigCommerceAvailablePaymentOptionsDataResponseFixture,
    bigCommerceIntegrationFixture,
} from 'fixtures/bigcommerce'
import client from 'models/api/resources'
import * as bigcommerceApi from 'models/integration/resources/bigcommerce'
import RefundOrderModalRenderWrapper, {
    RefundOrderModal,
} from '../RefundOrderModal'
import * as utils from '../utils'

const defaultState = {
    integrations: fromJS(integrationsState),
}
const mockStore = configureMockStore([thunk])
const store = mockStore(defaultState)

const bigcommerceOrder: BigCommerceOrder = {
    id: 123,
    currency_code: 'EUR',
}
const bigcommerceOrderLevelRefundData = {
    total_amount: 1234567.89,
    refunded_amount: 4567,
    available_amount: 1230000.89,
}

jest.useFakeTimers()

describe('RefundOrderModal', () => {
    let apiMock: MockAdapter

    beforeEach(() => {
        jest.resetAllMocks()
        apiMock = new MockAdapter(client)
    })

    afterAll(() => {
        apiMock.restore()
    })

    const refundOrderProps: ComponentProps<typeof RefundOrderModal> = {
        isOpen: true,
        data: {
            actionName: BigCommerceActionType.RefundOrder,
            order: fromJS(bigcommerceOrder),
        },
        integration: bigCommerceIntegrationFixture(),
        customerId: 44,
        onClose: jest.fn(),
    }

    const bigcommerceCalculateOrderRefundDataResponse: CalculateOrderRefundDataResponse =
        {
            order: bigcommerceOrder,
            order_level_refund_data: {
                total_amount: 1234567.89,
                refunded_amount: 4567,
                available_amount: 1230000.89,
            },
        }
    const getBigCommerceOrderRefundDataOkResponse: CalculateOrderRefundDataNestedResponse =
        {
            data: bigcommerceCalculateOrderRefundDataResponse,
        }
    const getBigCommerceOrderRefundDataErrorResponse: CalculateOrderRefundDataNestedResponse =
        {
            error: {
                data: {
                    order: null,
                    order_level_refund_data: null,
                },
            },
        }

    it('should render Refund Order - OK', async () => {
        apiMock.onAny().reply(200, getBigCommerceOrderRefundDataOkResponse)

        const {baseElement} = render(
            <>
                <Provider store={store}>
                    <RefundOrderModal {...refundOrderProps} />
                </Provider>
            </>
        )

        await screen.findByText('Refund €0.00')

        expect(baseElement).toMatchSnapshot()
    })

    it('should render Refund Order - ERROR popup', async () => {
        apiMock.onAny().reply(400, getBigCommerceOrderRefundDataErrorResponse)

        const {baseElement} = render(
            <>
                <Provider store={store}>
                    <RefundOrderModal {...refundOrderProps} />
                </Provider>
            </>
        )

        await screen.findByText(BigCommerceGeneralErrorMessage.defaultError)

        expect(baseElement).toMatchSnapshot()
    })

    it('should render Refund Order - Too Many Requests ERROR popup', async () => {
        apiMock.onAny().reply(429, getBigCommerceOrderRefundDataErrorResponse)

        const {baseElement} = render(
            <>
                <Provider store={store}>
                    <RefundOrderModal {...refundOrderProps} />
                </Provider>
            </>
        )

        await screen.findByText(
            BigCommerceGeneralErrorMessage.rateLimitingError
        )

        expect(baseElement).toMatchSnapshot()
    })
})

describe('RefundOrderModalConnected', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    const defaultCustomerContextValue = {
        customerId: 44,
    }
    const defaultIntegrationContextValue = {
        integration: fromJS({}),
        integrationId: 515,
    }

    const refundOrderProps: ComponentProps<
        typeof RefundOrderModalRenderWrapper
    > = {
        data: {
            actionName: BigCommerceActionType.RefundOrder,
            order: fromJS(bigcommerceOrder),
        },
        isOpen: false,
        onClose: jest.fn(),
    }

    const renderSubject = ({
        customerContextValue = defaultCustomerContextValue,
        integrationContextValue = defaultIntegrationContextValue,
        refundOrderModalProps = refundOrderProps,
    }: {
        customerContextValue?: CustomerContextType
        integrationContextValue?: IntegrationContextType
        refundOrderModalProps?: ComponentProps<
            typeof RefundOrderModalRenderWrapper
        >
    }) => {
        return render(
            <Provider store={store}>
                <CustomerContext.Provider value={customerContextValue}>
                    <IntegrationContext.Provider
                        value={integrationContextValue}
                    >
                        <RefundOrderModalRenderWrapper
                            {...refundOrderModalProps}
                        />
                    </IntegrationContext.Provider>
                </CustomerContext.Provider>
            </Provider>
        )
    }

    it('Refund Order - renders null when `isOpen` is false', () => {
        const {container} = renderSubject({})
        expect(container.firstChild).toBe(null)
    })

    it('Refund Order - renders null when IntegrationContext has no integrationId', () => {
        const {container} = renderSubject({
            integrationContextValue: {
                integrationId: null,
                integration: fromJS({}),
            },
        })
        expect(container.firstChild).toBe(null)
    })

    it('Refund Order - renders null when CustomerContext has no customerId', () => {
        const {container} = renderSubject({
            customerContextValue: {
                customerId: null,
            },
        })
        expect(container.firstChild).toBe(null)
    })

    it('Refund Order - renders when `isOpen` is `true`, IntegrationContext & CustomerContext have values', () => {
        refundOrderProps.isOpen = true
        renderSubject({
            refundOrderModalProps: refundOrderProps,
        })
        expect(screen.getByText(/Refund order #123/i)).toBeTruthy()
    })

    it('`Refund` button does not send a refund BigCommerce order action when data is incomplete', () => {
        const bigcommerceRefundOrderSpy = jest.spyOn(
            utils,
            'bigcommerceRefundOrder'
        )

        refundOrderProps.isOpen = true
        renderSubject({
            refundOrderModalProps: refundOrderProps,
        })

        screen.getByRole('button', {name: /Refund/i}).click()

        expect(bigcommerceRefundOrderSpy).toHaveBeenCalledTimes(0)
    })

    it('Custom amount - `Refund` button sends a refund BigCommerce order action', async () => {
        const getBigCommerceOrderRefundDataSpy = jest
            .spyOn(bigcommerceApi, 'getBigCommerceOrderRefundData')
            .mockReturnValue(
                new Promise((resolve) =>
                    resolve({
                        order: bigcommerceOrder,
                        order_level_refund_data:
                            bigcommerceOrderLevelRefundData,
                    })
                )
            )
        const getBigCommerceAvailablePaymentOptionsDataSpy = jest
            .spyOn(bigcommerceApi, 'getBigCommerceAvailablePaymentOptionsData')
            .mockReturnValue(
                new Promise((resolve) =>
                    resolve(
                        bigCommerceAvailablePaymentOptionsDataResponseFixture
                    )
                )
            )
        const bigcommerceRefundOrderSpy = jest
            .spyOn(utils, 'bigcommerceRefundOrder')
            .mockReturnValue()
        const onResetSpy = jest.spyOn(utils, 'onReset').mockReturnValue()

        refundOrderProps.isOpen = true
        renderSubject({
            refundOrderModalProps: refundOrderProps,
        })
        act(() => jest.runAllTimers())

        // Initialize the modal => available amount for refund is displayed
        expect(getBigCommerceOrderRefundDataSpy).toHaveBeenCalledTimes(1)

        // Select an amount to refund
        await waitFor(() => {
            expect(
                screen.getByText(
                    new RegExp(
                        `Available for refund: ${utils.formatAmount(
                            bigcommerceOrder.currency_code,
                            bigcommerceOrderLevelRefundData.available_amount
                        )}`
                    )
                )
            ).toBeInTheDocument()
        })

        const amountToRefund = 10
        fireEvent.change(screen.getByRole('spinbutton'), {
            target: {value: amountToRefund},
        })
        act(() => jest.runAllTimers())

        expect(
            getBigCommerceAvailablePaymentOptionsDataSpy
        ).toHaveBeenCalledTimes(1)

        // Select a refund method
        await waitFor(() => {
            expect(screen.getByText(/Store Credit/)).toBeInTheDocument()
        })
        userEvent.click(screen.getAllByRole('checkbox')[1])

        // Select a reason for refund
        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: 'Refunded from Gorgias'},
        })
        act(() => jest.runAllTimers())

        // Select new order status
        const newOrderStatus = 'Partially Shipped'

        userEvent.click(screen.getByRole('listbox'))
        userEvent.click(screen.getByRole('option', {name: /Partially Shipped/}))

        // Refund order
        screen
            .getByRole('button', {
                name: new RegExp(
                    `Refund ${utils.formatAmount(
                        bigcommerceOrder.currency_code,
                        bigCommerceAvailablePaymentOptionsDataResponseFixture.total_refund_amount
                    )}`,
                    'i'
                ),
            })
            .click()

        expect(bigcommerceRefundOrderSpy).toHaveBeenCalledTimes(1)
        expect(bigcommerceRefundOrderSpy).toHaveBeenCalledWith(
            BigCommerceActionType.RefundOrder,
            expect.any(Function),
            integrationsState.integrations.find(
                (integration) => integration.type === 'bigcommerce'
            ),
            defaultCustomerContextValue.customerId.toString(),
            bigcommerceOrder.id,
            BigCommerceRefundType.CustomAmount,
            {
                items: [
                    {
                        amount: amountToRefund,
                        item_id: bigcommerceOrder.id,
                        item_type: BigCommerceRefundableItemType.order,
                    },
                ],
            },
            bigCommerceAvailablePaymentOptionsDataResponseFixture
                .refund_methods[1],
            'Refunded from Gorgias',
            newOrderStatus
        )
        expect(onResetSpy).toHaveBeenCalledTimes(1)
    })
})
