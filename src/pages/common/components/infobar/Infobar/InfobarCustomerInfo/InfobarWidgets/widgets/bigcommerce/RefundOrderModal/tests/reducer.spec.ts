import {
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceOrder,
    BigCommerceRefundableItemType,
    BigCommerceRefundOrderState,
    BigCommerceRefundType,
    CalculateOrderRefundDataResponse,
} from 'models/integration/types'
import {
    bigCommerceCalculateOrderRefundDataResponseApiFixture,
    bigCommerceOrderFixture,
} from 'fixtures/bigcommerce'
import {
    bigcommerceRefundOrderReducer,
    initialBigCommerceRefundOrderState,
} from '../reducer'
import {BigCommerceRefundActionType} from '../types'

const availablePaymentOptions: BigCommerceAvailablePaymentOptionsData = {
    total_refund_amount: 12345678.9,
    total_refund_tax_amount: 0.9,
    rounding: 0,
    adjustment: 0,
    is_tax_included: true,
    order_level_refund_amount: 0,
    refund_methods: [
        [
            {
                provider_id: 'storecredit',
                provider_description: 'Store Credit',
                amount: 12345678.9,
                offline: false,
                offline_provider: false,
                offline_reason: '',
            },
        ],
        [
            {
                provider_id: 'test',
                provider_description: 'Test Provider',
                amount: 12345678.9,
                offline: false,
                offline_provider: false,
                offline_reason: '',
            },
        ],
    ],
}

const bigcommerceOrder: BigCommerceOrder = {
    id: 123,
    currency_code: 'EUR',
    bc_products: bigCommerceOrderFixture.bc_products,
    bc_shipping: bigCommerceOrderFixture.bc_shipping,
}

const refundData: CalculateOrderRefundDataResponse = {
    order: bigcommerceOrder,
    order_level_refund_data: {
        total_amount: 1234567.89,
        refunded_amount: 4567,
        available_amount: 1230000.89,
    },
    individual_items_level_refund_data:
        bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data,
}

const productImageURLs: Record<string, string> = {
    [bigCommerceOrderFixture.bc_products[0].id]: 'https://gorgias.io',
    [bigCommerceOrderFixture.bc_products[1].id]: 'https://gorgias.io',
}

