import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import { ticketsCreatedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAllTickets = (filters: StatsFilters, timezone: string) => {
    return useMultipleMetricsTrends(
        ticketsCreatedQueryFactory(filters, timezone),
        ticketsCreatedQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
    )
}
