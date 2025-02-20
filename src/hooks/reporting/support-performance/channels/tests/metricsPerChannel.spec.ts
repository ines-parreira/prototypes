import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment/moment'

import {TicketChannel} from 'business/types/ticket'
import {
    useClosedTicketsMetricPerChannel,
    useCustomerSatisfactionMetricPerChannel,
    useMedianFirstResponseTimeMetricPerChannel,
    useMessagesSentMetricPerChannel,
    useMedianResolutionTimeMetricPerChannel,
    useTicketsRepliedMetricPerChannel,
    useOneTouchTicketsMetricPerChannel,
    useZeroTouchTicketsMetricPerChannel,
    useTicketAverageHandleTimePerChannel,
    useCreatedTicketsMetricPerChannel,
    fetchTicketAverageHandleTimePerChannel,
    fetchZeroTouchTicketsMetricPerChannel,
    fetchOneTouchTicketsMetricPerChannel,
    fetchCustomerSatisfactionMetricPerChannel,
    fetchMedianResolutionTimeMetricPerChannel,
    fetchMessagesSentMetricPerChannel,
    fetchCreatedTicketsMetricPerChannel,
    fetchClosedTicketsMetricPerChannel,
    fetchTicketsRepliedMetricPerChannel,
    fetchMedianFirstResponseTimeMetricPerChannel,
} from 'hooks/reporting/support-performance/channels/metricsPerChannel'
import {
    fetchMetricPerDimension,
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
import {zeroTouchTicketsPerChannelQueryFactory} from 'models/reporting/queryFactories/support-performance/zeroTouchTickets'
import {LegacyStatsFilters} from 'models/stat/types'

import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

describe('metricsPerChannel', () => {
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
    const channel = 'someChannel'

    describe('hooks', () => {
        it.each([
            {
                name: 'useMedianFirstResponseTimeMetricPerChannel',
                hook: useMedianFirstResponseTimeMetricPerChannel,
                queryFactory:
                    medianFirstResponseTimeMetricPerChannelQueryFactory,
            },
            {
                name: 'useTicketsRepliedMetricPerChannel',
                hook: useTicketsRepliedMetricPerChannel,
                queryFactory: ticketsRepliedMetricPerChannelQueryFactory,
            },
            {
                name: 'useClosedTicketsMetricPerChannel',
                hook: useClosedTicketsMetricPerChannel,
                queryFactory: closedTicketsPerChannelQueryFactory,
            },
            {
                name: 'useCreatedTicketsMetricPerChannel',
                hook: useCreatedTicketsMetricPerChannel,
                queryFactory: ticketsCreatedPerChannelPerChannelQueryFactory,
            },
            {
                name: 'useMessagesSentMetricPerChannel',
                hook: useMessagesSentMetricPerChannel,
                queryFactory: messagesSentMetricPerChannelQueryFactory,
            },
            {
                name: 'useMedianResolutionTimeMetricPerChannel',
                hook: useMedianResolutionTimeMetricPerChannel,
                queryFactory: medianResolutionTimeMetricPerChannelQueryFactory,
            },
            {
                name: 'useCustomerSatisfactionMetricPerChannel',
                hook: useCustomerSatisfactionMetricPerChannel,
                queryFactory: customerSatisfactionMetricPerChannelQueryFactory,
            },
            {
                name: 'useOneTouchTicketsMetricPerChannel',
                hook: useOneTouchTicketsMetricPerChannel,
                queryFactory: oneTouchTicketsPerChannelQueryFactory,
            },
            {
                name: 'useZeroTouchTicketsMetricPerChannel',
                hook: useZeroTouchTicketsMetricPerChannel,
                queryFactory: zeroTouchTicketsPerChannelQueryFactory,
            },
            {
                name: 'useTicketAverageHandleTimePerChannel',
                hook: useTicketAverageHandleTimePerChannel,
                queryFactory:
                    ticketAverageHandleTimePerAgentPerChannelQueryFactory,
            },
        ])('should pass the query to $name hook', ({hook, queryFactory}) => {
            renderHook(() => hook(statsFilters, timezone, sorting, channel), {})

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                queryFactory(statsFilters, timezone, sorting),
                channel
            )
        })
    })

    describe('fetch methods', () => {
        it.each([
            {
                name: 'fetchMedianFirstResponseTimeMetricPerChannel',
                fetch: fetchMedianFirstResponseTimeMetricPerChannel,
                queryFactory:
                    medianFirstResponseTimeMetricPerChannelQueryFactory,
            },
            {
                name: 'fetchTicketsRepliedMetricPerChannel',
                fetch: fetchTicketsRepliedMetricPerChannel,
                queryFactory: ticketsRepliedMetricPerChannelQueryFactory,
            },
            {
                name: 'fetchClosedTicketsMetricPerChannel',
                fetch: fetchClosedTicketsMetricPerChannel,
                queryFactory: closedTicketsPerChannelQueryFactory,
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
            },
            {
                name: 'fetchMedianResolutionTimeMetricPerChannel',
                fetch: fetchMedianResolutionTimeMetricPerChannel,
                queryFactory: medianResolutionTimeMetricPerChannelQueryFactory,
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
            },
        ])(
            'should pass the query to $name hook',
            async ({fetch, queryFactory}) => {
                await fetch(statsFilters, timezone, sorting, channel)

                expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone, sorting),
                    channel
                )
            }
        )
    })
})
