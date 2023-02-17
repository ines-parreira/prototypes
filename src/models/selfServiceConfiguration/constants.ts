import {Option, SelectableOption} from 'pages/common/forms/SelectField/types'
import {Option as MultiSelectOption} from 'pages/common/forms/MultiSelectOptionsField/types'

import {
    AUTOMATED_RESPONSE,
    FilterKeyEnum,
    FinancialStatuses,
    FulfillmentStatuses,
    OrderStatuses,
    ReportIssueCaseReason,
    ReportIssueCaseReasonAction,
    SelfServiceOrderStatusEnum,
    ShipmentStatuses,
} from './types'

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

export const CancellationsDropdownOptionsList = [
    {
        value: SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
        label: 'Processing Fulfillment',
        statuses: [
            SelfServiceOrderStatusEnum.UNFULFILLED,
            SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
        ],
    },
    {
        value: SelfServiceOrderStatusEnum.UNFULFILLED,
        label: 'Unfulfilled',
        statuses: [SelfServiceOrderStatusEnum.UNFULFILLED],
    },
    {
        value: SelfServiceOrderStatusEnum.PENDING_DELIVERY,
        label: 'Pending Delivery',
        statuses: [
            SelfServiceOrderStatusEnum.UNFULFILLED,
            SelfServiceOrderStatusEnum.PROCESSING_FULFILLMENT,
            SelfServiceOrderStatusEnum.PENDING_DELIVERY,
        ],
    },
]

export const FINANCIAL_STATUSES_OPTIONS: MultiSelectOption[] = [
    {value: FinancialStatuses.PENDING, label: 'Pending'},
    {value: FinancialStatuses.AUTHORIZED, label: 'Authorized'},
    {value: FinancialStatuses.PARTIALLY_PAID, label: 'Partially paid'},
    {value: FinancialStatuses.PAID, label: 'Paid'},
    {value: FinancialStatuses.PARTIALLY_REFUNDED, label: 'Partially refunded'},
    {value: FinancialStatuses.REFUNDED, label: 'Refunded'},
    {value: FinancialStatuses.VOIDED, label: 'Voided'},
]

export const FULFILLMENT_STATUSES_OPTIONS: MultiSelectOption[] = [
    {value: FulfillmentStatuses.PENDING, label: 'Pending'},
    {value: FulfillmentStatuses.OPEN, label: 'Open'},
    {value: FulfillmentStatuses.SUCCESS, label: 'Success'},
    {value: FulfillmentStatuses.CANCELLED, label: 'Cancelled'},
    {value: FulfillmentStatuses.ERROR, label: 'Error'},
    {value: FulfillmentStatuses.FAILURE, label: 'Failure'},
]

export const SHIPMENT_STATUSES_OPTIONS: MultiSelectOption[] = [
    {value: ShipmentStatuses.LABEL_PRINTED, label: 'Label printed'},
    {value: ShipmentStatuses.LABEL_PURCHASED, label: 'Label purchased'},
    {value: ShipmentStatuses.ATTEMPTED_DELIVERY, label: 'Attempted delivery'},
    {value: ShipmentStatuses.READY_FOR_PICKUP, label: 'Ready for pickup'},
    {value: ShipmentStatuses.CONFIRMED, label: 'Confirmed'},
    {value: ShipmentStatuses.IN_TRANSIT, label: 'In transit'},
    {value: ShipmentStatuses.OUT_FOR_DELIVERY, label: 'Out for delivery'},
    {value: ShipmentStatuses.DELIVERED, label: 'Delivered'},
    {value: ShipmentStatuses.FAILURE, label: 'Failure'},
]

export const ORDER_STATUSES_OPTIONS: MultiSelectOption[] = [
    {value: OrderStatuses.OPEN, label: 'Open'},
    {value: OrderStatuses.ARCHIVED, label: 'Archived'},
    {value: OrderStatuses.CANCELLED, label: 'Cancelled'},
]

