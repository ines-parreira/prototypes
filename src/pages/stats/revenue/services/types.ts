import {CampaignsTotalsMetricNames} from 'pages/stats/revenue/services/constants'

export type CampaignStat = number[]

export type CampaignStatData = CampaignStat

export type Line = {
    data: CampaignStat
}

export type CampaignGraphData = {
    axes: {
        x: CampaignStat
        y: CampaignStat
    }
    lines: Line[]
}

export type TicketPerformanceData = CampaignStat[]

export type StatData = TicketPerformanceData | CampaignGraphData

export type RevenueGraphDataPoint = {
    x: string
    y: number
}

export type CampaignChatPerformanceData = {
    campaignCTR: RevenueGraphDataPoint[]
    campaignConversionRate: RevenueGraphDataPoint[]
    chatConversionRate: RevenueGraphDataPoint[]
}

export type CampaignPerformanceData = {
    totalRevenue: number
    traffic: number
    impressions: number
    engagement: number
    clickThroughRate: number
    campaignSalesCount: number
    totalConversionRate: number
    ticketsCreated: number
    ticketsCreationRate: number
    ticketsConverted: number
    ticketsConversionRate: number
    ticketsRevenue: number
    clicks: number
    clicksRate: number
    clicksConverted: number
    clicksConversionRate: number
    clicksRevenue: number
    discountCodesUsed: number
    discountCodesRevenue: number
}

export type CampaignsPerformanceDataset = {
    [key: string]: CampaignPerformanceData
}

export type EventsTotals = {
    [CampaignsTotalsMetricNames.impressions]: string
    [CampaignsTotalsMetricNames.engagement]: string
}

export type OrdersTotals = {
    [CampaignsTotalsMetricNames.revenue]: string | number
    [CampaignsTotalsMetricNames.campaignSalesCount]: string
}

export type CalculatedTotals = {
    [CampaignsTotalsMetricNames.influencedRevenueShare]: string
}

export type StoreTotal = {
    [CampaignsTotalsMetricNames.gmv]: string | number
}

export type CampaignsTotals = EventsTotals &
    OrdersTotals &
    StoreTotal &
    CalculatedTotals

export type RevenueByDate = {
    [key: string]: number
}
