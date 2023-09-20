import {
    closedTicketsQueryFactory,
    customerSatisfactionQueryFactory,
    firstResponseTimeQueryFactory,
    messagesSentQueryFactory,
    resolutionTimeQueryFactory,
    ticketsRepliedQueryFactory,
} from 'hooks/reporting/metricTrends'
import {useMetric} from 'hooks/reporting/useMetric'
import {StatsFilters} from 'models/stat/types'

export type Metric = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number | null
    }
}

export const useClosedTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => useMetric(closedTicketsQueryFactory(statsFilters, timezone))

export const useCustomerSatisfactionMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => useMetric(customerSatisfactionQueryFactory(statsFilters, timezone))

export const useFirstResponseTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => useMetric(firstResponseTimeQueryFactory(statsFilters, timezone))

export const useResolutionTimeMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => useMetric(resolutionTimeQueryFactory(statsFilters, timezone))

export const useTicketsRepliedMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => useMetric(ticketsRepliedQueryFactory(statsFilters, timezone))

export const useMessagesSentMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => useMetric(messagesSentQueryFactory(statsFilters, timezone))
