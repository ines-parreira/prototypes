import { FilterComponentKey, FilterKey, StaticFilter } from 'models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import { ReportsIDs } from 'pages/stats/custom-reports/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import { CustomFieldsTicketCountBreakdownTableChart } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTableChart'
import { TicketDistributionChart } from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable'
import {
    TicketInsightsFieldsMetric,
    TicketInsightsFieldsMetricConfig,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { TicketInsightsFieldTrend } from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldTrend'
import { STATS_ROUTES } from 'routes/constants'
import { fetchCustomFieldsReportData } from 'services/reporting/ticketFieldsReportingService'

export const TICKET_INSIGHTS_PAGE_TITLE = 'Ticket Fields'

export enum TicketFieldsChart {
    TicketDistributionTable = 'ticket-distribution-table',
    TicketInsightsFieldTrend = 'ticket-insights-field-trend',
    CustomFieldsTicketCountBreakdownTableChart = 'custom-fields-ticket-count-breakdown-table-chart',
}

export const TICKET_INSIGHTS_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
    FilterKey.Score,
    ...AUTO_QA_FILTER_KEYS,
]

export const TICKET_INSIGHTS_PERSISTENT_FILTERS = [
    FilterKey.Period,
    FilterComponentKey.CustomField,
    FilterKey.AggregationWindow,
] satisfies StaticFilter[]

export const TicketFieldsReportConfig: ReportConfig<TicketFieldsChart> = {
    id: ReportsIDs.TicketFieldsReportConfig,
    reportName: TICKET_INSIGHTS_PAGE_TITLE,
    reportPath: STATS_ROUTES.TICKET_INSIGHTS_TICKET_FIELDS,
    reportFilters: {
        optional: TICKET_INSIGHTS_OPTIONAL_FILTERS,
        persistent: TICKET_INSIGHTS_PERSISTENT_FILTERS,
    },
    charts: {
        [TicketFieldsChart.TicketDistributionTable]: {
            chartComponent: TicketDistributionChart,
            label: TicketInsightsFieldsMetricConfig[
                TicketInsightsFieldsMetric.TicketDistribution
            ].title,
            description:
                TicketInsightsFieldsMetricConfig[
                    TicketInsightsFieldsMetric.TicketDistribution
                ].hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Table,
                    fetch: fetchCustomFieldsReportData,
                },
            ],
            chartType: ChartType.Graph,
        },
        [TicketFieldsChart.TicketInsightsFieldTrend]: {
            chartComponent: TicketInsightsFieldTrend,
            label: TicketInsightsFieldsMetricConfig[
                TicketInsightsFieldsMetric.TicketInsightsFieldTrend
            ].title,
            description:
                TicketInsightsFieldsMetricConfig[
                    TicketInsightsFieldsMetric.TicketInsightsFieldTrend
                ].hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Table,
                    fetch: fetchCustomFieldsReportData,
                },
            ],
            chartType: ChartType.Graph,
        },
        [TicketFieldsChart.CustomFieldsTicketCountBreakdownTableChart]: {
            chartComponent: CustomFieldsTicketCountBreakdownTableChart,
            label: TicketInsightsFieldsMetricConfig[
                TicketInsightsFieldsMetric.CustomFieldsTicketCountBreakdown
            ].title,
            description:
                TicketInsightsFieldsMetricConfig[
                    TicketInsightsFieldsMetric.CustomFieldsTicketCountBreakdown
                ].hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Table,
                    fetch: fetchCustomFieldsReportData,
                },
            ],
            chartType: ChartType.Table,
        },
    },
}
