export enum CampaignTableKeys {
    CampaignName = 'campaignName',
    Traffic = 'traffic',
    Impressions = 'impressions',
    UniqueImpressions = 'uniqueImpressions',
    NumberOfClicks = 'clicks',
    ClickThroughRate = 'clickThroughRate',
    TicketCreated = 'ticketsCreated',
    TicketCreationRate = 'ticketsCreationRate',
    TicketsConverted = 'ticketsConverted',
    TicketConversionRate = 'ticketsConversionRate',
    Conversions = 'uniqueConversions',
    ConversionRate = 'totalConversionRate',
    RevenueGeneratedTickets = 'ticketsRevenue',
    RevenueGeneratedCampaignClicks = 'clicksRevenue',
    DiscountCodeUsed = 'discountCodesUsed',
    RevenueGeneratedDiscountCode = 'discountCodesRevenue',
    TotalRevenue = 'totalRevenue',
    GmvUplift = 'revenueUplift',
}

const CAMPAIGN_TABLE_KEYS = Object.values(CampaignTableKeys) as string[]

export function isCampaignTableKey(key: string): key is CampaignTableKeys {
    return CAMPAIGN_TABLE_KEYS.includes(key)
}
