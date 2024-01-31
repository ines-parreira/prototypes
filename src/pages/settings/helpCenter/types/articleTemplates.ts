export type ArticleTemplateKey =
    | 'shippingPolicy'
    | 'howToReturn'
    | 'howToCancelOrder'
    | 'howToTrackOrder'
    | 'refundsOrExchanges'
    | 'packageLostOrDamaged'

export enum ArticleTemplateCategory {
    OrderManagement = 'orderManagement',
    ReturnsRefunds = 'returnsAndRefunds',
    ShippingDelivery = 'shippingAndDelivery',
}
