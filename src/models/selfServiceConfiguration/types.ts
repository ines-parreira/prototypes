import {IntegrationType} from 'models/integration/constants'

export type SelfServiceConfigurationFilter = {
    key: string
    value: string | string[]
    operator: string
}

export type SelfServiceConfigurationPolicy = {
    enabled: boolean
}

export const AUTOMATED_RESPONSE = 'automated_response'

export enum ReturnActionType {
    LoopReturns = 'loop_returns',
    AutomatedResponse = 'automated_response',
}

export type LoopReturnsReturnAction = {
    type: ReturnActionType.LoopReturns
    integrationId: number
}

export type AutomatedResponseReturnAction = {
    type: ReturnActionType.AutomatedResponse
    responseMessageContent: ResponseMessageContent
}

export type ReturnAction =
    | LoopReturnsReturnAction
    | AutomatedResponseReturnAction

export type ResponseMessageContent = {
    html: string
    text: string
}

export type SelfServiceConfigurationFilterPolicy = {
    enabled: boolean
    eligibilities: SelfServiceConfigurationFilter[]
    exceptions: SelfServiceConfigurationFilter[]
}

export type SelfServiceConfigurationReturnOrderPolicy =
    SelfServiceConfigurationFilterPolicy & {
        action?: ReturnAction | null
    }

export type SelfServiceConfigurationTrackOrderPolicy =
    SelfServiceConfigurationPolicy & {
        unfulfilledMessage?: ResponseMessageContent
    }

export type SelfServiceConfigurationCancelOrderPolicy =
    SelfServiceConfigurationFilterPolicy & {
        action?: {
            type: typeof AUTOMATED_RESPONSE
            responseMessageContent: ResponseMessageContent
        }
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

export type ReportIssueCaseReasonAction = {
    type: typeof AUTOMATED_RESPONSE
    responseMessageContent: ResponseMessageContent
    showHelpfulPrompt: boolean
}

export type ReportIssueCaseReason = {
    reasonKey: string
    action?: ReportIssueCaseReasonAction
}

export type SelfServiceReportIssueCase = {
    title: string
    description: string
    conditions: ReportIssueRulesLogic | Record<string, never>
    newReasons: ReportIssueCaseReason[]
}

// GET configuration handler returns the legacy string array reasons fields, and the new newReasons field
// PUT configuration handler accepts only reasons (string[] or ReportIssueCaseReason[])
export type SelfServiceReportIssueCase_DEPRECATED = Omit<
    SelfServiceReportIssueCase,
    'reasons'
> & {
    reasons: string[]
    newReasons?: ReportIssueCaseReason[]
}

export type SelfServiceConfigurationReportIssuePolicy = {
    enabled: boolean
    cases: SelfServiceReportIssueCase[]
}

export type SelfServiceConfiguration = {
    id: number
    type: ShopType
    shopName: string
    createdDatetime: string
    updatedDatetime: string
    deactivatedDatetime: Maybe<string>
    reportIssuePolicy: SelfServiceConfigurationReportIssuePolicy
    trackOrderPolicy: SelfServiceConfigurationTrackOrderPolicy
    cancelOrderPolicy: SelfServiceConfigurationCancelOrderPolicy
    returnOrderPolicy: SelfServiceConfigurationReturnOrderPolicy
    articleRecommendationHelpCenterId: Maybe<number>
    workflowsEntrypoints?: Maybe<{workflow_id: string}[]>
}

export type PolicyKey =
    | 'trackOrderPolicy'
    | 'reportIssuePolicy'
    | 'cancelOrderPolicy'
    | 'returnOrderPolicy'

export type ApiListResponse<T> = {
    data: T
}
export type ShopType =
    | IntegrationType.Shopify
    | IntegrationType.Magento2
    | IntegrationType.BigCommerce

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
