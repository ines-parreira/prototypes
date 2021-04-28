export type SelfServiceState = {
    self_service_configurations: SelfServiceConfiguration[]
    loading: boolean
}

export type SelfServiceConfigurationFilter = {
    key: string
    value: string
    operator: string
}

export type SelfServiceConfigurationPolicy = {
    enabled: boolean
    eligibilities?: SelfServiceConfigurationFilter[]
    exceptions?: SelfServiceConfigurationFilter[]
}

export type SelfServiceConfiguration = {
    id: number
    type: ShopType
    shop_name: string
    created_datetime: string
    updated_datetime: string
    deactivated_datetime: Maybe<string>
    report_issue_policy: SelfServiceConfigurationPolicy
    track_order_policy: SelfServiceConfigurationPolicy
    cancel_order_policy: SelfServiceConfigurationPolicy
    return_order_policy: SelfServiceConfigurationPolicy
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
}

export enum SelfServiceOrderStatusEnum {
    UNFULFILLED = 'unfulfilled',
    PENDING_DELIVERY = 'pending_delivery',
    PROCESSING_FULFILLMENT = 'processing_fulfillment',
}

export const CancellationsDropdownOptionsList = [
    {
        value: 'processing_fulfillment',
        label: 'Processing Fulfillment',
    },
    {
        value: 'unfulfilled',
        label: 'Unfulfilled',
    },
    {
        value: 'pending_delivery',
        label: 'Pending Delivery',
    },
]

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