describe('bigcommerceRefundOrderReducer', () => {
    describe('RESET_STATE', () => {
        it('should reset state to initial BigCommerce refund order state', () => {
            const newState = bigcommerceRefundOrderReducer(
                initialBigCommerceRefundOrderState,
                {type: BigCommerceRefundActionType.ResetState}
            )
            expect(newState).toEqual(initialBigCommerceRefundOrderState)
        })
    })

    describe('RESET_REFUND_METHOD_STATE', () => {
        it('should reset part of the state to initial BigCommerce refund order state', () => {
            const state: BigCommerceRefundOrderState = {
                ...initialBigCommerceRefundOrderState,
                refundItemsPayload: {items: []},
                totalAmountToRefund: 10,
                availablePaymentOptionsData: availablePaymentOptions,
                selectedPaymentOption:
                    availablePaymentOptions.refund_methods[0],
            }
            const newState = bigcommerceRefundOrderReducer(state, {
                type: BigCommerceRefundActionType.ResetRefundMethodState,
            })
            expect(newState).toEqual({
                ...state,
                refundItemsPayload: null,
                totalAmountToRefund: 0,
                availablePaymentOptionsData: null,
                selectedPaymentOption: null,
            })
        })
    })

    describe('SET_INITIAL_REFUND_DATA', () => {
        it('should initialize state with refund data', () => {
            const state: BigCommerceRefundOrderState = {
                ...initialBigCommerceRefundOrderState,
                refundItemsPayload: {items: []},
                totalAmountToRefund: 10,
                availablePaymentOptionsData: availablePaymentOptions,
                selectedPaymentOption:
                    availablePaymentOptions.refund_methods[0],
            }
            const newState = bigcommerceRefundOrderReducer(state, {
                type: BigCommerceRefundActionType.SetInitialRefundData,
                refundData: refundData,
                productImageURLs: productImageURLs,
            })
            expect(newState).toEqual({
                ...state,
                refundData,
                productImageURLs,
            })
        })
    })

    describe('SET_REFUND_TYPE', () => {
        it('should set refundType from state with another value', () => {
            const refundType = BigCommerceRefundType.ManualAmount
            const newState = bigcommerceRefundOrderReducer(
                initialBigCommerceRefundOrderState,
                {
                    type: BigCommerceRefundActionType.SetRefundType,
                    refundType: refundType,
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                refundType,
            })
        })
    })

    describe('SET_TOTAL_AMOUNT_TO_REFUND', () => {
        it('should set totalAmountToRefund from state with another value', () => {
            const totalAmountToRefund = 100.9
            const newState = bigcommerceRefundOrderReducer(
                initialBigCommerceRefundOrderState,
                {
                    type: BigCommerceRefundActionType.SetTotalAmountToRefund,
                    totalAmountToRefund: totalAmountToRefund,
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                totalAmountToRefund,
            })
        })
    })

    describe('SET_AVAILABLE_PAYMENT_OPTIONS_DATA', () => {
        it('should set availablePaymentOptionsData from state with another value', () => {
            const newState = bigcommerceRefundOrderReducer(
                initialBigCommerceRefundOrderState,
                {
                    type: BigCommerceRefundActionType.SetAvailablePaymentOptionsData,
                    availablePaymentOptionsData: availablePaymentOptions,
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                availablePaymentOptionsData: availablePaymentOptions,
            })
        })
    })

    describe('SET_SELECTED_PAYMENT_OPTION', () => {
        it('should set selectedPaymentOption from state with another value', () => {
            const newState = bigcommerceRefundOrderReducer(
                initialBigCommerceRefundOrderState,
                {
                    type: BigCommerceRefundActionType.SetSelectedPaymentOption,
                    selectedPaymentOption:
                        availablePaymentOptions.refund_methods[0],
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                selectedPaymentOption:
                    availablePaymentOptions.refund_methods[0],
            })
        })
    })

    describe('SET_REFUND_REASON', () => {
        it('should set refundReason from state with another value', () => {
            const newState = bigcommerceRefundOrderReducer(
                initialBigCommerceRefundOrderState,
                {
                    type: BigCommerceRefundActionType.SetRefundReason,
                    refundReason: 'test',
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                refundReason: 'test',
            })
        })
    })

    describe('SET_NEW_ORDER_STATUS', () => {
        it('should set newOrderStatus from state with another value', () => {
            const newState = bigcommerceRefundOrderReducer(
                initialBigCommerceRefundOrderState,
                {
                    type: BigCommerceRefundActionType.SetNewOrderStatus,
                    newOrderStatus: 'Pending',
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                newOrderStatus: 'Pending',
            })
        })
    })

    describe('SET_REFUND_ITEMS_PAYLOAD_EMPTY_LIST', () => {
        it('should set refundItemsPayload from state with an empty items list', () => {
            const newState = bigcommerceRefundOrderReducer(
                {
                    ...initialBigCommerceRefundOrderState,
                    refundItemsPayload: {
                        items: [
                            {
                                item_id: 1,
                                item_type: BigCommerceRefundableItemType.order,
                                amount: 10,
                            },
                        ],
                    },
                },
                {
                    type: BigCommerceRefundActionType.SetRefundItemsPayloadEmptyList,
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                refundItemsPayload: {items: []},
            })
        })
    })

    describe('MANUAL_AMOUNT', () => {
        it('should set current state with an one `ORDER` item list', () => {
            const orderId = 1
            const amountToRefund = 100.7

            const newState = bigcommerceRefundOrderReducer(
                initialBigCommerceRefundOrderState,
                {
                    type: BigCommerceRefundActionType.ManualAmount,
                    refundOrderItemPayload: {
                        item_type: BigCommerceRefundableItemType.order,
                        item_id: orderId,
                        amount: amountToRefund,
                    },
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                refundItemsPayload: {
                    items: [
                        {
                            item_type: BigCommerceRefundableItemType.order,
                            item_id: orderId,
                            amount: amountToRefund,
                        },
                    ],
                },
            })
        })
    })

    describe('ENTIRE_ORDER', () => {
        it('should set refundItemsPayload from state based on refundData items', () => {
            const newState = bigcommerceRefundOrderReducer(
                initialBigCommerceRefundOrderState,
                {
                    type: BigCommerceRefundActionType.EntireOrder,
                    refundData,
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                refundItemsPayload: {
                    items: [
                        {
                            item_type: BigCommerceRefundableItemType.product,
                            item_id: bigcommerceOrder.bc_products[0].id,
                            quantity:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .PRODUCT[
                                    String(bigcommerceOrder.bc_products[0].id)
                                ].available_quantity,
                        },
                        // Product with ID = 2259793 is missing because it's already fully refunded
                        {
                            item_type:
                                BigCommerceRefundableItemType.gift_wrapping,
                            item_id: bigcommerceOrder.bc_products[0].id,
                            quantity:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .GIFT_WRAPPING[
                                    String(bigcommerceOrder.bc_products[0].id)
                                ].available_quantity,
                        },
                    ],
                },
            })
        })
    })

    describe('ENTIRE_ORDER_ADD_SHIPPING', () => {
        it('should add SHIPPING items to refundItemsPayload', () => {
            const newState = bigcommerceRefundOrderReducer(
                {
                    ...initialBigCommerceRefundOrderState,
                    refundItemsPayload: {items: []},
                },
                {
                    type: BigCommerceRefundActionType.EntireOrderAddShipping,
                    isShippingCostRefunded: true,
                    shippingRefundData: {
                        [String(bigcommerceOrder.bc_shipping[0].id)]: {
                            initial_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .SHIPPING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].available_amount,
                            refunded_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .SHIPPING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].refunded_amount,

                            available_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .SHIPPING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].available_amount,

                            shipping_data: bigcommerceOrder.bc_shipping[0],
                        },
                    },
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                refundItemsPayload: {
                    items: [
                        {
                            item_type: BigCommerceRefundableItemType.shipping,
                            item_id: bigcommerceOrder.bc_shipping[0].id,
                            amount: bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                .SHIPPING[
                                String(bigcommerceOrder.bc_shipping[0].id)
                            ].available_amount,
                        },
                    ],
                },
            })
        })

        it('should remove SHIPPING items to refundItemsPayload', () => {
            const newState = bigcommerceRefundOrderReducer(
                {
                    ...initialBigCommerceRefundOrderState,
                    refundItemsPayload: {
                        items: [
                            {
                                item_type:
                                    BigCommerceRefundableItemType.shipping,
                                item_id: bigcommerceOrder.bc_shipping[0].id,
                                amount: bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .SHIPPING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].available_amount,
                            },
                        ],
                    },
                },
                {
                    type: BigCommerceRefundActionType.EntireOrderAddShipping,
                    isShippingCostRefunded: false,
                    shippingRefundData: {
                        [String(bigcommerceOrder.bc_shipping[0].id)]: {
                            initial_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .SHIPPING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].available_amount,
                            refunded_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .SHIPPING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].refunded_amount,

                            available_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .SHIPPING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].available_amount,

                            shipping_data: bigcommerceOrder.bc_shipping[0],
                        },
                    },
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                refundItemsPayload: {
                    items: [],
                },
            })
        })
    })

    describe('ENTIRE_ORDER_ADD_HANDLING', () => {
        it('should add HANDLING items to refundItemsPayload', () => {
            const newState = bigcommerceRefundOrderReducer(
                {
                    ...initialBigCommerceRefundOrderState,
                    refundItemsPayload: {items: []},
                },
                {
                    type: BigCommerceRefundActionType.EntireOrderAddHandling,
                    isHandlingFeeRefunded: true,
                    handlingRefundData: {
                        [String(bigcommerceOrder.bc_shipping[0].id)]: {
                            initial_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .HANDLING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].available_amount,
                            refunded_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .HANDLING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].refunded_amount,

                            available_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .HANDLING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].available_amount,
                        },
                    },
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                refundItemsPayload: {
                    items: [
                        {
                            item_type: BigCommerceRefundableItemType.handling,
                            item_id: bigcommerceOrder.bc_shipping[0].id,
                            amount: bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                .HANDLING[
                                String(bigcommerceOrder.bc_shipping[0].id)
                            ].available_amount,
                        },
                    ],
                },
            })
        })

        it('should remove HANDLING items to refundItemsPayload', () => {
            const newState = bigcommerceRefundOrderReducer(
                {
                    ...initialBigCommerceRefundOrderState,
                    refundItemsPayload: {
                        items: [
                            {
                                item_type:
                                    BigCommerceRefundableItemType.handling,
                                item_id: bigcommerceOrder.bc_shipping[0].id,
                                amount: bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .HANDLING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].available_amount,
                            },
                        ],
                    },
                },
                {
                    type: BigCommerceRefundActionType.EntireOrderAddHandling,
                    isHandlingFeeRefunded: false,
                    handlingRefundData: {
                        [String(bigcommerceOrder.bc_shipping[0].id)]: {
                            initial_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .HANDLING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].available_amount,
                            refunded_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .HANDLING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].refunded_amount,

                            available_amount:
                                bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data!
                                    .HANDLING[
                                    String(bigcommerceOrder.bc_shipping[0].id)
                                ].available_amount,
                        },
                    },
                }
            )
            expect(newState).toEqual({
                ...initialBigCommerceRefundOrderState,
                refundItemsPayload: {
                    items: [],
                },
            })
        })
    })
})
