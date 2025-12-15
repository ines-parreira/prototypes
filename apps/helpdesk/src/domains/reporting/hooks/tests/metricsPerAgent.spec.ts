import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    fetchClosedTicketsMetricPerAgent,
    fetchCustomerSatisfactionMetricPerAgent,
    fetchHumanResponseTimeAfterAiHandoffPerAgent,
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
    useHumanResponseTimeAfterAiHandoffPerAgent,
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
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { onlineTimePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { humanResponseTimeAfterAiHandoffPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import { medianFirstAgentResponseTimePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { messagesReceivedMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsRepliedMetricPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { customerSatisfactionPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/customerSatisfaction'
import { medianFirstResponseTimePerAgentQueryV2Factory } from 'domains/reporting/models/scopes/firstResponseTime'
import { humanResponseTimeAfterAiHandoffPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import { messagesReceivedPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/messagesReceived'
import { sentMessagesPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/messagesSent'
import { oneTouchTicketsPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/oneTouchTickets'
import { onlineTimePerAgentQueryV2Factory } from 'domains/reporting/models/scopes/onlineTime'
import { medianResolutionTimePerAgentQueryV2Factory } from 'domains/reporting/models/scopes/resolutionTime'
import { ticketAverageHandleTimePerAgentQueryV2Factory } from 'domains/reporting/models/scopes/ticketHandleTime'
import { closedTicketsPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/ticketsClosed'
import { ticketsRepliedCountPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/ticketsReplied'
import { zeroTouchTicketsPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/zeroTouchTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionMockV2 = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

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
        describe('useMedianFirstResponseTimeMetricPerAgent', () => {
            it('calls medianFirstAgentResponseTimePerAgentQueryFactory', () => {
                renderHook(() =>
                    useMedianFirstResponseTimeMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId,
                    ),
                )

                expect(useMetricPerDimensionMockV2).toHaveBeenCalledWith(
                    medianFirstAgentResponseTimePerAgentQueryFactory(
                        statsFilters,
                        timezone,
                        sorting,
                    ),
                    medianFirstResponseTimePerAgentQueryV2Factory({
                        filters: statsFilters,
                        timezone,
                        sortDirection: sorting,
                    }),
                    agentId,
                )
            })
        })

        describe('fetchMedianFirstResponseTimeMetricPerAgent', () => {
            it('calls medianFirstAgentResponseTimePerAgentQueryFactory', async () => {
                await fetchMedianFirstResponseTimeMetricPerAgent(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId,
                )

                expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                    medianFirstAgentResponseTimePerAgentQueryFactory(
                        statsFilters,
                        timezone,
                        sorting,
                    ),
                    medianFirstResponseTimePerAgentQueryV2Factory({
                        filters: statsFilters,
                        timezone,
                        sortDirection: sorting,
                    }),
                    agentId,
                )
            })
        })

        it.each([
            [
                'useHumanResponseTimeAfterAiHandoffPerAgent',
                useHumanResponseTimeAfterAiHandoffPerAgent,
                humanResponseTimeAfterAiHandoffPerAgentQueryFactory,
                humanResponseTimeAfterAiHandoffPerAgentQueryV2Factory,
            ],
            [
                'useTicketsRepliedMetricPerAgent',
                useTicketsRepliedMetricPerAgent,
                ticketsRepliedMetricPerAgentQueryFactory,
                ticketsRepliedCountPerAgentQueryV2Factory,
            ],
            [
                'useClosedTicketsMetricPerAgent',
                useClosedTicketsMetricPerAgent,
                closedTicketsPerAgentQueryFactory,
                closedTicketsPerAgentQueryV2Factory,
            ],
            [
                'useMessagesSentMetricPerAgent',
                useMessagesSentMetricPerAgent,
                messagesSentMetricPerAgentQueryFactory,
                sentMessagesPerAgentQueryV2Factory,
            ],
            [
                'useMedianResolutionTimeMetricPerAgent',
                useMedianResolutionTimeMetricPerAgent,
                medianResolutionTimeMetricPerAgentQueryFactory,
                medianResolutionTimePerAgentQueryV2Factory,
            ],
            [
                'useCustomerSatisfactionMetricPerAgent',
                useCustomerSatisfactionMetricPerAgent,
                customerSatisfactionMetricPerAgentQueryFactory,
                customerSatisfactionPerAgentQueryV2Factory,
            ],
            [
                'useOnlineTimePerAgent',
                useOnlineTimePerAgent,
                onlineTimePerAgentQueryFactory,
                onlineTimePerAgentQueryV2Factory,
            ],
            [
                'useTicketAverageHandleTimePerAgent',
                useTicketAverageHandleTimePerAgent,
                ticketAverageHandleTimePerAgentQueryFactory,
                ticketAverageHandleTimePerAgentQueryV2Factory,
            ],
            [
                'useOneTouchTicketsMetricPerAgent',
                useOneTouchTicketsMetricPerAgent,
                oneTouchTicketsPerAgentQueryFactory,
                oneTouchTicketsPerAgentQueryV2Factory,
            ],
            [
                'useZeroTouchTicketsMetricPerAgent',
                useZeroTouchTicketsMetricPerAgent,
                zeroTouchTicketsPerAgentQueryFactory,
                zeroTouchTicketsPerAgentQueryV2Factory,
            ],
        ])(
            '%s should pass the query to useMetricPerDimension hook',
            (_, useFn, queryFactory, newQueryFactory) => {
                renderHook(
                    () => useFn(statsFilters, timezone, sorting, agentId),
                    {},
                )

                if (!newQueryFactory) {
                    expect(useMetricPerDimensionMockV2).toHaveBeenCalledWith(
                        queryFactory(statsFilters, timezone, sorting),
                        undefined,
                        agentId,
                    )
                } else {
                    expect(useMetricPerDimensionMockV2).toHaveBeenCalledWith(
                        queryFactory(statsFilters, timezone, sorting),
                        newQueryFactory({
                            filters: statsFilters,
                            timezone,
                            sortDirection: sorting,
                        }),
                        agentId,
                    )
                }
            },
        )

        it.each([
            [
                'fetchHumanResponseTimeAfterAiHandoffPerAgent',
                fetchHumanResponseTimeAfterAiHandoffPerAgent,
                humanResponseTimeAfterAiHandoffPerAgentQueryFactory,
                humanResponseTimeAfterAiHandoffPerAgentQueryV2Factory,
            ],
            [
                'fetchTicketsRepliedMetricPerAgent',
                fetchTicketsRepliedMetricPerAgent,
                ticketsRepliedMetricPerAgentQueryFactory,
                ticketsRepliedCountPerAgentQueryV2Factory,
            ],
            [
                'fetchClosedTicketsMetricPerAgent',
                fetchClosedTicketsMetricPerAgent,
                closedTicketsPerAgentQueryFactory,
                closedTicketsPerAgentQueryV2Factory,
            ],
            [
                'fetchMessagesSentMetricPerAgent',
                fetchMessagesSentMetricPerAgent,
                messagesSentMetricPerAgentQueryFactory,
                sentMessagesPerAgentQueryV2Factory,
            ],
            [
                'fetchMessagesReceivedMetricPerAgent',
                fetchMessagesReceivedMetricPerAgent,
                messagesReceivedMetricPerAgentQueryFactory,
                messagesReceivedPerAgentQueryV2Factory,
            ],
            [
                'fetchMedianResolutionTimeMetricPerAgent',
                fetchMedianResolutionTimeMetricPerAgent,
                medianResolutionTimeMetricPerAgentQueryFactory,
                medianResolutionTimePerAgentQueryV2Factory,
            ],
            [
                'fetchCustomerSatisfactionMetricPerAgent',
                fetchCustomerSatisfactionMetricPerAgent,
                customerSatisfactionMetricPerAgentQueryFactory,
                customerSatisfactionPerAgentQueryV2Factory,
            ],
            [
                'fetchOnlineTimePerAgent',
                fetchOnlineTimePerAgent,
                onlineTimePerAgentQueryFactory,
                onlineTimePerAgentQueryV2Factory,
            ],
            [
                'fetchTicketAverageHandleTimePerAgent',
                fetchTicketAverageHandleTimePerAgent,
                ticketAverageHandleTimePerAgentQueryFactory,
                ticketAverageHandleTimePerAgentQueryV2Factory,
            ],
            [
                'fetchOneTouchTicketsMetricPerAgent',
                fetchOneTouchTicketsMetricPerAgent,
                oneTouchTicketsPerAgentQueryFactory,
                oneTouchTicketsPerAgentQueryV2Factory,
            ],
            [
                'fetchZeroTouchTicketsMetricPerAgent',
                fetchZeroTouchTicketsMetricPerAgent,
                zeroTouchTicketsPerAgentQueryFactory,
                zeroTouchTicketsPerAgentQueryV2Factory,
            ],
        ])(
            '%s should pass the query to useMetricPerDimension hook',
            async (_, fetchFn, queryFactory, newQueryFactory) => {
                await fetchFn(statsFilters, timezone, sorting, agentId)

                expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone, sorting),
                    newQueryFactory?.({
                        filters: statsFilters,
                        timezone,
                        sortDirection: sorting,
                    }),
                    agentId,
                )
            },
        )
    })
})
