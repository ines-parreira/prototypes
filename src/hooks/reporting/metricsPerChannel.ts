import {
    MetricWithDecile,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {ticketAverageHandleTimePerAgentPerChannelQueryFactory} from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import {closedTicketsPerChannelQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionMetricPerChannelQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {medianFirstResponseTimeMetricPerChannelQueryFactory} from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import {medianResolutionTimeMetricPerChannelQueryFactory} from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import {messagesSentMetricPerChannelQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {oneTouchTicketsPerChannelQueryFactory} from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import {ticketsCreatedPerChannelPerChannelQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedMetricPerChannelQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {StatsFilters} from 'models/stat/types'

export type MetricPerChannelQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string
) => MetricWithDecile

export const useMedianFirstResponseTimeMetricPerChannel: MetricPerChannelQueryHook =
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        channel?: string
    ) =>
        useMetricPerDimension(
            medianFirstResponseTimeMetricPerChannelQueryFactory(
                statsFilters,
                timezone,
                sorting
            ),
            channel
        )

export const useTicketsRepliedMetricPerChannel: MetricPerChannelQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string
) =>
    useMetricPerDimension(
        ticketsRepliedMetricPerChannelQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        channel
    )

export const useClosedTicketsMetricPerChannel: MetricPerChannelQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string
) =>
    useMetricPerDimension(
        closedTicketsPerChannelQueryFactory(statsFilters, timezone, sorting),
        channel
    )

export const useCreatedTicketsMetricPerChannel: MetricPerChannelQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string
) =>
    useMetricPerDimension(
        ticketsCreatedPerChannelPerChannelQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        channel
    )

export const useMessagesSentMetricPerChannel: MetricPerChannelQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string
) =>
    useMetricPerDimension(
        messagesSentMetricPerChannelQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        channel
    )

export const useMedianResolutionTimeMetricPerChannel: MetricPerChannelQueryHook =
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        channel?: string
    ) =>
        useMetricPerDimension(
            medianResolutionTimeMetricPerChannelQueryFactory(
                statsFilters,
                timezone,
                sorting
            ),
            channel
        )

export const useCustomerSatisfactionMetricPerChannel: MetricPerChannelQueryHook =
    (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        channel?: string
    ) =>
        useMetricPerDimension(
            customerSatisfactionMetricPerChannelQueryFactory(
                statsFilters,
                timezone,
                sorting
            ),
            channel
        )

export const useOneTouchTicketsMetricPerChannel: MetricPerChannelQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string
) =>
    useMetricPerDimension(
        oneTouchTicketsPerChannelQueryFactory(statsFilters, timezone, sorting),
        channel
    )

export const useTicketAverageHandleTimePerChannel: MetricPerChannelQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string
) =>
    useMetricPerDimension(
        ticketAverageHandleTimePerAgentPerChannelQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        channel
    )
