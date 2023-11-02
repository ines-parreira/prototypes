import {
    BigCommerceRefundItemsPayloadComponent,
    CalculateOrderRefundDataResponse,
    HandlingItemRefundData,
    ShippingItemRefundData,
    BigCommerceRefundType,
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceRefundMethod,
} from 'models/integration/types'

export enum BigCommerceRefundActionType {
    ResetState = 'RESET_STATE',
    ResetRefundMethodState = 'RESET_REFUND_METHOD_STATE',
    SetInitialRefundData = 'SET_INITIAL_REFUND_DATA',
    SetRefundType = 'SET_REFUND_TYPE',
    SetTotalAmountToRefund = 'SET_TOTAL_AMOUNT_TO_REFUND',
    SetAvailablePaymentOptionsData = 'SET_AVAILABLE_PAYMENT_OPTIONS_DATA',
    SetSelectedPaymentOption = 'SET_SELECTED_PAYMENT_OPTION',
    SetRefundReason = 'SET_REFUND_REASON',
    SetNewOrderStatus = 'SET_NEW_ORDER_STATUS',
    SetRefundItemsPayloadEmptyList = 'SET_REFUND_ITEMS_PAYLOAD_EMPTY_LIST',
    ManualAmount = 'MANUAL_AMOUNT',
    EntireOrder = 'ENTIRE_ORDER',
    EntireOrderAddShipping = 'ENTIRE_ORDER_ADD_SHIPPING',
    EntireOrderAddHandling = 'ENTIRE_ORDER_ADD_HANDLING',
}

export type BIGCOMMERCE_REFUND_ACTION_TYPE =
    | {
          type: BigCommerceRefundActionType.ResetState
      }
    | {
          type: BigCommerceRefundActionType.ResetRefundMethodState
      }
    | {
          type: BigCommerceRefundActionType.SetInitialRefundData
          refundData: CalculateOrderRefundDataResponse
          productImageURLs: Record<string, Maybe<string>>
      }
    | {
          type: BigCommerceRefundActionType.SetRefundType
          refundType: BigCommerceRefundType
      }
    | {
          type: BigCommerceRefundActionType.SetTotalAmountToRefund
          totalAmountToRefund: number
      }
    | {
          type: BigCommerceRefundActionType.SetAvailablePaymentOptionsData
          availablePaymentOptionsData: Maybe<BigCommerceAvailablePaymentOptionsData>
      }
    | {
          type: BigCommerceRefundActionType.SetSelectedPaymentOption
          selectedPaymentOption: Maybe<BigCommerceRefundMethod>
      }
    | {
          type: BigCommerceRefundActionType.SetRefundReason
          refundReason: string
      }
    | {
          type: BigCommerceRefundActionType.SetNewOrderStatus
          newOrderStatus: Maybe<string>
      }
    | {
          type: BigCommerceRefundActionType.SetRefundItemsPayloadEmptyList
      }
    | {
          type: BigCommerceRefundActionType.ManualAmount
          refundOrderItemPayload: BigCommerceRefundItemsPayloadComponent
      }
    | {
          type: BigCommerceRefundActionType.EntireOrder
          refundData: CalculateOrderRefundDataResponse
      }
    | {
          type: BigCommerceRefundActionType.EntireOrderAddShipping
          shippingRefundData: Record<string, ShippingItemRefundData>
          isShippingCostRefunded: boolean
      }
    | {
          type: BigCommerceRefundActionType.EntireOrderAddHandling
          handlingRefundData: Record<string, HandlingItemRefundData>
          isHandlingFeeRefunded: boolean
      }
