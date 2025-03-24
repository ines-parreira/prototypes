import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { totalNumberOfAutomatedConversationQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useTotalNumberOfAgentConverationsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        totalNumberOfAutomatedConversationQueryFactory(filters, timezone),
        totalNumberOfAutomatedConversationQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchTotalNumberOfAgentConverationsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        totalNumberOfAutomatedConversationQueryFactory(filters, timezone),
        totalNumberOfAutomatedConversationQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export {
    useTotalNumberOfAgentConverationsTrend,
    fetchTotalNumberOfAgentConverationsTrend,
}
