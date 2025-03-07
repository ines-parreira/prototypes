import { FilterComponentKey, FilterKey, StaticFilter } from 'models/stat/types'
import { PerformanceCampaignSalesGraphChart } from 'pages/stats/convert/charts/PerformanceCampaignSalesGraphChart'
import { PerformanceCampaignSalesKpiChart } from 'pages/stats/convert/charts/PerformanceCampaignSalesKpiChart'
import { PerformanceEngagementKpiChart } from 'pages/stats/convert/charts/PerformanceEngagementKpiChart'
import { PerformanceImpressionsGraphChart } from 'pages/stats/convert/charts/PerformanceImpressionsGraphChart'
import { PerformanceImpressionsKpiChart } from 'pages/stats/convert/charts/PerformanceImpressionsKpiChart'
import { PerformanceInfluencedRevenueShareKpiChart } from 'pages/stats/convert/charts/PerformanceInlfluencedRevenueShareKpiChart'
import { RevenueKpiChart } from 'pages/stats/convert/charts/RevenueKpiChart'
import CampaignRevenueChart from 'pages/stats/convert/components/CampaignRevenueChart'
import { fetchCampaignReportData } from 'pages/stats/convert/components/DownloadOverviewData/GenerateReportService'
import { OverviewMetricConfig } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import {
    CampaignPerformanceTable,
    CAMPAIGNS_PERFORMANCE_TABLE_TITLE,
} from 'pages/stats/convert/containers/CampaignPerformanceTable'
import { CampaignsTotalsMetricNames } from 'pages/stats/convert/services/constants'
import { ReportsIDs } from 'pages/stats/custom-reports/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import { STATS_ROUTES } from 'routes/constants'

export enum CampaignsChart {
    RevenueKpiChart = 'RevenueKpiChart',
    PerformanceInfluencedRevenueShareKpiChart = 'PerformanceInfluencedRevenueShareKpiChart',
    CampaignRevenueChart = 'CampaignRevenueChart',
    PerformanceImpressionsKpiChart = 'PerformanceImpressionsKpiChart',
    PerformanceEngagementKpiChart = 'PerformanceEngagementKpiChart',
    PerformanceCampaignSalesKpiChart = 'PerformanceCampaignSalesKpiChart',
    PerformanceImpressionsGraphChart = 'PerformanceImpressionsGraphChart',
    PerformanceCampaignSalesGraphChart = 'PerformanceCampaignSalesGraphChart',
    CampaignPerformanceTable = 'CampaignPerformanceTable',
}

export const CAMPAIGNS_REPORT_TITLE = 'Campaigns'

const CAMPAIGNS_REPORT_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
    FilterKey.AggregationWindow,
    FilterComponentKey.Store,
]

const CAMPAIGNS_REPORT_OPTIONAL_FILTERS = [
    FilterKey.Campaigns,
    FilterKey.CampaignStatuses,
]

export const CampaignsPerformanceReportConfig: ReportConfig<CampaignsChart> = {
    id: ReportsIDs.CampaignsReportConfig,
    reportName: `${CAMPAIGNS_REPORT_TITLE} Performance Report`,
    reportPath: STATS_ROUTES.CONVERT_CAMPAIGNS,
    reportFilters: {
        persistent: CAMPAIGNS_REPORT_PERSISTENT_FILTERS,
        optional: CAMPAIGNS_REPORT_OPTIONAL_FILTERS,
    },
    charts: {
        [CampaignsChart.RevenueKpiChart]: {
            chartComponent: RevenueKpiChart,
            label: OverviewMetricConfig[CampaignsTotalsMetricNames.revenue]
                .title,
            csvProducer: null,
            description:
                OverviewMetricConfig[CampaignsTotalsMetricNames.revenue].hint
                    .title,
            chartType: ChartType.Card,
        },
        [CampaignsChart.PerformanceInfluencedRevenueShareKpiChart]: {
            chartComponent: PerformanceInfluencedRevenueShareKpiChart,
            label: OverviewMetricConfig[
                CampaignsTotalsMetricNames.influencedRevenueShare
            ].title,
            csvProducer: null,
            description:
                OverviewMetricConfig[
                    CampaignsTotalsMetricNames.influencedRevenueShare
                ].hint.title,
            chartType: ChartType.Card,
        },
        [CampaignsChart.CampaignRevenueChart]: {
            chartComponent: CampaignRevenueChart,
            label: OverviewMetricConfig.revenue.title,
            csvProducer: null,
            description: OverviewMetricConfig.revenue.hint.title,
            chartType: ChartType.Graph,
        },
        [CampaignsChart.PerformanceImpressionsKpiChart]: {
            chartComponent: PerformanceImpressionsKpiChart,
            label: OverviewMetricConfig[CampaignsTotalsMetricNames.impressions]
                .title,
            csvProducer: null,
            description:
                OverviewMetricConfig[CampaignsTotalsMetricNames.impressions]
                    .hint.title,
            chartType: ChartType.Card,
        },
        [CampaignsChart.PerformanceEngagementKpiChart]: {
            chartComponent: PerformanceEngagementKpiChart,
            label: OverviewMetricConfig[CampaignsTotalsMetricNames.engagement]
                .title,
            csvProducer: null,
            description:
                OverviewMetricConfig[CampaignsTotalsMetricNames.engagement].hint
                    .title,
            chartType: ChartType.Card,
        },
        [CampaignsChart.PerformanceCampaignSalesKpiChart]: {
            chartComponent: PerformanceCampaignSalesKpiChart,
            label: OverviewMetricConfig[
                CampaignsTotalsMetricNames.campaignSalesCount
            ].title,
            csvProducer: null,
            description:
                OverviewMetricConfig[
                    CampaignsTotalsMetricNames.campaignSalesCount
                ].hint.title,
            chartType: ChartType.Card,
        },
        [CampaignsChart.PerformanceImpressionsGraphChart]: {
            chartComponent: PerformanceImpressionsGraphChart,
            label: OverviewMetricConfig[CampaignsTotalsMetricNames.impressions]
                .title,
            csvProducer: null,
            description:
                OverviewMetricConfig[CampaignsTotalsMetricNames.impressions]
                    .hint.title,
            chartType: ChartType.Graph,
        },
        [CampaignsChart.PerformanceCampaignSalesGraphChart]: {
            chartComponent: PerformanceCampaignSalesGraphChart,
            label: OverviewMetricConfig[
                CampaignsTotalsMetricNames.campaignSalesCount
            ].title,
            csvProducer: null,
            description:
                OverviewMetricConfig[
                    CampaignsTotalsMetricNames.campaignSalesCount
                ].hint.title,
            chartType: ChartType.Graph,
        },
        [CampaignsChart.CampaignPerformanceTable]: {
            chartComponent: CampaignPerformanceTable,
            label: CAMPAIGNS_PERFORMANCE_TABLE_TITLE,
            csvProducer: [
                {
                    type: DataExportFormat.Table,
                    fetch: fetchCampaignReportData,
                },
            ],
            description: undefined,
            chartType: ChartType.Table,
        },
    },
}
