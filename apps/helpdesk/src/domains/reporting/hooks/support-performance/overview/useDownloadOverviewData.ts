import { useMemo } from 'react'

import { useDistributionTrendReportData } from 'domains/reporting/hooks/common/useDistributionTrendReportData'
import { useTimeSeriesReportData } from 'domains/reporting/hooks/common/useTimeSeriesReportData'
import { useTrendReportData } from 'domains/reporting/hooks/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type { MetricPerDimensionFetch } from 'domains/reporting/hooks/distributions'
import {
    fetchWorkloadPerChannelDistribution,
    fetchWorkloadPerChannelDistributionForPreviousPeriod,
} from 'domains/reporting/hooks/distributions'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useIsHrtAiEnabled } from 'domains/reporting/hooks/useIsHrtAiEnabled'
import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import type { TimeSeriesMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChartConfig,
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { WORKLOAD_BY_CHANNEL_LABEL } from 'domains/reporting/services/constants'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'domains/reporting/services/supportPerformanceReportingService'

export const WORKLOAD_REPORT_FILE_NAME = 'workload'
export const TICKET_VOLUME_REPORT_FILE_NAME = 'ticket-volume'
export const CUSTOMER_EXPERIENCE_REPORT_FILE_NAME = 'customer-experience'
export const OVER_VIEW_METRICS_REPORT_FILE_NAME = 'overview-metrics'

const timeSeriesMetrics: TimeSeriesMetric[] = [
    OverviewMetric.TicketsCreated,
    OverviewMetric.TicketsClosed,
    OverviewMetric.TicketsReplied,
    OverviewMetric.MessagesSent,
]

export const timeSeriesReportSource = timeSeriesMetrics.map(
    (metric: TimeSeriesMetric) => OverviewChartConfig[metric],
)

const workloadReportMetrics = [
    OverviewMetric.OpenTickets,
    OverviewMetric.TicketsCreated,
    OverviewMetric.TicketsReplied,
    OverviewMetric.TicketsClosed,
    OverviewMetric.MessagesSent,
    OverviewMetric.OneTouchTickets,
    OverviewMetric.ZeroTouchTickets,
    OverviewMetric.MessagesReceived,
    OverviewMetric.MedianResponseTime,
]

export const workloadReportSources = workloadReportMetrics.map(
    (metric) => OverviewMetricConfig[metric],
)

function insertAt<T>(arr: T[], item: T, idx: number): void {
    arr.splice(idx, 0, item)
}

export const useDownloadOverViewData = (fetchingEnabled = true) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const isHrtAiEnabled = useIsHrtAiEnabled()

    const ticketVolumeReportSource = useMemo(() => {
        const metricNames = [
            OverviewMetric.CustomerSatisfaction,
            OverviewMetric.MedianFirstResponseTime,
            OverviewMetric.MedianResolutionTime,
            OverviewMetric.MessagesPerTicket,
        ]

        if (isHrtAiEnabled) {
            insertAt(
                metricNames,
                OverviewMetric.HumanResponseTimeAfterAiHandoff,
                metricNames.indexOf(OverviewMetric.MedianFirstResponseTime) + 1,
            )
        }

        return metricNames.map((metric) => OverviewMetricConfig[metric])
    }, [isHrtAiEnabled])

    const workloadTrendData = useTrendReportData(
        cleanStatsFilters,
        userTimezone,
        workloadReportSources,
    )

    const customerExperienceData = useTrendReportData(
        cleanStatsFilters,
        userTimezone,
        ticketVolumeReportSource,
    )

    const timeSeriesData = useTimeSeriesReportData(
        cleanStatsFilters,
        userTimezone,
        granularity,
        timeSeriesReportSource,
    )

    const workloadPerChannelDataSourceRuntime: {
        fetchCurrentDistribution: MetricPerDimensionFetch
        fetchPreviousDistribution: MetricPerDimensionFetch
        labelPrefix: string
        metricFormat: MetricTrendFormat
    } = useMemo(
        () => ({
            fetchCurrentDistribution: fetchWorkloadPerChannelDistribution,
            fetchPreviousDistribution: fetchingEnabled
                ? fetchWorkloadPerChannelDistributionForPreviousPeriod
                : () => Promise.resolve({ data: [] }),
            metricFormat: 'decimal',
            labelPrefix: WORKLOAD_BY_CHANNEL_LABEL,
        }),
        [fetchingEnabled],
    )

    const workloadChannelData = useDistributionTrendReportData(
        cleanStatsFilters,
        userTimezone,
        workloadPerChannelDataSourceRuntime,
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
        getCsvFileNameWithDates(
            cleanStatsFilters.period,
            CUSTOMER_EXPERIENCE_REPORT_FILE_NAME,
        ),
    )
    const workloadReport = createTrendReport(
        [...workloadTrendData.data, ...workloadChannelData.data],
        getCsvFileNameWithDates(
            cleanStatsFilters.period,
            WORKLOAD_REPORT_FILE_NAME,
        ),
    )
    const ticketVolumeReport = createTimeSeriesReport(
        timeSeriesData.data,
        getCsvFileNameWithDates(
            cleanStatsFilters.period,
            TICKET_VOLUME_REPORT_FILE_NAME,
        ),
    )
    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        OVER_VIEW_METRICS_REPORT_FILE_NAME,
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
