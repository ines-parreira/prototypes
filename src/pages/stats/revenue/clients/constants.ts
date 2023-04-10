// Cube names
export const EVENTS_CUBE = 'CampaignEvents'
export const ORDER_CUBE = 'OrderConversion'
export const CAMPAIGN_ORDER_CUBE = 'CampaignOrderEvents'

export enum Cubes {
    events = 'CampaignEvents',
    orderConversion = 'OrderConversion',
    campaignOrderEvents = 'CampaignOrderEvents',
}

export enum FilterOperators {
    equals = 'equals',
    inDateRange = 'inDateRange',
}

export enum SharedDimensionNames {
    campaignId = 'campaignId',
    createdDatetime = 'createdDatetime',
    shopName = 'shopName',
}

// Events constants
export const EventsDimensions = {
    campaignId: `${Cubes.events}.${SharedDimensionNames.campaignId}`,
    createdDatetime: `${Cubes.events}.${SharedDimensionNames.createdDatetime}`,
}

export const EventsMeasures = {
    traffic: `${Cubes.events}.traffic`,
    impressions: `${Cubes.events}.impressions`,
    uniqueImpressions: `${Cubes.events}.uniqueImpressions`,
    firstCampaignDisplay: `${Cubes.events}.firstCampaignDisplay`,
    lastCampaignDisplay: `${Cubes.events}.lastCampaignDisplay`,
    clicks: `${Cubes.events}.clicks`,
    clicksRate: `${Cubes.events}.clicksRate`,
}

export const EventsSegments = {
    campaignEventsOnly: `${Cubes.events}.campaignEventsOnly`,
}

// Order conversions constants
export const OrderConversionDimensions = {
    campaignId: `${Cubes.orderConversion}.${SharedDimensionNames.campaignId}`,
    createdDatatime: `${Cubes.orderConversion}.createdDatetime`,
}

export const OrderConversionMeasures = {
    gmv: `${Cubes.orderConversion}.gmv`,
    influencedRevenueUplift: `${Cubes.orderConversion}.influencedRevenueUplift`,
    ticketSales: `${Cubes.orderConversion}.ticketSales`,
    ticketSalesCount: `${Cubes.orderConversion}.ticketSalesCount`,
    discountSales: `${Cubes.orderConversion}.discountSales`,
    discountSalesCount: `${Cubes.orderConversion}.discountSalesCount`,
    clickSales: `${Cubes.orderConversion}.clickSales`,
    clickSalesCount: `${Cubes.orderConversion}.clickSalesCount`,
    campaignSales: `${Cubes.orderConversion}.campaignSales`,
    campaignSalesCount: `${Cubes.orderConversion}.campaignSalesCount`,
}

// Campaign order events constants
export const CampaignOrderEventsDimensions = {
    campaignId: `${Cubes.campaignOrderEvents}.${SharedDimensionNames.campaignId}`,
    createdDatatime: `${Cubes.campaignOrderEvents}.${SharedDimensionNames.createdDatetime}`,
}

export const CampaignOrderEventsMeasures = {
    impressions: `${Cubes.campaignOrderEvents}.impressions`,
    engagement: `${Cubes.campaignOrderEvents}.engagement`,
    campaignCTR: `${Cubes.campaignOrderEvents}.campaignCTR`,
    totalConversionRate: `${Cubes.campaignOrderEvents}.totalConversionRate`,
}
