import { FilterKey, StaticFilter } from 'models/stat/types'
import { CAMPAIGNS_REPORT_TITLE } from 'pages/stats/convert/campaigns/CampaignsPerformanceReportConfig'
import { CampaignRevenueKPIChart } from 'pages/stats/convert/charts/CampaignRevenueKPIChart'
import { CampaignsSalesCountKPIChart } from 'pages/stats/convert/charts/CampaignsSalesCountKPIChart'
import { EngagementKPIChart } from 'pages/stats/convert/charts/EngagementKPIChart'
import { ImpressionsKPIChart } from 'pages/stats/convert/charts/ImpressionsKPIChart'
import { InfluencedRevenueShareKPIChart } from 'pages/stats/convert/charts/InfluencedRevenueShareKPIChart'
import {
    CampaignRevenueShareStat,
    hint,
    title,
} from 'pages/stats/convert/components/CampaignRevenueShareStat'
import { METRICS } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { ChartType, ReportConfig } from 'pages/stats/dashboards/types'
import { STATS_ROUTES } from 'routes/constants'

export enum CampaignsLegacyChart {
    CampaignRevenueKPIChart = 'CampaignRevenueKPIChart',
    InfluencedRevenueShareKPIChart = 'InfluencedRevenueShareKPIChart',
    ImpressionsKPIChart = 'ImpressionsKPIChart',
    EngagementKPIChart = 'EngagementKPIChart',
    CampaignsSalesCountKPIChart = 'CampaignsSalesCountKPIChart',
    CampaignRevenueShareStat = 'CampaignRevenueShareStat',
}

const CAMPAIGNS_REPORT_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
    FilterKey.AggregationWindow,
    FilterKey.StoreIntegrations,
]

const CAMPAIGNS_REPORT_OPTIONAL_FILTERS = [
    FilterKey.Campaigns,
    FilterKey.CampaignStatuses,
]

export const CampaignsLegacyReportConfig: ReportConfig<CampaignsLegacyChart> = {
    id: ReportsIDs.CampaignsLegacyReportConfig,
    reportName: CAMPAIGNS_REPORT_TITLE,
    reportPath: STATS_ROUTES.CONVERT_CAMPAIGNS,
    reportFilters: {
        persistent: CAMPAIGNS_REPORT_PERSISTENT_FILTERS,
        optional: CAMPAIGNS_REPORT_OPTIONAL_FILTERS,
    },
    charts: {
        [CampaignsLegacyChart.CampaignRevenueKPIChart]: {
            chartComponent: CampaignRevenueKPIChart,
            label: METRICS.revenue.title,
            csvProducer: null,
            description: METRICS.revenue.hint.title,
            chartType: ChartType.Card,
        },
        [CampaignsLegacyChart.InfluencedRevenueShareKPIChart]: {
            chartComponent: InfluencedRevenueShareKPIChart,
            label: METRICS.influencedRevenueShare.title,
            csvProducer: null,
            description: METRICS.influencedRevenueShare.hint.title,
            chartType: ChartType.Card,
        },
        [CampaignsLegacyChart.ImpressionsKPIChart]: {
            chartComponent: ImpressionsKPIChart,
            label: METRICS.influencedRevenueShare.title,
            csvProducer: null,
            description: METRICS.influencedRevenueShare.hint.title,
            chartType: ChartType.Card,
        },
        [CampaignsLegacyChart.EngagementKPIChart]: {
            chartComponent: EngagementKPIChart,
            label: METRICS.engagement.title,
            csvProducer: null,
            description: METRICS.engagement.hint.title,
            chartType: ChartType.Card,
        },
        [CampaignsLegacyChart.CampaignsSalesCountKPIChart]: {
            chartComponent: CampaignsSalesCountKPIChart,
            label: METRICS.campaignSalesCount.title,
            csvProducer: null,
            description: METRICS.campaignSalesCount.hint.title,
            chartType: ChartType.Card,
        },
        [CampaignsLegacyChart.CampaignRevenueShareStat]: {
            chartComponent: CampaignRevenueShareStat,
            label: title,
            csvProducer: null,
            description: hint,
            chartType: ChartType.Graph,
        },
    },
}
