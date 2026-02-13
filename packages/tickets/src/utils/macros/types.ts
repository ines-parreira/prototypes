// partial sync with g/utils/action/constants.py
export enum MacroActionName {
    AddAttachments = 'addAttachments',
    AddInternalNote = 'addInternalNote',
    AddTags = 'addTags',
    ApplyExternalTemplate = 'applyExternalTemplate',
    ExcludeFromAutoMerge = 'excludeFromAutoMerge',
    ExcludeFromCSAT = 'excludeFromCSAT',
    ForwardByEmail = 'forwardByEmail',
    Http = 'http',
    RechargeActivateLastSubscription = 'rechargeActivateLastSubscription',
    RechargeCancelLastSubscription = 'rechargeCancelLastSubscription',
    RechargeRefundLastCharge = 'rechargeRefundLastCharge',
    RechargeRefundLastOrder = 'rechargeRefundLastOrder',
    RemoveTags = 'removeTags',
    SetAssignee = 'setAssignee',
    SetCustomFieldValue = 'setCustomFieldValue',
    SetCustomerCustomFieldValue = 'setCustomerCustomFieldValue',
    SetPriority = 'setPriority',
    SetResponseText = 'setResponseText',
    SetStatus = 'setStatus',
    SetSubject = 'setSubject',
    SetTeamAssignee = 'setTeamAssignee',
    ShopifyCancelLastOrder = 'shopifyCancelLastOrder',
    ShopifyCancelOrder = 'shopifyCancelOrder',
    ShopifyDuplicateLastOrder = 'shopifyDuplicateLastOrder',
    ShopifyEditNoteLastOrder = 'shopifyEditNoteOfLastOrder',
    ShopifyEditShippingAddressLastOrder = 'shopifyEditShippingAddressOfLastOrder',
    ShopifyFullRefundLastOrder = 'shopifyFullRefundLastOrder',
    ShopifyPartialRefundLastOrder = 'shopifyPartialRefundLastOrder',
    ShopifyRefundShippingCostLastOrder = 'shopifyRefundShippingCostOfLastOrder',
    SnoozeTicket = 'snoozeTicket',
    SnoozeTicketDuration = 'snoozeTicketDuration',
}

export type MacroResponseActionName =
    | MacroActionName.AddInternalNote
    | MacroActionName.SetResponseText
    | MacroActionName.ForwardByEmail
