import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { totalNumberofSalesOpportunityConvFromAIAgentQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useTotalSalesOportunityAIConvTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        totalNumberofSalesOpportunityConvFromAIAgentQueryFactory(
            filters,
            timezone,
        ),
        totalNumberofSalesOpportunityConvFromAIAgentQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchTotalSalesOportunityAIConvTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        totalNumberofSalesOpportunityConvFromAIAgentQueryFactory(
            filters,
            timezone,
        ),
        totalNumberofSalesOpportunityConvFromAIAgentQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export {
    useTotalSalesOportunityAIConvTrend,
    fetchTotalSalesOportunityAIConvTrend,
}
