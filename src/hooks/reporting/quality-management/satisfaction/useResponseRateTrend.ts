import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { responseRateQueryFactory } from 'models/reporting/queryFactories/satisfaction/responseRateQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

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
