import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { voiceCallsAchievedExposuresQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAchievedExposuresVoiceCallsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        voiceCallsAchievedExposuresQueryFactoryV2({ filters, timezone }),
        voiceCallsAchievedExposuresQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchAchievedExposuresVoiceCallsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        voiceCallsAchievedExposuresQueryFactoryV2({ filters, timezone }),
        voiceCallsAchievedExposuresQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