export const REASONS_DROPDOWN_OPTIONS: Option[] = [
    {
        label: 'FEEDBACK',
        isHeader: true,
    },
    {
        label: "I'm very happy with the product I received 👍",
        value: 'reasonVeryHappy',
    },
    {
        label: "I'm not happy with the product I received 👎",
        value: 'reasonNotHappy',
    },
    {
        isDivider: true,
    },
    {
        label: 'RETURN',
        isHeader: true,
    },
    {
        label: "I'd like to return a product",
        value: 'reasonReturnProduct',
    },
    {isDivider: true},
    {
        label: 'REFUND',
        isHeader: true,
    },
    {
        label: "I'd like to get a refund for this order",
        value: 'reasonRequestRefund',
    },
    {
        label: "I didn't get my refund",
        value: 'reasonDidNotReceiveRefund',
    },
    {isDivider: true},
    {label: 'CHANGE ORDER', isHeader: true},
    {label: "I'd like to cancel my order", value: 'reasonCancelOrder'},
    {label: "I'd like to edit my order", value: 'reasonEditOrder'},
    {label: "I'd like to reorder some items", value: 'reasonReorderItems'},
    {isDivider: true},
    {label: 'DAMAGED ORDER', isHeader: true},
    {label: 'My order was damaged in delivery', value: 'reasonOrderDamaged'},
    {
        label: 'The items in my order are defective',
        value: 'reasonOrderDefective',
    },
    {isDivider: true},
    {label: 'WRONG ORDER', isHeader: true},
    {
        label: 'The items are different from what I ordered',
        value: 'reasonIncorrectItems',
    },
    {
        label: 'Some items are missing from my order',
        value: 'reasonItemsMissing',
    },
    {isDivider: true},
    {label: 'DISCOUNT', isHeader: true},
    {
        label: 'My discount code is not working',
        value: 'reasonDiscountNotWorking',
    },
    {label: "I'd like a discount code", value: 'reasonRequestDiscount'},
    {
        label: 'I forgot to apply my discount code',
        value: 'reasonForgotToUseDiscount',
    },
    {isDivider: true},
    {label: 'EXCHANGE', isHeader: true},
    {
        label: "I'd like to exchange items in my order",
        value: 'reasonExchangeRequest',
    },
    {
        label: "I'd like to replace items in my order",
        value: 'reasonReplaceItemsRequest',
    },
    {isDivider: true},
    {label: 'SHIPPING', isHeader: true},
    {
        label: 'My order should have shipped by now',
        value: 'reasonOrderStillNotShipped',
    },
    {label: 'Where is my order?', value: 'reasonWhereIsMyOrder'},
    {
        label: "I'd like to change my shipping address",
        value: 'reasonChangeShippingAddress',
    },
    {
        label: "I'd like to change the delivery date",
        value: 'reasonChangeDeliveryDate',
    },
    {
        label: 'My order has been stuck in transit',
        value: 'reasonOrderStuckInTransit',
    },
    {
        label: "I'm past my expected delivery date",
        value: 'reasonPastExpectedDeliveryDate',
    },
    {isDivider: true},
    {label: 'SUBSCRIPTION', isHeader: true},
    {
        label: "I'd like to cancel my subscription",
        value: 'reasonCancelSubscription',
    },
    {
        label: "I'd like to edit my subscription",
        value: 'reasonEditSubscription',
    },
    {isDivider: true},
    {label: 'OTHER', isHeader: true},
    {label: 'Other', value: 'reasonOther'},
]

export const SELECTABLE_REASONS_DROPDOWN_OPTIONS =
    REASONS_DROPDOWN_OPTIONS.filter(
        (option) => 'value' in option
    ) as SelectableOption[]

export const REASONS_DROPDOWN_SECTIONS_WITH_OPTIONS =
    REASONS_DROPDOWN_OPTIONS.reduce<
        [string, {value: string; label: string}[]][]
    >((acc, option) => {
        if ('isHeader' in option) {
            acc.push([option.label, []])
        } else if ('value' in option) {
            acc[acc.length - 1][1].push(
                option as {value: string; label: string}
            )
        }

        return acc
    }, [])

export const DEFAULT_REASON_ACTIONS: Record<
    ReportIssueCaseReason['reasonKey'],
    ReportIssueCaseReasonAction | undefined
