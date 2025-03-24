import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { gmvInfluencedQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useGmvInfluencedTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        gmvInfluencedQueryFactory(filters, timezone),
        gmvInfluencedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchGmvInfluencedTrend = (filters: StatsFilters, timezone: string) =>
    fetchMetricTrend(
        gmvInfluencedQueryFactory(filters, timezone),
        gmvInfluencedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export { useGmvInfluencedTrend, fetchGmvInfluencedTrend }
