//@flow
export const MACRO_ACTION_NAME = Object.freeze({
    ADD_ATTACHMENTS: 'addAttachments',
    ADD_TAGS: 'addTags',
    HTTP: 'http',
    RECHARGE_ACTIVATE_LAST_SUBSCRIPTION: 'rechargeActivateLastSubscription',
    RECHARGE_CANCEL_LAST_SUBSCRIPTION: 'rechargeCancelLastSubscription',
    RECHARGE_REFUND_LAST_CHARGE: 'rechargeRefundLastCharge',
    RECHARGE_REFUND_LAST_ORDER: 'rechargeRefundLastOrder',
    SET_ASSIGNEE: 'setAssignee',
    SET_RESPONSE_TEXT: 'setResponseText',
    SET_STATUS: 'setStatus',
    SET_SUBJECT: 'setSubject',
    SET_TEAM_ASSIGNEE: 'setTeamAssignee',
    SHOPIFY_CANCEL_LAST_ORDER: 'shopifyCancelLastOrder',
    SHOPIFY_CANCEL_ORDER: 'shopifyCancelOrder',
    SHOPIFY_DUPLICATE_LAST_ORDER: 'shopifyDuplicateLastOrder',
    SHOPIFY_EDIT_SHIPPING_ADDRESS_LAST_ORDER:
        'shopifyEditShippingAddressOfLastOrder',
    SHOPIFY_REFUND_SHIPPING_COST_LAST_ORDER:
        'shopifyRefundShippingCostOfLastOrder',
    SHOPIFY_FULL_REFUND_LAST_ORDER: 'shopifyFullRefundLastOrder',
    SHOPIFY_PARTIAL_REFUND_LAST_ORDER: 'shopifyPartialRefundLastOrder',
    SHOPIFY_EDIT_NOTE_LAST_ORDER: 'shopifyEditNoteOfLastOrder',
})

export const MACRO_ACTION_TYPE = Object.freeze({
    USER: 'user',
})
