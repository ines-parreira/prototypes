import {StatType} from 'models/stat/types'

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
    revenueUplift: number
    traffic: number
    impressions: number
    uniqueImpressions: number
    engagement: number
    clickThroughRate: number
    uniqueConversions: number
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

export type StatMetric = {
    name: string
    value: any
    type: StatType
    delta?: string
    more_is_better?: boolean
    currency?: string
}

export type CampaignsTotals = StatMetric[]
