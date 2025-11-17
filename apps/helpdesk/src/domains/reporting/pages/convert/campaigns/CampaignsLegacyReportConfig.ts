import type { StaticFilter } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { CAMPAIGNS_REPORT_TITLE } from 'domains/reporting/pages/convert/campaigns/CampaignsPerformanceReportConfig'
import { CampaignRevenueKPIChart } from 'domains/reporting/pages/convert/charts/CampaignRevenueKPIChart'
import { CampaignsSalesCountKPIChart } from 'domains/reporting/pages/convert/charts/CampaignsSalesCountKPIChart'
import { EngagementKPIChart } from 'domains/reporting/pages/convert/charts/EngagementKPIChart'
import { ImpressionsKPIChart } from 'domains/reporting/pages/convert/charts/ImpressionsKPIChart'
import { InfluencedRevenueShareKPIChart } from 'domains/reporting/pages/convert/charts/InfluencedRevenueShareKPIChart'
import {
    CampaignRevenueShareStat,
    hint,
    title,
} from 'domains/reporting/pages/convert/components/CampaignRevenueShareStat'
import { METRICS } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
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
