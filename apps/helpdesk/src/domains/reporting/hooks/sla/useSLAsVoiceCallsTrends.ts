import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    breachedVoiceCallsQueryV2Factory,
    voiceCallsSlaAchievementRateQueryV2Factory,
} from 'domains/reporting/models/scopes/voiceSLA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useBreachedSlaVoiceCallsTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return useStatsMetricTrend(
        breachedVoiceCallsQueryV2Factory({ filters, timezone }),
        breachedVoiceCallsQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
}

export const fetchBreachedSlaVoiceCallsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        breachedVoiceCallsQueryV2Factory({ filters, timezone }),
        breachedVoiceCallsQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const useSlaAchievementRateVoiceCallsTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return useStatsMetricTrend(
        voiceCallsSlaAchievementRateQueryV2Factory({ filters, timezone }),
        voiceCallsSlaAchievementRateQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
}

export const fetchSlaAchievementRateVoiceCallsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        voiceCallsSlaAchievementRateQueryV2Factory({ filters, timezone }),
        voiceCallsSlaAchievementRateQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
