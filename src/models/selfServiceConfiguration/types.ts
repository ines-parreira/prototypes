import {List} from 'immutable'

export type SelfServiceConfigurationFilter = {
    key: string
    value: string | string[]
    operator: string
}

export type SelfServiceConfigurationPolicy = {
    enabled: boolean
}

export type SelfServiceConfigurationFilterPolicy = {
    enabled: boolean
    eligibilities: SelfServiceConfigurationFilter[]
    exceptions: SelfServiceConfigurationFilter[]
}

export enum ReportIssueVariable {
    FULFILLMENT_STATUS = 'fulfillment_status',
    SHIPMENT_STATUS = 'shipment_status',
    FINANCIAL_STATUS = 'financial_status',
    ORDER_STATUS = 'order_status',
}

export enum JsonLogicOperator {
    EQUALS = '===',
    IS_ONE_OF = 'in',
}

export type JsonLogicRuleOverVariable<T = ReportIssueVariable> = {
    [JsonLogicOperator.EQUALS]?: [{var: T}, null]
    [JsonLogicOperator.IS_ONE_OF]?: [{var: T}, string[]]
}

export type JsonLogicOrBlock = {
    or: JsonLogicRuleOverVariable[]
}

export type ReportIssueRulesLogic = {
    and: (
        | JsonLogicOrBlock
        | JsonLogicRuleOverVariable<ReportIssueVariable.FINANCIAL_STATUS>
    )[]
}

export type SelfServiceReportIssueCase = {
    title: string
    description: string
    conditions: ReportIssueRulesLogic | Record<string, never>
    reasons: string[]
}

export type SelfServiceConfigurationReportIssuePolicy = {
    enabled: boolean
    cases: SelfServiceReportIssueCase[]
}

export type QuickReplyPolicy = {
    title: string
    deactivated_datetime: string | null
    response_message_content: {
        html: string
        text: string
        attachments: List<any>
    }
    id?: string
}

export type SelfServiceConfiguration = {
    id: number
    type: ShopType
    shop_name: string
    created_datetime: string
    updated_datetime: string
    deactivated_datetime: Maybe<string>
    report_issue_policy: SelfServiceConfigurationReportIssuePolicy
    track_order_policy: SelfServiceConfigurationPolicy
    cancel_order_policy: SelfServiceConfigurationFilterPolicy
    return_order_policy: SelfServiceConfigurationFilterPolicy
    quick_response_policies: QuickReplyPolicy[]
}

export type PolicyKey =
    | 'report_issue_policy'
    | 'track_order_policy'
    | 'cancel_order_policy'
    | 'return_order_policy'

export type ApiListResponse<T> = {
    data: T
}
export type ShopType = 'shopify'

export enum PolicyEnum {
    TRACK_ORDER_POLICY = 'track_order_policy',
    REPORT_ISSUE_POLICY = 'report_issue_policy',
    CANCEL_ORDER_POLICY = 'cancel_order_policy',
    RETURN_ORDER_POLICY = 'return_order_policy',
}

export enum FilterKeyEnum {
    GORGIAS_ORDER_STATUS = 'gorgias_order_status',
    ORDER_CREATED_AT = 'order_created_at',
    ORDER_DELIVERED_AT = 'order_delivered_at',
    TRACKING_NUMBERS = 'tracking_numbers',
}

export enum FilterOperatorEnum {
    EQUALS = 'eq',
    LESS_THAN = 'lt',
    ONE_OF = 'oneOf',
}

export enum SelfServiceOrderStatusEnum {
    UNFULFILLED = 'unfulfilled',
    PENDING_DELIVERY = 'pending_delivery',
    PROCESSING_FULFILLMENT = 'processing_fulfillment',
}

export const ReturnsDropdownOptionsList = [
    {
        value: FilterKeyEnum.ORDER_CREATED_AT,
        label: 'Order created',
    },
    {
        value: FilterKeyEnum.ORDER_DELIVERED_AT,
        label: 'Order delivered',
    },
]

export enum ReportIssueReasons {
    REASON_NOT_HAPPY = 'reasonNotHappy',
    REASON_VERY_HAPPY = 'reasonVeryHappy',
    REASON_RETURN_PRODUCT = 'reasonReturnProduct',
    REASON_REQUEST_REFUND = 'reasonRequestRefund',
    REASON_DID_NOT_RECEIVE_REFUND = 'reasonDidNotReceiveRefund',
    REASON_CANCEL_ORDER = 'reasonCancelOrder',
    REASON_EDIT_ORDER = 'reasonEditOrder',
    REASON_REORDER_ITEMS = 'reasonReorderItems',
    REASON_ORDER_DAMAGED = 'reasonOrderDamaged',
    REASON_ORDER_DEFECTIVE = 'reasonOrderDefective',
    REASON_INCORRECT_ITEMS = 'reasonIncorrectItems',
    REASON_ITEMS_MISSING = 'reasonItemsMissing',
    REASON_DISCOUNT_NOT_WORKING = 'reasonDiscountNotWorking',
    REASON_REQUEST_DISCOUNT = 'reasonRequestDiscount',
    REASON_FORGOT_TO_USE_DISCOUNT = 'reasonForgotToUseDiscount',
    REASON_EXCHANGE_REQUEST = 'reasonExchangeRequest',
    REASON_REPLACE_ITEMS_REQUEST = 'reasonReplaceItemsRequest',
    REASON_ORDER_STILL_NOT_SHIPPED = 'reasonOrderStillNotShipped',
    REASON_WHERE_IS_MY_ORDER = 'reasonWhereIsMyOrder',
    REASON_CHANGE_SHIPPING_ADDRESS = 'reasonChangeShippingAddress',
    REASON_CHANGE_DELIVERY_DATE = 'reasonChangeDeliveryDate',
    REASON_ORDER_STUCK_IN_TRANSIT = 'reasonOrderStuckInTransit',
    REASON_PAST_EXPECTED_DELIVERY_DATE = 'reasonPastExpectedDeliveryDate',
    REASON_CANCEL_SUBSCRIPTION = 'reasonCancelSubscription',
    REASON_EDIT_SUBSCRIPTION = 'reasonEditSubscription',
    REASON_OTHER = 'reasonOther',
}

export enum FinancialStatuses {
    PENDING = 'pending',
    AUTHORIZED = 'authorized',
    PARTIALLY_PAID = 'partially_paid',
    PAID = 'paid',
    PARTIALLY_REFUNDED = 'partially_refunded',
    REFUNDED = 'refunded',
    VOIDED = 'voided',
}

export enum FulfillmentStatuses {
    PENDING = 'pending',
    OPEN = 'open',
    SUCCESS = 'success',
    CANCELLED = 'cancelled',
    ERROR = 'error',
    FAILURE = 'failure',
}

export enum ShipmentStatuses {
    LABEL_PRINTED = 'label_printed',
    LABEL_PURCHASED = 'label_purchased',
    ATTEMPTED_DELIVERY = 'attempted_delivery',
    READY_FOR_PICKUP = 'ready_for_pickup',
    CONFIRMED = 'confirmed',
    IN_TRANSIT = 'in_transit',
    OUT_FOR_DELIVERY = 'out_for_delivery',
    DELIVERED = 'delivered',
    FAILURE = 'failure',
}

export enum OrderStatuses {
    OPEN = 'open',
    ARCHIVED = 'archived',
    CANCELLED = 'cancelled',
}
