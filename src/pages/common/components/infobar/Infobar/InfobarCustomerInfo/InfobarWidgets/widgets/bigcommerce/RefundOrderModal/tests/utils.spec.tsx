import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import client from 'models/api/resources'
import {
    BigCommerceGeneralErrorMessage,
    BigCommerceOrder,
    BigCommerceRefundableItemType,
    CalculateOrderRefundDataNestedResponse,
    CalculateOrderRefundDataResponse,
    CalculateOrderRefundQuotesDataResponse,
} from 'models/integration/types'
import {bigCommerceAvailablePaymentOptionsDataResponseFixture} from 'fixtures/bigcommerce'
import {
    buildPaymentOptionLabel,
    calculateAvailablePaymentOptionsData,
    calculateOrderRefund,
    calculateTotalOrderAmount,
    isOrderFullyRefunded,
    onReset,
} from '../utils'
import {defaultBigCommerceRefundType} from '../consts'

jest.mock('lodash/debounce', () => (fn: Record<string, unknown>) => {
    fn.cancel = jest.fn()
    return fn
})

jest.useFakeTimers()

describe('utils', () => {
    let apiMock: MockAdapter

    beforeEach(() => {
        jest.resetAllMocks()
        apiMock = new MockAdapter(client)
    })

    afterAll(() => {
        apiMock.restore()
    })

    const integrationId = 1
    const customerId = 1
    const bigcommerceOrder: BigCommerceOrder = {
        id: 123,
        currency_code: 'EUR',
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

    const getBigCommerceAvailablePaymentOptionsDataOkResponse: CalculateOrderRefundQuotesDataResponse =
        bigCommerceAvailablePaymentOptionsDataResponseFixture
    const getBigCommerceAvailablePaymentOptionsDataErrorResponse: CalculateOrderRefundQuotesDataResponse =
        {
            error: {
                data: undefined,
                msg: 'Unexpected error',
            },
        }

    describe('onReset', () => {
        it('should reset Refund Order Modal', () => {
            const setRefundTypeMock = jest.fn()
            const setRefundDataMock = jest.fn()
            const setTotalAmountToRefundMock = jest.fn()
            const setRefundItemsPayloadMock = jest.fn()
            const setAvailablePaymentOptionsDataMock = jest.fn()
            const setSelectedPaymentOptionMock = jest.fn()
            const setRefundReasonMock = jest.fn()
            const setOrderIsCancelledMock = jest.fn()

            onReset({
                setRefundType: setRefundTypeMock,
                setRefundData: setRefundDataMock,
                setTotalAmountToRefund: setTotalAmountToRefundMock,
                setRefundItemsPayload: setRefundItemsPayloadMock,
                setAvailablePaymentOptionsData:
                    setAvailablePaymentOptionsDataMock,
                setSelectedPaymentOption: setSelectedPaymentOptionMock,
                setRefundReason: setRefundReasonMock,
                setOrderIsCancelled: setOrderIsCancelledMock,
            })

            expect(setRefundTypeMock).toHaveBeenCalledWith(
                defaultBigCommerceRefundType
            )
            expect(setRefundDataMock).toHaveBeenCalledWith({
                order: null,
                order_level_refund_data: null,
            })
            expect(setTotalAmountToRefundMock).toHaveBeenCalledWith(0)
            expect(setRefundItemsPayloadMock).toHaveBeenCalledWith(null)
            expect(setAvailablePaymentOptionsDataMock).toHaveBeenCalledWith(
                null
            )
            expect(setSelectedPaymentOptionMock).toHaveBeenCalledWith(null)
            expect(setRefundReasonMock).toHaveBeenCalledWith('')
            expect(setOrderIsCancelledMock).toHaveBeenCalledWith(false)
        })
    })

    describe('calculateOrderRefund', () => {
        it('should init Refund Order Modal', async () => {
            apiMock.onAny().reply(200, getBigCommerceOrderRefundDataOkResponse)

            const setRefundDataMock = jest.fn()
            const setIsLoadingMock = jest.fn()

            await calculateOrderRefund({
                integrationId,
                customerId,
                orderId: bigcommerceOrder.id,
                setRefundData: setRefundDataMock,
                setIsLoading: setIsLoadingMock,
                setErrorMessage: jest.fn(),
            })

            expect(setIsLoadingMock).toHaveBeenCalledWith(false)
            expect(setRefundDataMock).toHaveBeenCalledWith(
                bigcommerceCalculateOrderRefundDataResponse
            )
        })

        it('should handle API error on init Refund Order Modal', async () => {
            apiMock
                .onAny()
                .reply(400, getBigCommerceOrderRefundDataErrorResponse)

            const setRefundDataMock = jest.fn()
            const setIsLoadingMock = jest.fn()
            const setErrorMessageMock = jest.fn()

            await calculateOrderRefund({
                integrationId,
                customerId,
                orderId: bigcommerceOrder.id,
                setRefundData: setRefundDataMock,
                setIsLoading: setIsLoadingMock,
                setErrorMessage: setErrorMessageMock,
            })

            expect(setIsLoadingMock).toHaveBeenCalledWith(false)
            expect(setRefundDataMock).toHaveBeenCalledTimes(0)
            expect(setErrorMessageMock).toHaveBeenCalledWith(
                BigCommerceGeneralErrorMessage.defaultError
            )
        })
    })

    describe('calculateAvailablePaymentOptionsData', () => {
        it('should fetch the available refund methods', async () => {
            apiMock
                .onAny()
                .reply(200, getBigCommerceAvailablePaymentOptionsDataOkResponse)

            const setAvailablePaymentOptionsDataMock = jest.fn()
            const setIsLoadingMock = jest.fn()

            await calculateAvailablePaymentOptionsData({
                integrationId,
                customerId,
                orderId: bigcommerceOrder.id,
                refundItemsPayload: {
                    items: [
                        {
                            item_type: BigCommerceRefundableItemType.order,
                            item_id: bigcommerceOrder.id,
                            amount: 222.33,
                        },
                    ],
                },
                setAvailablePaymentOptionsData:
                    setAvailablePaymentOptionsDataMock,
                setIsLoading: setIsLoadingMock,
                setErrorMessage: jest.fn(),
            })

            expect(setIsLoadingMock).toHaveBeenCalledWith(false)
            expect(setAvailablePaymentOptionsDataMock).toHaveBeenCalledWith(
                getBigCommerceAvailablePaymentOptionsDataOkResponse
            )
        })

        it('should handle API error when fetching the available refund methods', async () => {
            apiMock
                .onAny()
                .reply(
                    400,
                    getBigCommerceAvailablePaymentOptionsDataErrorResponse
                )

            const setAvailablePaymentOptionsDataMock = jest.fn()
            const setIsLoadingMock = jest.fn()
            const setErrorMessageMock = jest.fn()

            await calculateAvailablePaymentOptionsData({
                integrationId,
                customerId,
                orderId: bigcommerceOrder.id,
                refundItemsPayload: {
                    items: [],
                },
                setAvailablePaymentOptionsData:
                    setAvailablePaymentOptionsDataMock,
                setIsLoading: setIsLoadingMock,
                setErrorMessage: setErrorMessageMock,
            })

            expect(setIsLoadingMock).toHaveBeenCalledWith(false)
            expect(setAvailablePaymentOptionsDataMock).toHaveBeenCalledTimes(0)
            expect(setErrorMessageMock).toHaveBeenCalledWith(
                BigCommerceGeneralErrorMessage.defaultError
            )
        })
    })

    describe('calculateTotalOrderAmount', () => {
        it('should calculate the total order amount', () => {
            expect(
                calculateTotalOrderAmount(
                    fromJS({
                        total_inc_tax: '30',
                        store_credit_amount: '20.0000',
                        gift_certificate_amount: '10.00',
                    })
                )
            ).toEqual(60)
        })
    })

    describe('isOrderFullyRefunded', () => {
        it('should check whether an order is fully refunded', () => {
            // fully refunded order
            expect(
                isOrderFullyRefunded(
                    fromJS({
                        total_inc_tax: '30',
                        store_credit_amount: '20.0000',
                        gift_certificate_amount: '10.00',
                        refunded_amount: '60.0000',
                    })
                )
            ).toEqual(true)

            // partially refunded order
            expect(
                isOrderFullyRefunded(
                    fromJS({
                        total_inc_tax: '30',
                        store_credit_amount: '20.0000',
                        gift_certificate_amount: '10.00',
                        refunded_amount: '10.0000',
                    })
                )
            ).toEqual(false)
        })
    })

    describe('buildPaymentOptionLabel', () => {
        it('should build a formatted string component', () => {
            // Single component
            expect(
                buildPaymentOptionLabel(
                    [
                        {
                            provider_id: 'instore',
                            provider_description: 'Pay in Store',
                            amount: 1000000.1,
                            offline: true,
                            offline_provider: true,
                            offline_reason:
                                'This is an offline payment provider.',
                        },
                    ],
                    'EUR'
                )
            ).toMatchSnapshot()

            // Multiple components
            expect(
                buildPaymentOptionLabel(
                    [
                        {
                            provider_id: 'storecredit',
                            provider_description: 'Store Credit',
                            amount: 1000000.1,
                            offline: false,
                            offline_provider: false,
                            offline_reason: '',
                        },
                        {
                            provider_id: 'test',
                            provider_description: 'Test Provider',
                            amount: 2000000.2,
                            offline: false,
                            offline_provider: false,
                            offline_reason: '',
                        },
                    ],
                    'EUR'
                )
            ).toMatchSnapshot()
        })
    })
})
