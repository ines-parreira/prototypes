import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { responseRateQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/responseRateQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useResponseRateTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        responseRateQueryFactory(filters, timezone),
        responseRateQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export const fetchResponseRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        responseRateQueryFactory(filters, timezone),
        responseRateQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
