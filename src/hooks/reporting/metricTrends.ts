import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {OrderDirection} from 'models/api/types'
import {Cubes} from 'models/reporting/cubes'
import {ticketAverageHandleTimeQueryFactory} from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import {closedTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {medianFirstResponseTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import {medianResolutionTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import {messagesPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesPerTicket'
import {messagesSentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {oneTouchTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import {openTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/openTickets'
import {ticketsCreatedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {ticketsRepliedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {zeroTouchTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/zeroTouchTickets'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

type QueryFactory<TCube extends Cubes> = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
) => ReportingQuery<TCube>

export const getTrendFetch =
    <TCube extends Cubes>(query: QueryFactory<TCube>) =>
    (filters: StatsFilters, timezone: string) =>
        fetchMetricTrend(
            query(filters, timezone),
            query(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone
            )
        )

export const getTrendHook =
    <TCube extends Cubes>(query: QueryFactory<TCube>) =>
    (filters: StatsFilters, timezone: string) =>
        useMetricTrend(
            query(filters, timezone),
            query(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone
            )
        )

export const useCustomerSatisfactionTrend = getTrendHook(
    customerSatisfactionQueryFactory
)
export const fetchCustomerSatisfactionTrend = getTrendFetch(
    customerSatisfactionQueryFactory
)

export const useMedianFirstResponseTimeTrend = getTrendHook(
    medianFirstResponseTimeQueryFactory
)

export const fetchMedianFirstResponseTimeTrend = getTrendFetch(
    medianFirstResponseTimeQueryFactory
)

export const useMessagesPerTicketTrend = getTrendHook(
    messagesPerTicketQueryFactory
)

export const fetchMessagesPerTicketTrend = getTrendFetch(
    messagesPerTicketQueryFactory
)

export const useMedianResolutionTimeTrend = getTrendHook(
    medianResolutionTimeQueryFactory
)

export const fetchMedianResolutionTimeTrend = getTrendFetch(
    medianResolutionTimeQueryFactory
)

export const useOpenTicketsTrend = getTrendHook(openTicketsQueryFactory)

export const fetchOpenTicketsTrend = getTrendFetch(openTicketsQueryFactory)

export const useClosedTicketsTrend = getTrendHook(closedTicketsQueryFactory)

export const fetchClosedTicketsTrend = getTrendFetch(closedTicketsQueryFactory)

export const useOneTouchTicketsTrend = getTrendHook(oneTouchTicketsQueryFactory)

export const fetchOneTouchTicketsTrend = getTrendFetch(
    oneTouchTicketsQueryFactory
)

export const useZeroTouchTicketsTrend = getTrendHook(
    zeroTouchTicketsQueryFactory
)

export const fetchZeroTouchTicketsTrend = getTrendFetch(
    zeroTouchTicketsQueryFactory
)

export const useTicketsCreatedTrend = getTrendHook(ticketsCreatedQueryFactory)

export const fetchTicketsCreatedTrend = getTrendFetch(
    ticketsCreatedQueryFactory
)

export const useTicketsRepliedTrend = getTrendHook(ticketsRepliedQueryFactory)

export const fetchTicketsRepliedTrend = getTrendFetch(
    ticketsRepliedQueryFactory
)

export const useMessagesSentTrend = getTrendHook(messagesSentQueryFactory)

export const fetchMessagesSentTrend = getTrendFetch(messagesSentQueryFactory)

export const useTicketHandleTimeTrend = getTrendHook(
    ticketAverageHandleTimeQueryFactory
)

export const fetchTicketHandleTimeTrend = getTrendFetch(
    ticketAverageHandleTimeQueryFactory
)
