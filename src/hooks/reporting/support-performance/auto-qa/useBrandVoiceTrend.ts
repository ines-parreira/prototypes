import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {brandVoiceQueryFactory} from 'models/reporting/queryFactories/auto-qa/brandVoiceQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useBrandVoiceTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        brandVoiceQueryFactory(filters, timezone),
        brandVoiceQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const fetchBrandVoiceTrend = (filters: StatsFilters, timezone: string) =>
    fetchMetricTrend(
        brandVoiceQueryFactory(filters, timezone),
        brandVoiceQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )
