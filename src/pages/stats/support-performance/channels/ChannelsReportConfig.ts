import {fetchChannelsTableReportData} from 'hooks/reporting/support-performance/channels/useChannelsReportMetrics'
import {FilterKey} from 'models/stat/types'
import {AUTO_QA_FILTER_KEYS} from 'pages/stats/common/filters/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import {
    CHANNEL_PERFORMANCE_TABLE_TITLE,
    ChannelsPerformanceTableChart,
} from 'pages/stats/support-performance/channels/ChannelsPerformanceTableChart'
import {STATS_ROUTES} from 'routes/constants'

export const CHANNEL_REPORT_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
    FilterKey.Score,
    ...AUTO_QA_FILTER_KEYS,
]

export const CHANNELS_REPORT_PAGE_TITLE = 'Channels'

export enum ChannelsChart {
    ChannelsPerformanceTable = 'channels-performance-table',
}

export const ChannelsReportConfig: ReportConfig<ChannelsChart> = {
    reportName: CHANNELS_REPORT_PAGE_TITLE,
    reportPath: STATS_ROUTES.SUPPORT_PERFORMANCE_CHANNELS,
    charts: {
        [ChannelsChart.ChannelsPerformanceTable]: {
            chartComponent: ChannelsPerformanceTableChart,
            label: CHANNEL_PERFORMANCE_TABLE_TITLE,
            csvProducer: [
                {
                    type: DataExportFormat.Table,
                    fetch: fetchChannelsTableReportData,
                },
            ],
            description:
                'Selected metrics broken by channel (e.g Closed tickets, CSAT, FRT, Ticket Handle Time...)',
            chartType: ChartType.Table,
        },
    },
    reportFilters: {
        persistent: [FilterKey.Period],
        optional: CHANNEL_REPORT_OPTIONAL_FILTERS,
    },
}
