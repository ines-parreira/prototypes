import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { totalNumberOfOrderQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useTotalNumberOfOrdersTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        totalNumberOfOrderQueryFactory(filters, timezone),
        totalNumberOfOrderQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchTotalNumberOfOrdersTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        totalNumberOfOrderQueryFactory(filters, timezone),
        totalNumberOfOrderQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export { useTotalNumberOfOrdersTrend, fetchTotalNumberOfOrdersTrend }
