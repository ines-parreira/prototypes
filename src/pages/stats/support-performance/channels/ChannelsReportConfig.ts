import {ReportConfig} from 'pages/stats/common/CustomReport/types'
import {CHARTS_MODAL_ICONS} from 'pages/stats/custom-reports/CustomReportsModal/ChartIcon'
import {
    CHANNEL_PERFORMANCE_TABLE_TITLE,
    ChannelsPerformanceTableChart,
} from 'pages/stats/support-performance/channels/ChannelsPerformanceTableChart'

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
            icon: CHARTS_MODAL_ICONS.table,
        },
    },
}