> = {
    reasonNotHappy: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: "We're sorry to hear about that. Is there anything we can do to improve your experience with us?",
            html: "<div>We're sorry to hear about that. Is there anything we can do to improve your experience with us?</div>",
        },
        showHelpfulPrompt: false,
    },
    reasonVeryHappy: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'Thanks for the positive feedback! We would love to hear what you like most about our products.',
            html: '<div>Thanks for the positive feedback! We would love to hear what you like most about our products.</div>',
        },
        showHelpfulPrompt: false,
    },
    reasonReturnProduct: undefined,
    reasonRequestRefund: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'If your account was charged, a refund has been issued back to the original method of payment when the order was canceled. We would like to kindly ask you to allow up to 5 business days for the amount to reflect into your account.',
            html: '<div>If your account was charged, a refund has been issued back to the original method of payment when the order was canceled. We would like to kindly ask you to allow up to 5 business days for the amount to reflect into your account.</div>',
        },
        showHelpfulPrompt: true,
    },
    reasonDidNotReceiveRefund: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: "Please note a refund was issued back to the original method of payment. Please allow up to 5 business days for the refund to be reflected on your account. If it's been more than 5 business days, let us know you need more help.",
            html: "<div>Please note a refund was issued back to the original method of payment. Please allow up to 5 business days for the refund to be reflected on your account.</div><div>If it's been more than 5 business days, let us know you need more help.</div>",
        },
        showHelpfulPrompt: true,
    },
    reasonCancelOrder: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'At this time we are unable to modify already placed orders.',
            html: '<div>At this time we are unable to modify already placed orders.</div>',
        },
        showHelpfulPrompt: true,
    },
    reasonEditOrder: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'At this time we are unable to modify already placed orders.',
            html: '<div>At this time we are unable to modify already placed orders.</div>',
        },
        showHelpfulPrompt: true,
    },
    reasonReorderItems: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'Happy to help! What would you like to reorder?',
            html: '<div>Happy to help! What would you like to reorder?</div>',
        },
        showHelpfulPrompt: false,
    },
    reasonOrderDamaged: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: "We're very sorry to hear this. Please provide us with a few more details regarding the damage to the items and let us know if the shipping box was also damaged.",
            html: "<div>We're very sorry to hear this. Please provide us with a few more details regarding the damage to the items and let us know if the shipping box was also damaged.</div>",
        },
        showHelpfulPrompt: false,
    },
    reasonOrderDefective: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: "We're very sorry to hear this. Please provide us with a few more details regarding the defect you noticed.",
            html: "<div>We're very sorry to hear this. Please provide us with a few more details regarding the defect you noticed.</div>",
        },
        showHelpfulPrompt: false,
    },
    reasonIncorrectItems: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: "We're very sorry to hear this. Please let us know exactly what item/color/size you actually received.",
            html: "<div>We're very sorry to hear this. Please let us know exactly what item/color/size you actually received.</div>",
        },
        showHelpfulPrompt: false,
    },
    reasonItemsMissing: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: "We're very sorry to hear this. Please let us know which items are missing.",
            html: "<div>We're very sorry to hear this. Please let us know which items are missing.</div>",
        },
        showHelpfulPrompt: false,
    },
    reasonDiscountNotWorking: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'Thanks for reaching out. Someone will get back to you shortly to help you with your discount code.',
            html: '<div>Thanks for reaching out. Someone will get back to you shortly to help you with your discount code.</div>',
        },
        showHelpfulPrompt: false,
    },
    reasonRequestDiscount: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: "Thanks for reaching out. We don't have any discount codes to share with you at the moment.",
            html: "<div>Thanks for reaching out. We don't have any discount codes to share with you at the moment.</div>",
        },
        showHelpfulPrompt: true,
    },
    reasonForgotToUseDiscount: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'Please provide us with the discount code you forgot to apply so we can further check into this for you.',
            html: '<div>Please provide us with the discount code you forgot to apply so we can further check into this for you.</div>',
        },
        showHelpfulPrompt: false,
    },
    reasonExchangeRequest: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: "If you'd like to complete an exchange or to simply initiate a return for your last order, you can do so by visiting our return page.",
            html: "<div>If you'd like to complete an exchange or to simply initiate a return for your last order, you can do so by visiting our return page.</div>",
        },
        showHelpfulPrompt: true,
    },
    reasonReplaceItemsRequest: undefined,
    reasonOrderStillNotShipped: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'Due to nationwide shipping volume, you may experience a delay in receiving your order. Please allow another business day to receive a tracking number.',
            html: '<div>Due to nationwide shipping volume, you may experience a delay in receiving your order. Please allow another business day to receive a tracking number.</div>',
        },
        showHelpfulPrompt: true,
    },
    reasonWhereIsMyOrder: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'You can check the status of your order by clicking on the "track" button for your order on the order list.',
            html: '<div>You can check the status of your order by clicking on the "track" button for your order on the order list.</div>',
        },
        showHelpfulPrompt: true,
    },
    reasonChangeShippingAddress: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'At this time we are unable to modify already placed orders.',
            html: '<div>At this time we are unable to modify already placed orders.</div>',
        },
        showHelpfulPrompt: true,
    },
    reasonChangeDeliveryDate: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'At this time we are unable to modify already placed orders.',
            html: '<div>At this time we are unable to modify already placed orders.</div>',
        },
        showHelpfulPrompt: true,
    },
    reasonOrderStuckInTransit: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: "We're very sorry to hear this. Someone will get back to you shortly to help you solve this issue.",
            html: "<div>We're very sorry to hear this. Someone will get back to you shortly to help you solve this issue.</div>",
        },
        showHelpfulPrompt: false,
    },
    reasonPastExpectedDeliveryDate: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'Due to nationwide shipping volume, you may experience a delay in receiving your order. Please allow a few more business days for the order to reach you.',
            html: '<div>Due to nationwide shipping volume, you may experience a delay in receiving your order. Please allow a few more business days for the order to reach you.</div>',
        },
        showHelpfulPrompt: true,
    },
    reasonCancelSubscription: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'Thanks for reaching out about your subscription. We will get back to you shortly with the next steps.',
            html: '<div>Thanks for reaching out about your subscription. We will get back to you shortly with the next steps.</div>',
        },
        showHelpfulPrompt: false,
    },
    reasonEditSubscription: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'Thanks for reaching out about your subscription. We will get back to you shortly with the next steps.',
            html: '<div>Thanks for reaching out about your subscription. We will get back to you shortly with the next steps.</div>',
        },
        showHelpfulPrompt: false,
    },
    reasonOther: {
        type: AUTOMATED_RESPONSE,
        responseMessageContent: {
            text: 'How can we help you?',
            html: '<div>How can we help you?</div>',
        },
        showHelpfulPrompt: false,
    },
}

export const AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH = 1000
