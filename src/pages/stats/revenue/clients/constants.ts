export enum Cube {
    events = 'CampaignEvents',
    orderConversion = 'OrderConversion',
    campaignOrderEvents = 'CampaignOrderEvents',
}

export enum FilterOperator {
    equals = 'equals',
    inDateRange = 'inDateRange',
}

export enum SharedDimension {
    campaignId = 'campaignId',
    createdDatetime = 'createdDatetime',
    shopName = 'shopName',
}

// Events constants
export enum EventsDimension {
    campaignId = `CampaignEvents.campaignId`,
    createdDatetime = `CampaignEvents.createdDatetime`,
}

export enum EventsMeasure {
    traffic = `CampaignEvents.traffic`,
    impressions = `CampaignEvents.impressions`,
    firstCampaignDisplay = `CampaignEvents.firstCampaignDisplay`,
    lastCampaignDisplay = `CampaignEvents.lastCampaignDisplay`,
    clicks = `CampaignEvents.clicks`,
    clicksRate = `CampaignEvents.clicksRate`,
}

export enum EventsSegment {
    campaignEventsOnly = `CampaignEvents.campaignEventsOnly`,
}

// Order conversions constants
export enum OrderConversionDimension {
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
}

export enum CampaignOrderEventsMeasure {
    impressions = `CampaignOrderEvents.impressions`,
    engagement = `CampaignOrderEvents.engagement`,
    campaignCTR = `CampaignOrderEvents.campaignCTR`,
    totalConversionRate = `CampaignOrderEvents.totalConversionRate`,
}

export const CUBE_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS'
