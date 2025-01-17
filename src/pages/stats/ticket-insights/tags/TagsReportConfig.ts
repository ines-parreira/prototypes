import {FilterKey, StaticFilter} from 'models/stat/types'
import {ChartType, ReportConfig} from 'pages/stats/custom-reports/types'
import {AllUsedTagsTableChart} from 'pages/stats/ticket-insights/tags/AllUsedTagsTableChart'
import {
    TicketInsightsTagsMetric,
    TicketInsightsTagsMetricConfig,
} from 'pages/stats/ticket-insights/tags/TagsMetricConfig'
import {TagsTrendChart} from 'pages/stats/ticket-insights/tags/TagsTrendChart'
import {TopUsedTagsChart} from 'pages/stats/ticket-insights/tags/TopUsedTagsChart'

export const TAGS_OPTIONAL_FILTERS = [
    FilterKey.Agents,
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.CustomFields,
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
        reportName: TAGS_TITLE,
        reportPath: 'tags',
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
                csvProducer: null,
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
