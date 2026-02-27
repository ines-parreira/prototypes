export enum Cube {
    events = 'CampaignEvents',
    orderConversion = 'OrderConversion',
    campaignOrderEvents = 'CampaignOrderEvents',
    pageInteractions = 'PageInteractions',
}

export enum FilterOperator {
    equals = 'equals',
    notEquals = 'notEquals',
    inDateRange = 'inDateRange',
}

export enum SharedDimension {
    campaignId = 'campaignId',
    abVariant = 'abVariant',
    createdDatetime = 'createdDatetime',
    shopName = 'shopName',
}

// Events constants
export enum EventsDimension {
    campaignId = `CampaignEvents.campaignId`,
    createdDatetime = `CampaignEvents.createdDatetime`,
}

export enum EventsMeasure {
    impressions = `CampaignEvents.impressions`,
    firstCampaignDisplay = `CampaignEvents.firstCampaignDisplay`,
    lastCampaignDisplay = `CampaignEvents.lastCampaignDisplay`,
    clicks = `CampaignEvents.clicks`,
    clicksRate = `CampaignEvents.clicksRate`,
    ticketsCreated = `CampaignEvents.ticketsCreated`,
}

export enum EventsSegment {
    campaignEventsOnly = `CampaignEvents.campaignEventsOnly`,
}

// Order conversions constants
export enum OrderConversionDimension {
    orderId = `OrderConversion.orderId`,
    orderAmount = `OrderConversion.orderAmount`,
    orderCurrency = `OrderConversion.orderCurrency`,
    orderProductIds = `OrderConversion.orderProductIds`,
    customerId = `OrderConversion.customerId`,
    campaignId = `OrderConversion.campaignId`,
    createdDatatime = `OrderConversion.createdDatetime`,
}

export enum OrderConversionMeasure {
    gmv = `OrderConversion.gmv`,
    ticketSales = `OrderConversion.ticketSales`,
    ticketSalesCount = `OrderConversion.ticketSalesCount`,
    discountSales = `OrderConversion.discountSales`,
    discountSalesCount = `OrderConversion.discountSalesCount`,
    clickSales = `OrderConversion.clickSales`,
    clickSalesCount = `OrderConversion.clickSalesCount`,
    campaignSales = `OrderConversion.campaignSales`,
    campaignSalesCount = `OrderConversion.campaignSalesCount`,
}

// Campaign order events constants
export enum CampaignOrderEventsDimension {
    campaignId = `CampaignOrderEvents.campaignId`,
    createdDatatime = `CampaignOrderEvents.createdDatetime`,
    eventType = `CampaignOrderEvents.eventType`,
}

export enum CampaignOrderEventsMeasure {
    impressions = `CampaignOrderEvents.impressions`,
    engagement = `CampaignOrderEvents.engagement`,
    campaignCTR = `CampaignOrderEvents.campaignCTR`,
    totalConversionRate = `CampaignOrderEvents.totalConversionRate`,
    orderCount = `CampaignOrderEvents.orderCount`,
    firstCampaignDisplay = `CampaignOrderEvents.firstCampaignDisplay`,
}

export enum CampaignOrderEventsTimeDimension {}

// Page interactions constants
export enum PageInteractionsDimension {
    accountId = 'PageInteractions.accountId',
    shopName = 'PageInteractions.shopName',
    guestId = 'PageInteractions.guestId',
    sessionId = 'PageInteractions.sessionId',
    createdDatetime = 'PageInteractions.createdDatetime',
    eventType = 'PageInteractions.eventType',
    pageTitle = 'PageInteractions.pageTitle',
    productId = 'PageInteractions.productId',
    collectionId = 'PageInteractions.collectionId',
    searchQuery = 'PageInteractions.searchQuery',
    cart = 'PageInteractions.cart',
    url = 'PageInteractions.url',
    trafficMetadata = 'PageInteractions.trafficMetadata',
}

export enum PageInteractionsMeasure {
    count = 'PageInteractions.count',
    lastDatetime = 'PageInteractions.lastDatetime',
    lastSearchQuery = 'PageInteractions.lastSearchQuery',
}

export type PageInteractionsTimeDimension =
    | ValueOf<PageInteractionsDimension.createdDatetime>
    | ValueOf<PageInteractionsMeasure.lastDatetime>

export const CUBE_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS'

export const CAMPAIGN_EVENTS = [
    'campaign-clicked',
    'campaign-link-clicked',
    'chat-product-add-to-cart',
    'chat-product-clicked',
    'com.gorgias.convert.visitor-form.analytics-submitted',
    'campaign-displayed',
    'ticket-message-created',
]
