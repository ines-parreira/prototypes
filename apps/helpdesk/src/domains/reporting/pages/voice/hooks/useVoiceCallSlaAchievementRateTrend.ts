import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { voiceCallSlaAchievementRateQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { voiceCallsSlaAchievementRateQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useVoiceCallSlaAchievementRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        voiceCallSlaAchievementRateQueryFactory(filters, timezone),
        voiceCallSlaAchievementRateQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
        voiceCallsSlaAchievementRateQueryFactoryV2({
            filters,
            timezone,
        }),
        voiceCallsSlaAchievementRateQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchVoiceCallSlaAchievementRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        voiceCallSlaAchievementRateQueryFactory(filters, timezone),
        voiceCallSlaAchievementRateQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
        voiceCallsSlaAchievementRateQueryFactoryV2({
            filters,
            timezone,
        }),
        voiceCallsSlaAchievementRateQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
