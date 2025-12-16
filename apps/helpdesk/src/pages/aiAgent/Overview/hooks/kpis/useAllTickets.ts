import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { ticketsCreatedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { createdTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsCreated'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAllTickets = (filters: StatsFilters, timezone: string) => {
    return useMetricTrend(
        ticketsCreatedQueryFactory(filters, timezone),
        ticketsCreatedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        createdTicketsCountQueryV2Factory({
            filters,
            timezone,
        }),
        createdTicketsCountQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
}
