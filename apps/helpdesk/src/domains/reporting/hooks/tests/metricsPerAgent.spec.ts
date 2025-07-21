import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    fetchClosedTicketsMetricPerAgent,
    fetchCustomerSatisfactionMetricPerAgent,
    fetchMedianFirstResponseTimeMetricPerAgent,
    fetchMedianResolutionTimeMetricPerAgent,
    fetchMessagesReceivedMetricPerAgent,
    fetchMessagesSentMetricPerAgent,
    fetchOneTouchTicketsMetricPerAgent,
    fetchOnlineTimePerAgent,
    fetchTicketAverageHandleTimePerAgent,
    fetchTicketsRepliedMetricPerAgent,
    fetchZeroTouchTicketsMetricPerAgent,
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useOneTouchTicketsMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketAverageHandleTimePerAgent,
    useTicketsRepliedMetricPerAgent,
    useZeroTouchTicketsMetricPerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { onlineTimePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { medianFirstResponseTimeMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { messagesReceivedMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsRepliedMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

describe('metricsPerAgent', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: withDefaultLogicalOperator([
            TicketChannel.Email,
            TicketChannel.Chat,
        ]),
        integrations: withDefaultLogicalOperator([1]),
        tags: [
            {
                ...withDefaultLogicalOperator([1, 2]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
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
            [
                'useZeroTouchTicketsMetricPerAgent',
                useZeroTouchTicketsMetricPerAgent,
                zeroTouchTicketsPerAgentQueryFactory,
            ],
        ])(
            '%s should pass the query to useMetricPerDimension hook',
            (_, useFn, queryFactory) => {
                renderHook(
                    () => useFn(statsFilters, timezone, sorting, agentId),
                    {},
                )

                expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone, sorting),
                    agentId,
                )
            },
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
                'fetchMessagesReceivedMetricPerAgent',
                fetchMessagesReceivedMetricPerAgent,
                messagesReceivedMetricPerAgentQueryFactory,
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
            [
                'fetchZeroTouchTicketsMetricPerAgent',
                fetchZeroTouchTicketsMetricPerAgent,
                zeroTouchTicketsPerAgentQueryFactory,
            ],
        ])(
            '%s should pass the query to useMetricPerDimension hook',
            async (_, fetchFn, queryFactory) => {
                await fetchFn(statsFilters, timezone, sorting, agentId)

                expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone, sorting),
                    agentId,
                )
            },
        )
    })
})
