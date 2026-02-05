import { useMemo } from 'react'

import { useTimeSeriesPerDimensionReportData } from 'domains/reporting/hooks/common/useTimeSeriesReportData'
import { useTrendReportData } from 'domains/reporting/hooks/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { fetchSatisfiedOrBreachedVoiceCallsTimeSeries } from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedVoiceCallsTimeSeries'
import {
    fetchBreachedSlaVoiceCallsTrend,
    fetchSlaAchievementRateVoiceCallsTrend,
} from 'domains/reporting/hooks/sla/useSLAsVoiceCallsTrends'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { VoiceSlaMetricConfig } from 'domains/reporting/pages/sla/voice/VoiceSlaConfig'
import {
    ACHIEVED_SLA_LABEL,
    ACHIEVEMENT_RATE_LABEL,
    BREACHED_SLA_LABEL,
    CALLS_WITH_BREACHED_SLAS_LABEL,
    DATES_WITHIN_PERIOD_LABEL,
} from 'domains/reporting/services/constants'
import { createTimeSeriesPerDimensionReport } from 'domains/reporting/services/SLAsReportingService'
import { createTrendReport } from 'domains/reporting/services/supportPerformanceReportingService'
import { VoiceSlaMetric } from 'domains/reporting/state/ui/stats/types'

export const SLA_OVERVIEW_FILENAME = 'overview'
export const SLA_TREND_FILENAME = 'trend'
export const SLA_REPORT_FILENAME = 'sla-report'

const slaOverviewSource = [
    {
        fetchTrend: fetchSlaAchievementRateVoiceCallsTrend,
        title: ACHIEVEMENT_RATE_LABEL,
        metricFormat:
            VoiceSlaMetricConfig[VoiceSlaMetric.VoiceCallsAchievementRate]
                .metricFormat,
    },
    {
        fetchTrend: fetchBreachedSlaVoiceCallsTrend,
        title: CALLS_WITH_BREACHED_SLAS_LABEL,
        metricFormat:
            VoiceSlaMetricConfig[VoiceSlaMetric.VoiceCallsBreachedRate]
                .metricFormat,
    },
]

export const slaTrendSource = [
    {
        fetchTimeSeries: fetchSatisfiedOrBreachedVoiceCallsTimeSeries,
        title: SLA_TREND_FILENAME,
        headers: [
            DATES_WITHIN_PERIOD_LABEL,
            ACHIEVED_SLA_LABEL,
            BREACHED_SLA_LABEL,
        ],
        dimensions: ['achieved', 'breached'],
    },
]

export const useDownloadVoiceCallsSLAsData = () => {
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

    const achievedOrBreachedSLAsVoiceCallsTimeSeries =
        useTimeSeriesPerDimensionReportData(
            cleanStatsFilters,
            userTimezone,
            granularity,
            slaTrendSource,
        )

    const timeSeriesTrend = createTimeSeriesPerDimensionReport(
        achievedOrBreachedSLAsVoiceCallsTimeSeries.data,
        cleanStatsFilters.period,
    )

    const isLoading = useMemo(() => {
        return Object.values([
            slaTrends,
            achievedOrBreachedSLAsVoiceCallsTimeSeries,
        ]).some((metric) => metric.isFetching)
    }, [achievedOrBreachedSLAsVoiceCallsTimeSeries, slaTrends])

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
