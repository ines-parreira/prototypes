import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { closedTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentTicketsClosed'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentClosedTicketsTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return useStatsMetricTrend(
        closedTicketsCountQueryV2Factory({
            filters,
            timezone,
        }),
        closedTicketsCountQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
}

export const fetchAiAgentClosedTicketsTrend = async (
    filters: StatsFilters,
    timezone: string,
) => {
    return fetchStatsMetricTrend(
        closedTicketsCountQueryV2Factory({
            filters,
            timezone,
        }),
        closedTicketsCountQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
}
