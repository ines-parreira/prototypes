import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    fetchClosedTicketsMetricPerChannel,
    fetchCreatedTicketsMetricPerChannel,
    fetchCustomerSatisfactionMetricPerChannel,
    fetchMedianFirstResponseTimeMetricPerChannel,
    fetchMedianResolutionTimeMetricPerChannel,
    fetchMessagesSentMetricPerChannel,
    fetchOneTouchTicketsMetricPerChannel,
    fetchTicketAverageHandleTimePerChannel,
    fetchTicketsRepliedMetricPerChannel,
    fetchZeroTouchTicketsMetricPerChannel,
    useClosedTicketsMetricPerChannel,
    useCreatedTicketsMetricPerChannel,
    useCustomerSatisfactionMetricPerChannel,
    useMedianFirstResponseTimeMetricPerChannel,
    useMedianResolutionTimeMetricPerChannel,
    useMessagesSentMetricPerChannel,
    useOneTouchTicketsMetricPerChannel,
    useTicketAverageHandleTimePerChannel,
    useTicketsRepliedMetricPerChannel,
    useZeroTouchTicketsMetricPerChannel,
} from 'domains/reporting/hooks/support-performance/channels/metricsPerChannel'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { ticketAverageHandleTimePerAgentPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { medianFirstAgentResponseTimePerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { messagesSentMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedPerChannelPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedMetricPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerChannelQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { medianFirstResponseTimePerChannelQueryV2Factory } from 'domains/reporting/models/scopes/firstResponseTime'
import { sentMessagesPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/messagesSent'
import { oneTouchTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/oneTouchTickets'
import { medianResolutionTimePerChannelQueryV2Factory } from 'domains/reporting/models/scopes/resolutionTime'
import { ticketAverageHandleTimePerAgentPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketHandleTime'
import { closedTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketsClosed'
import { createdTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketsCreated'
import { ticketsRepliedCountPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/ticketsReplied'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

describe('metricsPerChannel', () => {
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
    const channel = 'someChannel'

    describe('useMedianFirstResponseTimeMetricPerChannel', () => {
        it('calls medianFirstAgentResponseTimePerChannelQueryFactory', () => {
            renderHook(
                () =>
                    useMedianFirstResponseTimeMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        channel,
                    ),
                {},
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                medianFirstAgentResponseTimePerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                ),
                medianFirstResponseTimePerChannelQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: sorting,
                }),
                channel,
            )
        })

        describe('fetchMedianFirstResponseTimeMetricPerChannel', () => {
            it('calls medianFirstAgentResponseTimePerChannelQueryFactory when false', async () => {
                await fetchMedianFirstResponseTimeMetricPerChannel(
                    statsFilters,
                    timezone,
                    sorting,
                    channel,
                )

                expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                    medianFirstAgentResponseTimePerChannelQueryFactory(
                        statsFilters,
                        timezone,
                        sorting,
                    ),
                    medianFirstResponseTimePerChannelQueryV2Factory({
                        filters: statsFilters,
                        timezone,
                        sortDirection: sorting,
                    }),
                    channel,
                )
            })
        })
    })

    describe('hooks', () => {
        it.each([
            {
                name: 'useMedianFirstResponseTimeMetricPerChannel',
                hook: useMedianFirstResponseTimeMetricPerChannel,
                queryFactory:
                    medianFirstAgentResponseTimePerChannelQueryFactory,
                newQueryFactory:
                    medianFirstResponseTimePerChannelQueryV2Factory,
            },
            {
                name: 'useTicketsRepliedMetricPerChannel',
                hook: useTicketsRepliedMetricPerChannel,
                queryFactory: ticketsRepliedMetricPerChannelQueryFactory,
                newQueryFactory: ticketsRepliedCountPerChannelQueryV2Factory,
            },
            {
                name: 'useClosedTicketsMetricPerChannel',
                hook: useClosedTicketsMetricPerChannel,
                queryFactory: closedTicketsPerChannelQueryFactory,
                newQueryFactory: closedTicketsPerChannelQueryV2Factory,
            },
            {
                name: 'useCreatedTicketsMetricPerChannel',
                hook: useCreatedTicketsMetricPerChannel,
                queryFactory: ticketsCreatedPerChannelPerChannelQueryFactory,
                newQueryFactory: createdTicketsPerChannelQueryV2Factory,
            },
            {
                name: 'useMessagesSentMetricPerChannel',
                hook: useMessagesSentMetricPerChannel,
                queryFactory: messagesSentMetricPerChannelQueryFactory,
                newQueryFactory: sentMessagesPerChannelQueryV2Factory,
            },
            {
                name: 'useMedianResolutionTimeMetricPerChannel',
                hook: useMedianResolutionTimeMetricPerChannel,
                queryFactory: medianResolutionTimeMetricPerChannelQueryFactory,
                newQueryFactory: medianResolutionTimePerChannelQueryV2Factory,
            },
            {
                name: 'useCustomerSatisfactionMetricPerChannel',
                hook: useCustomerSatisfactionMetricPerChannel,
                queryFactory: customerSatisfactionMetricPerChannelQueryFactory,
                newQueryFactory: undefined,
            },
            {
                name: 'useOneTouchTicketsMetricPerChannel',
                hook: useOneTouchTicketsMetricPerChannel,
                queryFactory: oneTouchTicketsPerChannelQueryFactory,
                newQueryFactory: oneTouchTicketsPerChannelQueryV2Factory,
            },
            {
                name: 'useZeroTouchTicketsMetricPerChannel',
                hook: useZeroTouchTicketsMetricPerChannel,
                queryFactory: zeroTouchTicketsPerChannelQueryFactory,
                newQueryFactory: undefined,
            },
            {
                name: 'useTicketAverageHandleTimePerChannel',
                hook: useTicketAverageHandleTimePerChannel,
                queryFactory:
                    ticketAverageHandleTimePerAgentPerChannelQueryFactory,
                newQueryFactory:
                    ticketAverageHandleTimePerAgentPerChannelQueryV2Factory,
            },
        ])(
            'should pass the query to $name hook',
            ({ hook, queryFactory, newQueryFactory }) => {
                renderHook(
                    () => hook(statsFilters, timezone, sorting, channel),
                    {},
                )

                if (!newQueryFactory) {
                    expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                        queryFactory(statsFilters, timezone, sorting),
                        undefined,
                        channel,
                    )
                } else {
                    expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                        queryFactory(statsFilters, timezone, sorting),
                        newQueryFactory({
                            filters: statsFilters,
                            timezone,
                            sortDirection: sorting,
                        }),
                        channel,
                    )
                }
            },
        )
    })

    describe('fetch methods', () => {
        it('should pass the query to fetchMedianFirstResponseTimeMetricPerChannel with V2 query', async () => {
            await fetchMedianFirstResponseTimeMetricPerChannel(
                statsFilters,
                timezone,
                sorting,
                channel,
            )

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                medianFirstAgentResponseTimePerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting,
                ),
                medianFirstResponseTimePerChannelQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: sorting,
                }),
                channel,
            )
        })

        it.each([
            {
                name: 'fetchTicketsRepliedMetricPerChannel',
                fetch: fetchTicketsRepliedMetricPerChannel,
                queryFactory: ticketsRepliedMetricPerChannelQueryFactory,
                newQueryFactory: ticketsRepliedCountPerChannelQueryV2Factory,
            },
            {
                name: 'fetchClosedTicketsMetricPerChannel',
                fetch: fetchClosedTicketsMetricPerChannel,
                queryFactory: closedTicketsPerChannelQueryFactory,
                newQueryFactory: closedTicketsPerChannelQueryV2Factory,
            },
            {
                name: 'fetchCreatedTicketsMetricPerChannel',
                fetch: fetchCreatedTicketsMetricPerChannel,
                queryFactory: ticketsCreatedPerChannelPerChannelQueryFactory,
            },
            {
                name: 'fetchMessagesSentMetricPerChannel',
                fetch: fetchMessagesSentMetricPerChannel,
                queryFactory: messagesSentMetricPerChannelQueryFactory,
                newQueryFactory: sentMessagesPerChannelQueryV2Factory,
            },
            {
                name: 'fetchMedianResolutionTimeMetricPerChannel',
                fetch: fetchMedianResolutionTimeMetricPerChannel,
                queryFactory: medianResolutionTimeMetricPerChannelQueryFactory,
                newQueryFactory: medianResolutionTimePerChannelQueryV2Factory,
            },
            {
                name: 'fetchCustomerSatisfactionMetricPerChannel',
                fetch: fetchCustomerSatisfactionMetricPerChannel,
                queryFactory: customerSatisfactionMetricPerChannelQueryFactory,
            },
            {
                name: 'fetchOneTouchTicketsMetricPerChannel',
                fetch: fetchOneTouchTicketsMetricPerChannel,
                queryFactory: oneTouchTicketsPerChannelQueryFactory,
                newQueryFactory: oneTouchTicketsPerChannelQueryV2Factory,
            },
            {
                name: 'fetchZeroTouchTicketsMetricPerChannel',
                fetch: fetchZeroTouchTicketsMetricPerChannel,
                queryFactory: zeroTouchTicketsPerChannelQueryFactory,
            },
            {
                name: 'fetchTicketAverageHandleTimePerChannel',
                fetch: fetchTicketAverageHandleTimePerChannel,
                queryFactory:
                    ticketAverageHandleTimePerAgentPerChannelQueryFactory,
                newQueryFactory:
                    ticketAverageHandleTimePerAgentPerChannelQueryV2Factory,
            },
        ])(
            'should pass the query to $name hook',
            async ({ fetch, queryFactory, newQueryFactory }) => {
                await fetch(statsFilters, timezone, sorting, channel)

                expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone, sorting),
                    newQueryFactory?.({
                        filters: statsFilters,
                        timezone,
                        sortDirection: sorting,
                    }),
                    channel,
                )
            },
        )
    })
})
