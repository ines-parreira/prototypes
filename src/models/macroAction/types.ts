export enum MacroActionName {
    AddAttachments = 'addAttachments',
    AddTags = 'addTags',
    Http = 'http',
    RechargeActivateLastSubscription = 'rechargeActivateLastSubscription',
    RechargeCancelLastSubscription = 'rechargeCancelLastSubscription',
    RechargeRefundLastCharge = 'rechargeRefundLastCharge',
    RechargeRefundLastOrder = 'rechargeRefundLastOrder',
    SetAssignee = 'setAssignee',
    SetResponseText = 'setResponseText',
    SetStatus = 'setStatus',
    SetSubject = 'setSubject',
    SetTeamAssignee = 'setTeamAssignee',
    ShopifyCancelLastOrder = 'shopifyCancelLastOrder',
    ShopifyCancelOrder = 'shopifyCancelOrder',
    ShopifyDuplicateLastOrder = 'shopifyDuplicateLastOrder',
    ShopifyEditShippingAddressLastOrder = 'shopifyEditShippingAddressOfLastOrder',
    ShopifyRefundShippingCostLastOrder = 'shopifyRefundShippingCostOfLastOrder',
    ShopifyFullRefundLastOrder = 'shopifyFullRefundLastOrder',
    ShopifyPartialRefundLastOrder = 'shopifyPartialRefundLastOrder',
    ShopifyEditNoteLastOrder = 'shopifyEditNoteOfLastOrder',
}

export enum MacroActionType {
    User = 'user',
}

export type MacroAction = {
    arguments: {
        attachments?: MacroActionAttachment[]
        body_html?: string
        body_text?: string
    }
    name: MacroActionName
    title: string
    type: MacroActionType
}

export type MacroActionAttachment = {
    url: string
}
