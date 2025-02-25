import { useMultipleMetricsTrends } from 'hooks/reporting/useMultipleMetricsTrend'
import { ticketsCreatedQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

export const useAllTickets = (filters: StatsFilters, timezone: string) => {
    return useMultipleMetricsTrends(
        ticketsCreatedQueryFactory(filters, timezone),
        ticketsCreatedQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
    )
}
