export type ArticleTemplateKey =
    | 'shippingPolicy'
    | 'howToReturn'
    | 'howToCancelOrder'
    | 'howToTrackOrder'
    | 'refundsOrExchanges'
    | 'packageLostOrDamaged'

export enum ArticleTemplateCategory {
    AccountAndSubscriptions = 'accountAndSubscriptions',
    OrderIssues = 'orderIssues',
    OrderManagement = 'orderManagement',
    PaymentsAndDiscounts = 'paymentsAndDiscounts',
    ReturnsRefunds = 'returnsAndRefunds',
    ShippingDelivery = 'shippingAndDelivery',
}
