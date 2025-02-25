import MockAdapter from 'axios-mock-adapter'
import { fromJS, Map as ImmutableMap } from 'immutable'

import {
    bigCommerceAvailablePaymentOptionsDataResponseFixture,
    bigCommerceCalculateOrderRefundDataResponseApiFixture,
    bigCommerceOrderFixture,
} from 'fixtures/bigcommerce'
import client from 'models/api/resources'
import {
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceGeneralErrorMessage,
    BigCommerceOrder,
    BigCommerceOrderProduct,
    BigCommerceRefundableItemType,
    CalculateOrderRefundDataNestedResponse,
    CalculateOrderRefundQuotesDataResponse,
} from 'models/integration/types'
import * as integrationHelpers from 'state/integrations/helpers'

import { BigCommerceRefundActionType } from '../types'
import {
    buildPaymentOptionLabel,
    calculateAvailablePaymentOptionsData,
    calculateGiftWrappingPrice,
    calculateOrderRefund,
    calculateOrderSubtotal,
    calculateOrderTotal,
    calculateProductPrice,
    calculateTotalOrderAmount,
    fetchProductImageURLs,
    isOrderFullyRefunded,
    onReset,
} from '../utils'

const refundItemsPayload = {
    items: [
        // PRODUCT #1 -> $72
        {
            item_id: 10,
            item_type: BigCommerceRefundableItemType.product,
            quantity: 2,
        },
        // PRODUCT #2 -> $21.21
        {
            item_id: 11,
            item_type: BigCommerceRefundableItemType.product,
            quantity: 1,
        },
        // PRODUCT #3 -> $89.98
        {
            item_id: 12,
            item_type: BigCommerceRefundableItemType.product,
            quantity: 2,
        },
        // GIFT WRAPPING #1 -> $18
        {
            item_id: 10,
            item_type: BigCommerceRefundableItemType.gift_wrapping,
            quantity: 2,
        },
        // GIFT WRAPPING #2 -> $36.6
        {
            item_id: 11,
            item_type: BigCommerceRefundableItemType.gift_wrapping,
            quantity: 4,
        },
        // SHIPPING -> $60
        {
            item_id: 400,
            item_type: BigCommerceRefundableItemType.shipping,
            amount: 10,
        },
        {
            item_id: 401,
            item_type: BigCommerceRefundableItemType.shipping,
            amount: 20,
        },
        {
            item_id: 402,
            item_type: BigCommerceRefundableItemType.shipping,
            amount: 30,
        },
        // HANDLING -> $8
        {
            item_id: 500,
            item_type: BigCommerceRefundableItemType.handling,
            amount: 2,
        },
        {
            item_id: 501,
            item_type: BigCommerceRefundableItemType.handling,
            amount: 3,
        },
        {
            item_id: 502,
            item_type: BigCommerceRefundableItemType.handling,
            amount: 3,
        },
    ],
}
const productRefundData = {
    10: {
        initial_quantity: 5,
        refunded_quantity: 3,
        available_quantity: 2,
        product_data: {
            id: 10,
            base_total: '200.0000',
            quantity: 5,
            applied_discounts: [{ amount: '20.00' }],
            base_wrapping_cost: '30.0000',
        } as BigCommerceOrderProduct,
    },
    11: {
        initial_quantity: 7,
        refunded_quantity: 6,
        available_quantity: 1,
        product_data: {
            id: 11,
            base_total: '148.4700',
            quantity: 7,
            applied_discounts: [] as Array<{
                amount: string
            }>,
            base_wrapping_cost: '64.0500',
        } as BigCommerceOrderProduct,
    },
    12: {
        initial_quantity: 4,
        refunded_quantity: 2,
        available_quantity: 2,
        product_data: {
            id: 12,
            base_total: '229.9600',
            quantity: 4,
            applied_discounts: [{ amount: '50.00' }],
            base_wrapping_cost: '0.0000',
        } as BigCommerceOrderProduct,
    },
}
const giftWrappingRefundData = {
    10: {
        initial_quantity: 5,
        refunded_quantity: 2,
        available_quantity: 3,
    },
    11: {
        initial_quantity: 7,
        refunded_quantity: 3,
        available_quantity: 4,
    },
}

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

        jest.spyOn(
            integrationHelpers,
            'fetchIntegrationProducts',
        ).mockReturnValue(
            new Promise((resolve) =>
                resolve([
                    ImmutableMap({
                        id: bigCommerceOrderFixture.bc_products[0].product_id,
                        image_url: 'https://gorgias.io',
                    }),
                ]),
            ),
        )
    })

    afterAll(() => {
        apiMock.restore()
    })

    const integrationId = 1
    const customerId = 1
    const bigcommerceOrder: BigCommerceOrder = {
        id: 123,
        currency_code: 'EUR',
        bc_products: bigCommerceOrderFixture.bc_products,
        bc_shipping: bigCommerceOrderFixture.bc_shipping,
    }
    const bigcommerceCalculateOrderRefundDataApiResponse = {
        order: bigcommerceOrder,
        order_level_refund_data: {
            total_amount: 1234567.89,
            refunded_amount: 4567,
            available_amount: 1230000.89,
        },
        individual_items_level_refund_data:
            bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data,
    }

    const getBigCommerceOrderRefundDataOkResponse = {
        data: bigcommerceCalculateOrderRefundDataApiResponse,
    }
    const getBigCommerceOrderRefundDataErrorResponse: CalculateOrderRefundDataNestedResponse =
        {
            error: {
                data: {
                    order: null,
                    order_level_refund_data: null,
                    individual_items_level_refund_data: null,
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
            const dispatchRefundOrderStateMock = jest.fn()

            onReset({
                dispatchRefundOrderState: dispatchRefundOrderStateMock,
            })

            expect(dispatchRefundOrderStateMock).toHaveBeenCalledWith({
                type: BigCommerceRefundActionType.ResetState,
            })
        })
    })

    describe('calculateOrderRefund', () => {
        it('should init Refund Order Modal', async () => {
            apiMock.onAny().reply(200, getBigCommerceOrderRefundDataOkResponse)

            const dispatchRefundOrderStateMock = jest.fn()
            const setIsLoadingMock = jest.fn()

            await calculateOrderRefund({
                integrationId,
                customerId,
                orderId: bigcommerceOrder.id,
                dispatchRefundOrderState: dispatchRefundOrderStateMock,
                setIsLoading: setIsLoadingMock,
                setErrorMessage: jest.fn(),
            })

            expect(setIsLoadingMock).toHaveBeenCalledWith(false)
            expect(dispatchRefundOrderStateMock).toHaveBeenCalledWith({
                type: BigCommerceRefundActionType.SetInitialRefundData,
                refundData: getBigCommerceOrderRefundDataOkResponse.data,
                productImageURLs: {
                    [bigCommerceOrderFixture.bc_products[0].id]:
                        'https://gorgias.io',
                    [bigCommerceOrderFixture.bc_products[1].id]:
                        'https://gorgias.io',
                },
            })
        })

        it('should handle API error on init Refund Order Modal', async () => {
            apiMock
                .onAny()
                .reply(400, getBigCommerceOrderRefundDataErrorResponse)

            const dispatchRefundOrderStateMock = jest.fn()
            const setIsLoadingMock = jest.fn()
            const setErrorMessageMock = jest.fn()

            await calculateOrderRefund({
                integrationId,
                customerId,
                orderId: bigcommerceOrder.id,
                dispatchRefundOrderState: dispatchRefundOrderStateMock,
                setIsLoading: setIsLoadingMock,
                setErrorMessage: setErrorMessageMock,
            })

            expect(setIsLoadingMock).toHaveBeenCalledWith(false)
            expect(dispatchRefundOrderStateMock).toHaveBeenCalledTimes(0)
            expect(setErrorMessageMock).toHaveBeenCalledWith(
                BigCommerceGeneralErrorMessage.defaultError,
            )
        })
    })

    describe('fetchProductImageURLs', () => {
        it('should fetch image URLs for given products', async () => {
            jest.spyOn(
                integrationHelpers,
                'fetchIntegrationProducts',
            ).mockReturnValue(
                new Promise((resolve) =>
                    resolve([
                        ImmutableMap({
                            id: 1,
                            image_url: 'https://gorgias.io/1',
                        }),
                        ImmutableMap({
                            id: 2,
                            image_url: 'https://gorgias.io/2',
                            variants: [
                                ImmutableMap({
                                    id: 10,
                                    image_url: 'https://gorgias.io/2-10',
                                }),
                            ],
                        }),
                        ImmutableMap({
                            id: 3,
                            image_url: 'https://gorgias.io/3',
                            variants: [
                                ImmutableMap({
                                    id: 10,
                                    image_url: 'https://gorgias.io/3',
                                }),
                            ],
                        }),
                    ]),
                ),
            )

            expect(
                await fetchProductImageURLs({
                    integrationId: 1,
                    productRefundData: {
                        123: {
                            initial_quantity: 3,
                            available_quantity: 2,
                            refunded_quantity: 1,
                            product_data: {
                                product_id: 1,
                            } as BigCommerceOrderProduct,
                        },
                        124: {
                            initial_quantity: 3,
                            available_quantity: 2,
                            refunded_quantity: 1,
                            product_data: {
                                product_id: 2,
                                variant_id: 10,
                            } as BigCommerceOrderProduct,
                        },
                        125: {
                            initial_quantity: 3,
                            available_quantity: 2,
                            refunded_quantity: 1,
                            product_data: {
                                product_id: 3,
                                variant_id: 11,
                            } as BigCommerceOrderProduct,
                        },
                        126: {
                            initial_quantity: 3,
                            available_quantity: 2,
                            refunded_quantity: 1,
                            product_data: {
                                product_id: 4,
                                variant_id: 12,
                            } as BigCommerceOrderProduct,
                        },
                    },
                }),
            ).toEqual({
                // Use main product image, as there are no variants available
                123: 'https://gorgias.io/1',

                // Use variant product image, as image exists for product with (product_id & variant_id)
                124: 'https://gorgias.io/2-10',

                // Use main product image, as image does not exist for product with (product_id & variant_id)
                125: 'https://gorgias.io/3',

                // Product is not fetched from the API
                126: undefined,
            })
        })
    })

    describe('calculateAvailablePaymentOptionsData', () => {
        it('should fetch the available refund methods', async () => {
            apiMock
                .onAny()
                .reply(200, getBigCommerceAvailablePaymentOptionsDataOkResponse)

            const dispatchRefundOrderStateMock = jest.fn()
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
                dispatchRefundOrderState: dispatchRefundOrderStateMock,
                setIsLoading: setIsLoadingMock,
                setErrorMessage: jest.fn(),
            })

            expect(setIsLoadingMock).toHaveBeenCalledWith(false)
            expect(dispatchRefundOrderStateMock).toHaveBeenCalledWith({
                type: BigCommerceRefundActionType.SetAvailablePaymentOptionsData,
                availablePaymentOptionsData:
                    getBigCommerceAvailablePaymentOptionsDataOkResponse,
            })
        })

        it('should handle API error when fetching the available refund methods', async () => {
            apiMock
                .onAny()
                .reply(
                    400,
                    getBigCommerceAvailablePaymentOptionsDataErrorResponse,
                )

            const dispatchRefundOrderStateMock = jest.fn()
            const setIsLoadingMock = jest.fn()
            const setErrorMessageMock = jest.fn()

            await calculateAvailablePaymentOptionsData({
                integrationId,
                customerId,
                orderId: bigcommerceOrder.id,
                refundItemsPayload: {
                    items: [],
                },
                dispatchRefundOrderState: dispatchRefundOrderStateMock,
                setIsLoading: setIsLoadingMock,
                setErrorMessage: setErrorMessageMock,
            })

            expect(setIsLoadingMock).toHaveBeenCalledWith(false)
            expect(dispatchRefundOrderStateMock).toHaveBeenCalledTimes(0)
            expect(setErrorMessageMock).toHaveBeenCalledWith(
                BigCommerceGeneralErrorMessage.defaultError,
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
                    }),
                ),
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
                    }),
                ),
            ).toEqual(true)

            // partially refunded order
            expect(
                isOrderFullyRefunded(
                    fromJS({
                        total_inc_tax: '30',
                        store_credit_amount: '20.0000',
                        gift_certificate_amount: '10.00',
                        refunded_amount: '10.0000',
                    }),
                ),
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
                    'EUR',
                ),
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
                    'EUR',
                ),
            ).toMatchSnapshot()
        })
    })

    describe('calculateProductPrice', () => {
        it('should calculate Product Price after applying discounts', () => {
            expect(
                calculateProductPrice({
                    base_total: '200.0000',
                    quantity: 5,
                    applied_discounts: [{ amount: '20.00' }],
                } as BigCommerceOrderProduct),
            ).toEqual(36)

            expect(
                calculateProductPrice({
                    base_total: '200.0000',
                    quantity: 5,
                    applied_discounts: [] as Array<{ amount: string }>,
                } as BigCommerceOrderProduct),
            ).toEqual(40)
        })
    })

    describe('calculateGiftWrappingPrice', () => {
        it('should calculate Gift Wrapping Price', () => {
            expect(
                calculateGiftWrappingPrice({
                    base_wrapping_cost: '200.0000',
                    quantity: 5,
                } as BigCommerceOrderProduct),
            ).toEqual(40)
        })
    })

    describe('calculateOrderSubtotal', () => {
        it('should calculate Order Subtotal', () => {
            expect(
                calculateOrderSubtotal(
                    refundItemsPayload,
                    productRefundData,
                    giftWrappingRefundData,
                    true,
                ),
            ).toEqual(
                // PRODUCT
                72 +
                    21.21 +
                    89.98 +
                    // GIFT_WRAPPING
                    18 +
                    36.6 +
                    // SHIPPING
                    60 +
                    // HANDLING
                    8,
            )

            expect(
                calculateOrderSubtotal(
                    refundItemsPayload,
                    productRefundData,
                    giftWrappingRefundData,
                    false,
                ),
            ).toEqual(
                // PRODUCT
                72 +
                    21.21 +
                    89.98 +
                    // GIFT_WRAPPING
                    18 +
                    36.6,
            )
        })
    })

    describe('calculateOrderTotal', () => {
        it('should calculate Order Total', () => {
            expect(
                calculateOrderTotal(
                    refundItemsPayload,
                    productRefundData,
                    giftWrappingRefundData,
                    {
                        total_refund_tax_amount: 10.5,
                    } as BigCommerceAvailablePaymentOptionsData,
                ),
            ).toEqual(
                calculateOrderSubtotal(
                    refundItemsPayload,
                    productRefundData,
                    giftWrappingRefundData,
                    true,
                ) + 10.5,
            )

            expect(
                calculateOrderTotal(
                    refundItemsPayload,
                    productRefundData,
                    giftWrappingRefundData,
                    {} as BigCommerceAvailablePaymentOptionsData,
                ),
            ).toEqual(
                calculateOrderSubtotal(
                    refundItemsPayload,
                    productRefundData,
                    giftWrappingRefundData,
                    true,
                ),
            )
        })
    })
})
