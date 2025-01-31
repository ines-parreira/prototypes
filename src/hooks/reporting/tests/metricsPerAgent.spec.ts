import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'

import {TicketChannel} from 'business/types/ticket'
import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
    useTicketsRepliedMetricPerAgent,
    useOneTouchTicketsMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketAverageHandleTimePerAgent,
    fetchOneTouchTicketsMetricPerAgent,
    fetchTicketAverageHandleTimePerAgent,
    fetchOnlineTimePerAgent,
    fetchCustomerSatisfactionMetricPerAgent,
    fetchMedianResolutionTimeMetricPerAgent,
    fetchMessagesSentMetricPerAgent,
    fetchClosedTicketsMetricPerAgent,
    fetchTicketsRepliedMetricPerAgent,
    fetchMedianFirstResponseTimeMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {onlineTimePerAgentQueryFactory} from 'models/reporting/queryFactories/agentxp/onlineTime'
import {ticketAverageHandleTimePerAgentQueryFactory} from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import {closedTicketsPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {medianFirstResponseTimeMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import {medianResolutionTimeMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import {messagesSentMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {oneTouchTicketsPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import {ticketsRepliedMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'

import {LegacyStatsFilters} from 'models/stat/types'

import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

describe('metricsPerAgent', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: LegacyStatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: [TicketChannel.Email, TicketChannel.Chat],
        integrations: [1],
        tags: [1, 2],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc
    const agentId = '2'

    describe('metricsPerAgent', () => {
        it.each([
            [
                'useMedianFirstResponseTimeMetricPerAgent',
                useMedianFirstResponseTimeMetricPerAgent,
                medianFirstResponseTimeMetricPerAgentQueryFactory,
            ],
            [
                'useTicketsRepliedMetricPerAgent',
                useTicketsRepliedMetricPerAgent,
                ticketsRepliedMetricPerAgentQueryFactory,
            ],
            [
                'useClosedTicketsMetricPerAgent',
                useClosedTicketsMetricPerAgent,
                closedTicketsPerAgentQueryFactory,
            ],
            [
                'useMessagesSentMetricPerAgent',
                useMessagesSentMetricPerAgent,
                messagesSentMetricPerAgentQueryFactory,
            ],
            [
                'useMedianResolutionTimeMetricPerAgent',
                useMedianResolutionTimeMetricPerAgent,
                medianResolutionTimeMetricPerAgentQueryFactory,
            ],
            [
                'useCustomerSatisfactionMetricPerAgent',
                useCustomerSatisfactionMetricPerAgent,
                customerSatisfactionMetricPerAgentQueryFactory,
            ],
            [
                'useOnlineTimePerAgent',
                useOnlineTimePerAgent,
                onlineTimePerAgentQueryFactory,
            ],
            [
                'useTicketAverageHandleTimePerAgent',
                useTicketAverageHandleTimePerAgent,
                ticketAverageHandleTimePerAgentQueryFactory,
            ],
            [
                'useOneTouchTicketsMetricPerAgent',
                useOneTouchTicketsMetricPerAgent,
                oneTouchTicketsPerAgentQueryFactory,
            ],
        ])(
            '%s should pass the query to useMetricPerDimension hook',
            (_, useFn, queryFactory) => {
                renderHook(
                    () => useFn(statsFilters, timezone, sorting, agentId),
                    {}
                )

                expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone, sorting),
                    agentId
                )
            }
        )

        it.each([
            [
                'fetchMedianFirstResponseTimeMetricPerAgent',
                fetchMedianFirstResponseTimeMetricPerAgent,
                medianFirstResponseTimeMetricPerAgentQueryFactory,
            ],
            [
                'fetchTicketsRepliedMetricPerAgent',
                fetchTicketsRepliedMetricPerAgent,
                ticketsRepliedMetricPerAgentQueryFactory,
            ],
            [
                'fetchClosedTicketsMetricPerAgent',
                fetchClosedTicketsMetricPerAgent,
                closedTicketsPerAgentQueryFactory,
            ],
            [
                'fetchMessagesSentMetricPerAgent',
                fetchMessagesSentMetricPerAgent,
                messagesSentMetricPerAgentQueryFactory,
            ],
            [
                'fetchMedianResolutionTimeMetricPerAgent',
                fetchMedianResolutionTimeMetricPerAgent,
                medianResolutionTimeMetricPerAgentQueryFactory,
            ],
            [
                'fetchCustomerSatisfactionMetricPerAgent',
                fetchCustomerSatisfactionMetricPerAgent,
                customerSatisfactionMetricPerAgentQueryFactory,
            ],
            [
                'fetchOnlineTimePerAgent',
                fetchOnlineTimePerAgent,
                onlineTimePerAgentQueryFactory,
            ],
            [
                'fetchTicketAverageHandleTimePerAgent',
                fetchTicketAverageHandleTimePerAgent,
                ticketAverageHandleTimePerAgentQueryFactory,
            ],
            [
                'fetchOneTouchTicketsMetricPerAgent',
                fetchOneTouchTicketsMetricPerAgent,
                oneTouchTicketsPerAgentQueryFactory,
            ],
        ])(
            '%s should pass the query to useMetricPerDimension hook',
            async (_, fetchFn, queryFactory) => {
                await fetchFn(statsFilters, timezone, sorting, agentId)

                expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone, sorting),
                    agentId
                )
            }
        )
    })
})
