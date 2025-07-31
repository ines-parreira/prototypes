import { FilterKey, StaticFilter } from 'domains/reporting/models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'domains/reporting/pages/dashboards/types'
import { AllUsedTagsTableChart } from 'domains/reporting/pages/ticket-insights/tags/AllUsedTagsTableChart'
import {
    TicketInsightsTagsMetric,
    TicketInsightsTagsMetricConfig,
} from 'domains/reporting/pages/ticket-insights/tags/TagsMetricConfig'
import { TagsTrendChart } from 'domains/reporting/pages/ticket-insights/tags/TagsTrendChart'
import { TopUsedTagsChart } from 'domains/reporting/pages/ticket-insights/tags/TopUsedTagsChart'
import { fetchTagsReportData } from 'domains/reporting/services/tagsReportingService'
import { STATS_ROUTES } from 'routes/constants'

export const TAGS_OPTIONAL_FILTERS = [
    FilterKey.Agents,
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.CustomFields,
    FilterKey.Score,
    FilterKey.Stores,
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
