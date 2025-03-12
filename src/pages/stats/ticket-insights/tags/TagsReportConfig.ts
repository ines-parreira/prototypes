import { FilterKey, StaticFilter } from 'models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/dashboards/types'
import { AllUsedTagsTableChart } from 'pages/stats/ticket-insights/tags/AllUsedTagsTableChart'
import {
    TicketInsightsTagsMetric,
    TicketInsightsTagsMetricConfig,
} from 'pages/stats/ticket-insights/tags/TagsMetricConfig'
import { TagsTrendChart } from 'pages/stats/ticket-insights/tags/TagsTrendChart'
import { TopUsedTagsChart } from 'pages/stats/ticket-insights/tags/TopUsedTagsChart'
import { STATS_ROUTES } from 'routes/constants'
import { fetchTagsReportData } from 'services/reporting/tagsReportingService'

export const TAGS_OPTIONAL_FILTERS = [
    FilterKey.Agents,
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.CustomFields,
    FilterKey.Score,
    ...AUTO_QA_FILTER_KEYS,
]

export const TAGS_PERSISTENT_FILTERS = [
    FilterKey.Period,
    FilterKey.AggregationWindow,
] satisfies StaticFilter[]

export const TAGS_TITLE = 'Tags'

export enum TicketInsightsTagsChart {
    AllUsedTagsTableChart = 'all-used-tags-table-chart',
    TagsTrendChart = 'tags-trend-chart',
    TopUsedTagsChart = 'top-used-tags-chart',
}

export const TicketInsightsTagsReportConfig: ReportConfig<TicketInsightsTagsChart> =
    {
        id: ReportsIDs.TicketInsightsTagsReportConfig,
        reportName: TAGS_TITLE,
        reportPath: STATS_ROUTES.TICKET_INSIGHTS_TAGS,
        reportFilters: {
            optional: TAGS_OPTIONAL_FILTERS,
            persistent: TAGS_PERSISTENT_FILTERS,
        },
        charts: {
            [TicketInsightsTagsChart.AllUsedTagsTableChart]: {
                chartComponent: AllUsedTagsTableChart,
                label: TicketInsightsTagsMetricConfig[
                    TicketInsightsTagsMetric.AllUsedTagsTableChart
                ].title,
                description:
                    TicketInsightsTagsMetricConfig[
                        TicketInsightsTagsMetric.AllUsedTagsTableChart
                    ].hint.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchTagsReportData,
                    },
                ],
                chartType: ChartType.Table,
            },
            [TicketInsightsTagsChart.TagsTrendChart]: {
                chartComponent: TagsTrendChart,
                label: TicketInsightsTagsMetricConfig[
                    TicketInsightsTagsMetric.TagsTrendChart
                ].title,
                description:
                    TicketInsightsTagsMetricConfig[
                        TicketInsightsTagsMetric.TagsTrendChart
                    ].hint.title,
                csvProducer: null,
                chartType: ChartType.Graph,
            },
            [TicketInsightsTagsChart.TopUsedTagsChart]: {
                chartComponent: TopUsedTagsChart,
                label: TicketInsightsTagsMetricConfig[
                    TicketInsightsTagsMetric.TopUsedTagsChart
                ].title,
                description:
                    TicketInsightsTagsMetricConfig[
                        TicketInsightsTagsMetric.TopUsedTagsChart
                    ].hint.title,
                csvProducer: null,
                chartType: ChartType.Graph,
            },
        },
    }
