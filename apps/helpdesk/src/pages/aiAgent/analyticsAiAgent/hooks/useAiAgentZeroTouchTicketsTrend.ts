import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { zeroTouchTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentTicketsClosed'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentZeroTouchTicketsTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return useStatsMetricTrend(
        zeroTouchTicketsCountQueryV2Factory({
            filters,
            timezone,
        }),
        zeroTouchTicketsCountQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
}

export const fetchAiAgentZeroTouchTicketsTrend = async (
    filters: StatsFilters,
    timezone: string,
) => {
    return fetchStatsMetricTrend(
        zeroTouchTicketsCountQueryV2Factory({
            filters,
            timezone,
        }),
        zeroTouchTicketsCountQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
}
