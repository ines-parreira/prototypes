import {useMemo} from 'react'

import {useTimeSeriesReportData} from 'hooks/reporting/common/useTimeSeriesReportData'
import {useTrendReportData} from 'hooks/reporting/common/useTrendReportData'
import {useWorkloadChannelReport} from 'hooks/reporting/support-performance/overview/useWorkloadChannelReport'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {
    OverviewChartConfig,
    OverviewMetric,
    OverviewMetricConfig,
    TimeSeriesMetric,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    getFileNameWithDates,
    createTimeSeriesReport,
    createTrendReport,
} from 'services/reporting/supportPerformanceReportingService'

export const WORKLOAD_REPORT_FILE_NAME = 'workload'
export const TICKET_VOLUME_REPORT_FILE_NAME = 'ticket-volume'
export const CUSTOMER_EXPERIENCE_REPORT_FILE_NAME = 'customer-experience'
export const OVER_VIEW_METRICS_REPORT_FILE_NAME = 'overview-metrics'

const ticketVolumeReportSource = [
    OverviewMetric.CustomerSatisfaction,
    OverviewMetric.MedianFirstResponseTime,
    OverviewMetric.MedianResolutionTime,
    OverviewMetric.MessagesPerTicket,
].map((metric) => OverviewMetricConfig[metric])

const timeSeriesMetrics: TimeSeriesMetric[] = [
    OverviewMetric.TicketsCreated,
    OverviewMetric.TicketsClosed,
    OverviewMetric.TicketsReplied,
    OverviewMetric.MessagesSent,
]

export const timeSeriesReportSource = timeSeriesMetrics.map(
    (metric: TimeSeriesMetric) => OverviewChartConfig[metric]
)

export const workloadReportSource = [
    OverviewMetric.OpenTickets,
    OverviewMetric.TicketsCreated,
    OverviewMetric.TicketsReplied,
    OverviewMetric.TicketsClosed,
    OverviewMetric.MessagesSent,
].map((metric) => OverviewMetricConfig[metric])

export const useDownloadOverViewData = (fetchingEnabled = true) => {
    const {cleanStatsFilters, userTimezone, granularity} = useNewStatsFilters()

    const workloadTrendData = useTrendReportData(
        cleanStatsFilters,
        userTimezone,
        workloadReportSource
    )

    const customerExperienceData = useTrendReportData(
        cleanStatsFilters,
        userTimezone,
        ticketVolumeReportSource
    )

    const timeSeriesData = useTimeSeriesReportData(
        cleanStatsFilters,
        userTimezone,
        granularity,
        timeSeriesReportSource
    )

    const workloadChannelData = useWorkloadChannelReport(
        cleanStatsFilters,
        userTimezone,
        fetchingEnabled
    )

    const loading = useMemo(() => {
        return [
            customerExperienceData,
            workloadTrendData,
            workloadChannelData,
            timeSeriesData,
        ].some((metric) => metric.isFetching)
    }, [
        customerExperienceData,
        timeSeriesData,
        workloadChannelData,
        workloadTrendData,
    ])

    const customerExperienceReport = createTrendReport(
        customerExperienceData.data,
        cleanStatsFilters.period,
        CUSTOMER_EXPERIENCE_REPORT_FILE_NAME
    )
    const workloadReport = createTrendReport(
        [...workloadTrendData.data, ...workloadChannelData.data],
        cleanStatsFilters.period,
        WORKLOAD_REPORT_FILE_NAME
    )
    const ticketVolumeReport = createTimeSeriesReport(
        timeSeriesData.data,
        cleanStatsFilters.period,
        TICKET_VOLUME_REPORT_FILE_NAME
    )
    const fileName = getFileNameWithDates(
        cleanStatsFilters.period,
        OVER_VIEW_METRICS_REPORT_FILE_NAME
    )

    return {
        files: {
            ...customerExperienceReport.files,
            ...workloadReport.files,
            ...ticketVolumeReport.files,
        },
        fileName,
        isLoading: loading,
    }
}
