export type ArticleTemplateKey =
    | 'applyDiscount'
    | 'cancelMembership'
    | 'cancellationPolicy'
    | 'damagedItem'
    | 'editOrder'
    | 'expeditedShipping'
    | 'freeShipping'
    | 'howLongDelivery'
    | 'howToCancelOrder'
    | 'howToReturn'
    | 'howToTrackOrder'
    | 'loginIssue'
    | 'missingDelivery'
    | 'packageLostOrDamaged'
    | 'refundPolicy'
    | 'refundTiming'
    | 'refundsOrExchanges'
    | 'rewards'
    | 'shippingCost'
    | 'shippingPolicy'
    | 'skipShipment'
    | 'startReturn'
    | 'trackOrder'
    | 'updateSubscription'
    | 'worldwideShipping'
    | 'wrongItem'

export enum ArticleTemplateCategory {
    AccountAndSubscriptions = 'accountAndSubscriptions',
    OrderIssues = 'orderIssues',
    OrderManagement = 'orderManagement',
    PaymentsAndDiscounts = 'paymentsAndDiscounts',
    ReturnsRefunds = 'returnsAndRefunds',
    ShippingDelivery = 'shippingAndDelivery',
}
