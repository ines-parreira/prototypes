import {useMemo} from 'react'

import {useTimeSeriesPerDimensionReportData} from 'hooks/reporting/common/useTimeSeriesReportData'
import {useTrendReportData} from 'hooks/reporting/common/useTrendReportData'
import {fetchSatisfiedOrBreachedTicketsTimeSeries} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import {
    fetchBreachedSlaTicketsTrend,
    fetchSatisfiedSlaTicketsTrend,
} from 'hooks/reporting/sla/useSLAsTicketsTrends'
import {fetchTicketSlaAchievementRateTrend} from 'hooks/reporting/sla/useTicketSlaAchievementRate'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {SlaMetricConfig} from 'pages/stats/sla/SlaConfig'
import {
    ACHIEVED_SLA_LABEL,
    ACHIEVEMENT_RATE_LABEL,
    BREACHED_SLA_LABEL,
    DATES_WITHIN_PERIOD_LABEL,
    TICKETS_WITH_BREACHED_SLAS_LABEL,
} from 'services/reporting/constants'
import {createTimeSeriesPerDimensionReport} from 'services/reporting/SLAsReportingService'
import {createTrendReport} from 'services/reporting/supportPerformanceReportingService'
import {SlaMetric} from 'state/ui/stats/types'

export const SLA_OVERVIEW_FILENAME = 'overview'
export const SLA_TICKETS_IN_POLICY_FILENAME = 'tickets-in-policy'
export const SLA_TREND_FILENAME = 'trend'
export const SLA_REPORT_FILENAME = 'sla-report'

const slaOverviewSource = [
    {
        fetchTrend: fetchTicketSlaAchievementRateTrend,
        title: ACHIEVEMENT_RATE_LABEL,
        metricFormat: SlaMetricConfig[SlaMetric.AchievementRate].metricFormat,
    },
    {
        fetchTrend: fetchBreachedSlaTicketsTrend,
        title: TICKETS_WITH_BREACHED_SLAS_LABEL,
        metricFormat: SlaMetricConfig[SlaMetric.AchievementRate].metricFormat,
    },
]
const slaTicketsInPolicySource = [
    {
        fetchTrend: fetchBreachedSlaTicketsTrend,
        metricFormat: SlaMetricConfig[SlaMetric.AchievementRate].metricFormat,
        title: BREACHED_SLA_LABEL,
    },
    {
        fetchTrend: fetchSatisfiedSlaTicketsTrend,
        metricFormat: SlaMetricConfig[SlaMetric.AchievementRate].metricFormat,
        title: ACHIEVED_SLA_LABEL,
    },
]
export const slaTrendSource = [
    {
        fetchTimeSeries: fetchSatisfiedOrBreachedTicketsTimeSeries,
        title: SLA_TREND_FILENAME,
        headers: [
            DATES_WITHIN_PERIOD_LABEL,
            BREACHED_SLA_LABEL,
            ACHIEVED_SLA_LABEL,
        ],
        dimensions: [TicketSLAStatus.Breached, TicketSLAStatus.Satisfied],
    },
]

export const useDownloadSLAsData = () => {
    const {cleanStatsFilters, userTimezone, granularity} = useNewStatsFilters()

    const slaTrends = useTrendReportData(
        cleanStatsFilters,
        userTimezone,
        slaOverviewSource
    )

    const slaTicketsInPolicy = useTrendReportData(
        cleanStatsFilters,
        userTimezone,
        slaTicketsInPolicySource
    )

    const slaOverviewReport = createTrendReport(
        slaTrends.data,
        getCsvFileNameWithDates(cleanStatsFilters.period, SLA_OVERVIEW_FILENAME)
    )

    const slaTicketsInPolicyReport = createTrendReport(
        slaTicketsInPolicy.data,
        getCsvFileNameWithDates(
            cleanStatsFilters.period,
            SLA_TICKETS_IN_POLICY_FILENAME
        )
    )

    const achievedOrBreachedSLAsTicketsTimeSeries =
        useTimeSeriesPerDimensionReportData(
            cleanStatsFilters,
            userTimezone,
            granularity,
            slaTrendSource
        )

    const timeSeriesTrend = createTimeSeriesPerDimensionReport(
        achievedOrBreachedSLAsTicketsTimeSeries.data,
        cleanStatsFilters.period
    )

    const isLoading = useMemo(() => {
        return Object.values([
            slaTrends,
            slaTicketsInPolicy,
            achievedOrBreachedSLAsTicketsTimeSeries,
        ]).some((metric) => metric.isFetching)
    }, [achievedOrBreachedSLAsTicketsTimeSeries, slaTicketsInPolicy, slaTrends])

    const files = {
        ...timeSeriesTrend.files,
        ...slaOverviewReport.files,
        ...slaTicketsInPolicyReport.files,
    }
    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        SLA_REPORT_FILENAME
    )

    return {
        files,
        fileName,
        isLoading,
    }
}
