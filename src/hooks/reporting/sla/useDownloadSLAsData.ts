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
import {
    ACHIEVED_SLA_LABEL,
    ACHIEVEMENT_RATE_LABEL,
    BREACHED_SLA_LABEL,
    DATES_WITHIN_PERIOD_LABEL,
    TICKETS_WITH_BREACHED_SLAS_LABEL,
} from 'services/reporting/constants'
import {createTimeSeriesPerDimensionReport} from 'services/reporting/SLAsReportingService'
import {createTrendReport} from 'services/reporting/supportPerformanceReportingService'

export const SLA_OVERVIEW_FILENAME = 'overview'
export const SLA_TICKETS_IN_POLICY_FILENAME = 'tickets-in-policy'
export const SLA_TREND_FILENAME = 'trend'
export const SLA_REPORT_FILENAME = 'sla-report'

const slaOverviewSource = [
    {
        fetchTrend: fetchTicketSlaAchievementRateTrend,
        title: ACHIEVEMENT_RATE_LABEL,
    },
    {
        fetchTrend: fetchBreachedSlaTicketsTrend,
        title: TICKETS_WITH_BREACHED_SLAS_LABEL,
    },
]
const slaTicketsInPolicySource = [
    {fetchTrend: fetchBreachedSlaTicketsTrend, title: BREACHED_SLA_LABEL},
    {fetchTrend: fetchSatisfiedSlaTicketsTrend, title: ACHIEVED_SLA_LABEL},
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
