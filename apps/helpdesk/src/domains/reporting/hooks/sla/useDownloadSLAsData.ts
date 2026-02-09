import { useMemo } from 'react'

import { useTimeSeriesPerDimensionReportData } from 'domains/reporting/hooks/common/useTimeSeriesReportData'
import { useTrendReportData } from 'domains/reporting/hooks/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { fetchSatisfiedOrBreachedTicketsTimeSeries } from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import { fetchBreachedSlaTicketsTrend } from 'domains/reporting/hooks/sla/useSLAsTicketsTrends'
import { fetchTicketSlaAchievementRateTrend } from 'domains/reporting/hooks/sla/useTicketSlaAchievementRate'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { TicketSLAStatus } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { SlaMetricConfig } from 'domains/reporting/pages/sla/SlaConfig'
import {
    ACHIEVED_SLA_LABEL,
    ACHIEVEMENT_RATE_LABEL,
    BREACHED_SLA_LABEL,
    DATES_WITHIN_PERIOD_LABEL,
    TICKETS_WITH_BREACHED_SLAS_LABEL,
} from 'domains/reporting/services/constants'
import { createTimeSeriesPerDimensionReport } from 'domains/reporting/services/SLAsReportingService'
import { createTrendReport } from 'domains/reporting/services/supportPerformanceReportingService'
import { SlaMetric } from 'domains/reporting/state/ui/stats/types'

export const SLA_OVERVIEW_FILENAME = 'overview'
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
        metricFormat:
            SlaMetricConfig[SlaMetric.BreachedTicketsRate].metricFormat,
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
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const slaTrends = useTrendReportData(
        cleanStatsFilters,
        userTimezone,
        slaOverviewSource,
    )

    const slaOverviewReport = createTrendReport(
        slaTrends.data,
        getCsvFileNameWithDates(
            cleanStatsFilters.period,
            SLA_OVERVIEW_FILENAME,
        ),
    )

    const achievedOrBreachedSLAsTicketsTimeSeries =
        useTimeSeriesPerDimensionReportData(
            cleanStatsFilters,
            userTimezone,
            granularity,
            slaTrendSource,
        )

    const timeSeriesTrend = createTimeSeriesPerDimensionReport(
        achievedOrBreachedSLAsTicketsTimeSeries.data,
        cleanStatsFilters.period,
    )

    const isLoading = useMemo(() => {
        return Object.values([
            slaTrends,
            achievedOrBreachedSLAsTicketsTimeSeries,
        ]).some((metric) => metric.isFetching)
    }, [achievedOrBreachedSLAsTicketsTimeSeries, slaTrends])

    const files = {
        ...timeSeriesTrend.files,
        ...slaOverviewReport.files,
    }
    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        SLA_REPORT_FILENAME,
    )

    return {
        files,
        fileName,
        isLoading,
    }
}
