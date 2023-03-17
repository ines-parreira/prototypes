import {TimeGranularity} from 'pages/stats/revenue/clients/types'

export type CampaignStat = any[]

export type CampaignStatData = CampaignStat[]

export type CampaignEventsTotals = {
    impressions: string
    engagement: string
    uniqueConversions: string
}

export type CampaignOrdersTotals = {
    gmv: string
    influencedRevenueUplift: string
    revenue: string
}

export type CampaignsTotals = CampaignEventsTotals & CampaignOrdersTotals

export type GMVGraphDataPoint = {
    influencedRevenueUplift: string
    createdDatetime: string
    granularityUnit: TimeGranularity
    granularityValue: string
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
