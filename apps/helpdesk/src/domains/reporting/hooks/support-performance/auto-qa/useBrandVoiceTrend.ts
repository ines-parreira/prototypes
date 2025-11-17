import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { brandVoiceQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/brandVoiceQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useBrandVoiceTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        brandVoiceQueryFactory(filters, timezone),
        brandVoiceQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export const fetchBrandVoiceTrend = (filters: StatsFilters, timezone: string) =>
    fetchMetricTrend(
        brandVoiceQueryFactory(filters, timezone),
        brandVoiceQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
