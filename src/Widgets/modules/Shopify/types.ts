export enum ShopifyActionType {
    PartialRefundOrder = 'shopifyPartialRefundOrder',
    FullRefundOrder = 'shopifyFullRefundOrder',
    RefundShippingCostOfOrder = 'shopifyRefundShippingCostOfOrder',
    RefundOrder = 'shopifyRefundOrder',
    CancelOrder = 'shopifyCancelOrder',
    CreateOrder = 'shopifyCreateOrder',
    DuplicateOrder = 'shopifyDuplicateOrder',
    EditOrder = 'shopifyEditOrder',
    EditShippingAddress = 'shopifyEditShippingAddressOfOrder',
    UpdateCustomerTags = 'shopifyUpdateCustomerTags',
    UpdateOrderTags = 'shopifyUpdateOrderTags',
    SendDraftOrderInvoice = 'shopifySendDraftOrderInvoice',
}

export type ShopifyTagSelectionEventData = {
    account_id: string
    customer_id: number | null
    order_id?: number | null
    tag?: string
}
