import type { StaticFilter } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { PerformanceCampaignSalesGraphChart } from 'domains/reporting/pages/convert/charts/PerformanceCampaignSalesGraphChart'
import { PerformanceCampaignSalesKpiChart } from 'domains/reporting/pages/convert/charts/PerformanceCampaignSalesKpiChart'
import { PerformanceEngagementKpiChart } from 'domains/reporting/pages/convert/charts/PerformanceEngagementKpiChart'
import { PerformanceImpressionsGraphChart } from 'domains/reporting/pages/convert/charts/PerformanceImpressionsGraphChart'
import { PerformanceImpressionsKpiChart } from 'domains/reporting/pages/convert/charts/PerformanceImpressionsKpiChart'
import { PerformanceInfluencedRevenueShareKpiChart } from 'domains/reporting/pages/convert/charts/PerformanceInlfluencedRevenueShareKpiChart'
import { RevenueKpiChart } from 'domains/reporting/pages/convert/charts/RevenueKpiChart'
import CampaignRevenueChart from 'domains/reporting/pages/convert/components/CampaignRevenueChart'
import { fetchCampaignReportData } from 'domains/reporting/pages/convert/components/DownloadOverviewData/GenerateReportService'
import { OverviewMetricConfig } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import {
    CampaignPerformanceTable,
    CAMPAIGNS_PERFORMANCE_TABLE_TITLE,
} from 'domains/reporting/pages/convert/containers/CampaignPerformanceTable'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
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
    FilterKey.StoreIntegrations,
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
            description: '',
            chartType: ChartType.Table,
        },
    },
}
