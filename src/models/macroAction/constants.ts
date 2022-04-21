//TsFixMe fallback value, use MacroActionName enum instead
import {MacroActionName} from './types'

export const MACRO_ACTION_NAME = Object.freeze({
    ADD_ATTACHMENTS: 'addAttachments',
    ADD_INTERNAL_NOTE: 'addInternalNote',
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

//TsFixMe fallback value, use MacroActionType enum instead
export const MACRO_ACTION_TYPE = Object.freeze({
    USER: 'user',
})

export const TYPE_TO_IMAGE_PATH: Record<string, string> = {
    http: 'integrations/http.png',
    shopify: 'integrations/shopify.png',
    recharge: 'integrations/recharge.svg',
    [MacroActionName.AddInternalNote]: 'icons/gorgias-icon-logo-black.png',
}
