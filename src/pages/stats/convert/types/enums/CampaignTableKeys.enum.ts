export enum CampaignTableKeys {
    CampaignName = 'campaignName',
    // Core
    TotalRevenue = 'totalRevenue',
    TotalRevenueShare = 'totalRevenueShare',
    Impressions = 'impressions',
    Engagement = 'engagement',
    ClickThroughRate = 'clickThroughRate',
    // Orders
    Conversions = 'campaignSalesCount',
    TotalConversionRate = 'totalConversionRate',
    // Tickets
    TicketsCreated = 'ticketsCreated',
    TicketsCreationRate = 'ticketsCreationRate',
    TicketsConverted = 'ticketsConverted',
    TicketConversionRate = 'ticketsConversionRate',
    RevenueGeneratedTickets = 'ticketsRevenue',
    // Campaigns
    NumberOfClicks = 'clicks',
    ClicksRate = 'clicksRate',
    ClicksConverted = 'clicksConverted',
    ClicksConversionRate = 'clicksConversionRate',
    ClicksRevenue = 'clicksRevenue',
    // Discount codes
    DiscountCodeUsed = 'discountCodesUsed',
    RevenueGeneratedDiscountCode = 'discountCodesRevenue',
}

const CAMPAIGN_TABLE_KEYS = Object.values(CampaignTableKeys) as string[]

export function isCampaignTableKey(key: string): key is CampaignTableKeys {
    return CAMPAIGN_TABLE_KEYS.includes(key)
}
