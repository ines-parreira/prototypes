import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { totalNumberConverFromAIAgentQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useTotalAIConvTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        totalNumberConverFromAIAgentQueryFactory(filters, timezone),
        totalNumberConverFromAIAgentQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchTotalAIConvTrend = (filters: StatsFilters, timezone: string) =>
    fetchMetricTrend(
        totalNumberConverFromAIAgentQueryFactory(filters, timezone),
        totalNumberConverFromAIAgentQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export { useTotalAIConvTrend, fetchTotalAIConvTrend }
