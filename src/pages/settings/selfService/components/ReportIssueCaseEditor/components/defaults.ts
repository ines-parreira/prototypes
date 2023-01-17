import {
    AUTOMATED_RESPONSE,
    ReportIssueCaseReasonAction,
    ReportIssueReasons,
} from 'models/selfServiceConfiguration/types'

// TODO: text and html fields will be translated (with sspTexts) in a future iteration
export const DEFAULT_REASON_ACTIONS: Record<
    ReportIssueReasons,
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
