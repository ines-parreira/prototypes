import {FilterKey} from 'models/stat/types'
import {ChartType, ReportConfig} from 'pages/stats/custom-reports/types'
import {
    CHANNEL_PERFORMANCE_TABLE_TITLE,
    ChannelsPerformanceTableChart,
} from 'pages/stats/support-performance/channels/ChannelsPerformanceTableChart'

export const CHANNEL_REPORT_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
]

export const CHANNELS_REPORT_PAGE_TITLE = 'Channels'

export enum ChannelsChart {
    ChannelsPerformanceTable = 'channels-performance-table',
}

export const ChannelsReportConfig: ReportConfig<ChannelsChart> = {
    reportName: CHANNELS_REPORT_PAGE_TITLE,
    reportPath: 'channels',
    charts: {
        [ChannelsChart.ChannelsPerformanceTable]: {
            chartComponent: ChannelsPerformanceTableChart,
            label: CHANNEL_PERFORMANCE_TABLE_TITLE,
            csvProducer: null,
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
