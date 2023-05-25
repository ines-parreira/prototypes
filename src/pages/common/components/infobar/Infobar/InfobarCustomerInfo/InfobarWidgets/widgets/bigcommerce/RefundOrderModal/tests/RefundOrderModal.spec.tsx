import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import {
    BigCommerceActionType,
    BigCommerceGeneralErrorMessage,
    BigCommerceOrder,
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
import {bigCommerceIntegrationFixture} from 'fixtures/bigcommerce'
import client from 'models/api/resources'
import RefundOrderModalRenderWrapper, {
    RefundOrderModal,
} from '../RefundOrderModal'

const defaultState = {
    integrations: fromJS(integrationsState),
}
const mockStore = configureMockStore([thunk])
const store = mockStore(defaultState)

const bigcommerceOrder: BigCommerceOrder = {
    id: 123,
    currency_code: 'EUR',
}

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
})
