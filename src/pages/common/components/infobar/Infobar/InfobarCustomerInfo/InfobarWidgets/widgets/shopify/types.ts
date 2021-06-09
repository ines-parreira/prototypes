export enum ShopifyActionType {
    PartialRefundOrder = 'shopifyPartialRefundOrder',
    FullRefundOrder = 'shopifyFullRefundOrder',
    RefundShippingCostOfOrder = 'shopifyRefundShippingCostOfOrder',
    RefundOrder = 'shopifyRefundOrder',
    CancelOrder = 'shopifyCancelOrder',
    CreateOrder = 'shopifyCreateOrder',
    DuplicateOrder = 'shopifyDuplicateOrder',
    UpdateCustomerTags = 'shopifyUpdateCustomerTags',
    UpdateOrderTags = 'shopifyUpdateOrderTags',
    SendDraftOrderInvoice = 'shopifySendDraftOrderInvoice',
}
