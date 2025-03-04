import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { gmvQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useGmvTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        gmvQueryFactory(filters, timezone),
        gmvQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchGmvTrend = (filters: StatsFilters, timezone: string) =>
    fetchMetricTrend(
        gmvQueryFactory(filters, timezone),
        gmvQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export { useGmvTrend, fetchGmvTrend }
