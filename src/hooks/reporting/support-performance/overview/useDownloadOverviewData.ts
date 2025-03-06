import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'

import { FeatureFlagKey } from 'config/featureFlags'
import { useDistributionTrendReportData } from 'hooks/reporting/common/useDistributionTrendReportData'
import { useTimeSeriesReportData } from 'hooks/reporting/common/useTimeSeriesReportData'
import { useTrendReportData } from 'hooks/reporting/common/useTrendReportData'
import {
    fetchWorkloadPerChannelDistribution,
    fetchWorkloadPerChannelDistributionForPreviousPeriod,
    MetricPerDimensionFetch,
} from 'hooks/reporting/distributions'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { Period } from 'models/stat/types'
import { MetricTrendFormat } from 'pages/stats/common/utils'
import {
    OverviewChartConfig,
    OverviewMetric,
    OverviewMetricConfig,
    TimeSeriesMetric,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    DATE_TIME_FORMAT,
    WORKLOAD_BY_CHANNEL_LABEL,
} from 'services/reporting/constants'
import {
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
    (metric: TimeSeriesMetric) => OverviewChartConfig[metric],
)

export const getWorkloadReportSource = (
    isReportingZeroTouchTicketsMetricEnabled: boolean,
    isReportingMessagesReceivedMetricEnabled: boolean,
) => {
    const workloadReportSource = [
        OverviewMetric.OpenTickets,
        OverviewMetric.TicketsCreated,
        OverviewMetric.TicketsReplied,
        OverviewMetric.TicketsClosed,
        OverviewMetric.MessagesSent,
        OverviewMetric.OneTouchTickets,
    ]

    if (isReportingZeroTouchTicketsMetricEnabled) {
        workloadReportSource.push(OverviewMetric.ZeroTouchTickets)
    }
    if (isReportingMessagesReceivedMetricEnabled) {
        workloadReportSource.push(OverviewMetric.MessagesReceived)
    }

    return workloadReportSource.map((metric) => OverviewMetricConfig[metric])
}

export const getCsvFileNameWithDates = (period: Period, reportName: string) => {
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return `${periodPrefix}-${reportName}-${export_datetime}.csv`
}

export const useDownloadOverViewData = (fetchingEnabled = true) => {
    const isReportingZeroTouchTicketsMetricEnabled =
        useFlags()[FeatureFlagKey.ReportingZeroTouchTicketsMetric]
    const isReportingMessagesReceivedMetricEnabled =
        useFlags()[FeatureFlagKey.ReportingMessagesReceivedMetric]

    const { cleanStatsFilters, userTimezone, granularity } =
        useNewStatsFilters()

    const workloadReportSource = useMemo(
        () =>
            getWorkloadReportSource(
                isReportingZeroTouchTicketsMetricEnabled,
                isReportingMessagesReceivedMetricEnabled,
            ),
        [
            isReportingZeroTouchTicketsMetricEnabled,
            isReportingMessagesReceivedMetricEnabled,
        ],
    )

    const workloadTrendData = useTrendReportData(
        cleanStatsFilters,
        userTimezone,
        workloadReportSource,
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
