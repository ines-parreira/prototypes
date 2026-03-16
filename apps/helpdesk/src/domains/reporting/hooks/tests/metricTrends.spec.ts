import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchClosedTicketsTrend,
    fetchCustomerSatisfactionTrend,
    fetchHumanResponseTimeAfterAiHandoffTrend,
    fetchMedianFirstResponseTimeTrend,
    fetchMedianResolutionTimeTrend,
    fetchMedianResponseTimeTrend,
    fetchMessagesPerTicketTrend,
    fetchMessagesReceivedTrend,
    fetchMessagesSentTrend,
    fetchOneTouchTicketsTrend,
    fetchOnlineTimeTrend,
    fetchOpenTicketsTrend,
    fetchTicketHandleTimeTrend,
    fetchTicketsCreatedTrend,
    fetchTicketsRepliedTrend,
    fetchZeroTouchTicketsTrend,
    getTrendFetch,
    getTrendHook,
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useHumanResponseTimeAfterAiHandoffTrend,
    useMedianFirstResponseTimeTrend,
    useMedianResolutionTimeTrend,
    useMedianResponseTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesReceivedTrend,
    useMessagesSentTrend,
    useOneTouchTicketsTrend,
    useOnlineTimeTrend,
    useOpenTicketsTrend,
    useTicketHandleTimeTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
    useZeroTouchTicketsTrend,
} from 'domains/reporting/hooks/metricTrends'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { onlineTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { humanResponseTimeAfterAiHandoffQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import { medianFirstAgentResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesPerTicketQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesPerTicket'
import { messagesReceivedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { openTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/openTickets'
import { ticketsCreatedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { customerSatisfactionQueryV2Factory } from 'domains/reporting/models/scopes/customerSatisfaction'
import { medianFirstResponseTime } from 'domains/reporting/models/scopes/firstResponseTime'
import { humanResponseTimeAfterAiHandoffQueryV2Factory } from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import { messagesPerTicketCountQueryV2Factory } from 'domains/reporting/models/scopes/messagesPerTicket'
import { messagesReceivedCountQueryV2Factory } from 'domains/reporting/models/scopes/messagesReceived'
import { sentMessagesCountQueryV2Factory } from 'domains/reporting/models/scopes/messagesSent'
import { oneTouchTicketsQueryV2Factory } from 'domains/reporting/models/scopes/oneTouchTickets'
import { onlineTimeQueryV2Factory } from 'domains/reporting/models/scopes/onlineTime'
import { medianResolutionTimeQueryV2Factory } from 'domains/reporting/models/scopes/resolutionTime'
import { medianResponseTimeQueryV2Factory } from 'domains/reporting/models/scopes/responseTime'
import { ticketAverageHandleTimeQueryV2Factory } from 'domains/reporting/models/scopes/ticketHandleTime'
import { closedTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsClosed'
import { createdTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsCreated'
import { openTicketsCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsOpen'
import { ticketsRepliedCountQueryV2Factory } from 'domains/reporting/models/scopes/ticketsReplied'
import { zeroTouchTicketsQueryV2Factory } from 'domains/reporting/models/scopes/zeroTouchTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('metric trends', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }

    const prevStatsFilters: StatsFilters = {
        ...statsFilters,
        period: getPreviousPeriod(statsFilters.period),
    }

    const timezone = 'someTimeZone'

    beforeEach(() => {
        useMetricTrendMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 0, prevValue: 0 },
        })
    })

    describe('useMedianFirstResponseTimeTrend', () => {
        it('calls medianFirstAgentResponseTimeQueryFactory', () => {
            renderHook(() =>
                useMedianFirstResponseTimeTrend(statsFilters, timezone),
            )

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                medianFirstAgentResponseTimeQueryFactory(
                    statsFilters,
                    timezone,
                ),
                medianFirstAgentResponseTimeQueryFactory(
                    prevStatsFilters,
                    timezone,
                ),
                medianFirstResponseTime.build({
                    filters: statsFilters,
                    timezone,
                }),
                medianFirstResponseTime.build({
                    filters: prevStatsFilters,
                    timezone,
                }),
            )
        })
    })

    describe('fetchMedianFirstResponseTimeTrend', () => {
        it('calls medianFirstAgentResponseTimeQueryFactory', async () => {
            await fetchMedianFirstResponseTimeTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                medianFirstAgentResponseTimeQueryFactory(
                    statsFilters,
                    timezone,
                ),
                medianFirstAgentResponseTimeQueryFactory(
                    prevStatsFilters,
                    timezone,
                ),
                medianFirstResponseTime.build({
                    filters: statsFilters,
                    timezone,
                }),
                medianFirstResponseTime.build({
                    filters: prevStatsFilters,
                    timezone,
                }),
            )
        })
    })

    describe.each([
        [
            'useOpenTicketsTrend',
            useOpenTicketsTrend,
            openTicketsQueryFactory,
            openTicketsCountQueryV2Factory,
        ],
        [
            'useCustomerSatisfactionTrend',
            useCustomerSatisfactionTrend,
            customerSatisfactionQueryFactory,
            customerSatisfactionQueryV2Factory,
        ],
        [
            'useHumanResponseTimeAfterAiHandoffTrend',
            useHumanResponseTimeAfterAiHandoffTrend,
            humanResponseTimeAfterAiHandoffQueryFactory,
            humanResponseTimeAfterAiHandoffQueryV2Factory,
        ],
        [
            'useMedianResolutionTimeTrend',
            useMedianResolutionTimeTrend,
            medianResolutionTimeQueryFactory,
            medianResolutionTimeQueryV2Factory,
        ],
        [
            'useClosedTicketsTrend',
            useClosedTicketsTrend,
            closedTicketsQueryFactory,
            closedTicketsCountQueryV2Factory,
        ],
        [
            'useTicketsCreatedTrend',
            useTicketsCreatedTrend,
            ticketsCreatedQueryFactory,
            createdTicketsCountQueryV2Factory,
        ],
        [
            'useOneTouchTicketsTrend',
            useOneTouchTicketsTrend,
            oneTouchTicketsQueryFactory,
            oneTouchTicketsQueryV2Factory,
        ],
        [
            'useZeroTouchTicketsTrend',
            useZeroTouchTicketsTrend,
            zeroTouchTicketsQueryFactory,
            zeroTouchTicketsQueryV2Factory,
        ],
        [
            'useOpenTicketsTrend',
            useOpenTicketsTrend,
            openTicketsQueryFactory,
            openTicketsCountQueryV2Factory,
        ],
        [
            'useTicketsRepliedTrend',
            useTicketsRepliedTrend,
            ticketsRepliedQueryFactory,
            ticketsRepliedCountQueryV2Factory,
        ],
        [
            'useMessagesSentTrend',
            useMessagesSentTrend,
            messagesSentQueryFactory,
            sentMessagesCountQueryV2Factory,
        ],
        [
            'useMessagesPerTicketTrend',
            useMessagesPerTicketTrend,
            messagesPerTicketQueryFactory,
            messagesPerTicketCountQueryV2Factory,
        ],
        [
            'useTicketHandleTimeTrend',
            useTicketHandleTimeTrend,
            ticketAverageHandleTimeQueryFactory,
            ticketAverageHandleTimeQueryV2Factory,
        ],
        [
            'useOnlineTimeTrend',
            useOnlineTimeTrend,
            onlineTimeQueryFactory,
            onlineTimeQueryV2Factory,
        ],
        [
            'useMessagesReceivedTrend',
            useMessagesReceivedTrend,
            messagesReceivedQueryFactory,
            messagesReceivedCountQueryV2Factory,
        ],
        [
            'useMedianResponseTimeTrend',
            useMedianResponseTimeTrend,
            medianResponseTimeQueryFactory,
            medianResponseTimeQueryV2Factory,
        ],
    ])('%s', (_testName, useTrendFn, queryFactory, scopeQuery) => {
        it('should create reporting filters', () => {
            renderHook(() => useTrendFn(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                queryFactory(statsFilters, timezone),
                queryFactory(prevStatsFilters, timezone),
                scopeQuery?.({ filters: statsFilters, timezone }),
                scopeQuery?.({
                    filters: prevStatsFilters,
                    timezone,
                }),
                true,
            )
        })
    })

    describe.each([
        [
            'fetchOpenTicketsTrend',
            fetchOpenTicketsTrend,
            openTicketsQueryFactory,
            openTicketsCountQueryV2Factory,
        ],
        [
            'fetchCustomerSatisfactionTrend',
            fetchCustomerSatisfactionTrend,
            customerSatisfactionQueryFactory,
            customerSatisfactionQueryV2Factory,
        ],
        [
            'fetchHumanResponseTimeAfterAiHandoffTrend',
            fetchHumanResponseTimeAfterAiHandoffTrend,
            humanResponseTimeAfterAiHandoffQueryFactory,
            humanResponseTimeAfterAiHandoffQueryV2Factory,
        ],
        [
            'fetchMedianResolutionTimeTrend',
            fetchMedianResolutionTimeTrend,
            medianResolutionTimeQueryFactory,
            medianResolutionTimeQueryV2Factory,
        ],
        [
            'fetchClosedTicketsTrend',
            fetchClosedTicketsTrend,
            closedTicketsQueryFactory,
            closedTicketsCountQueryV2Factory,
        ],
        [
            'fetchTicketsCreatedTrend',
            fetchTicketsCreatedTrend,
            ticketsCreatedQueryFactory,
            createdTicketsCountQueryV2Factory,
        ],
        [
            'fetchOneTouchTicketsTrend',
            fetchOneTouchTicketsTrend,
            oneTouchTicketsQueryFactory,
            oneTouchTicketsQueryV2Factory,
        ],
        [
            'fetchZeroTouchTicketsTrend',
            fetchZeroTouchTicketsTrend,
            zeroTouchTicketsQueryFactory,
            zeroTouchTicketsQueryV2Factory,
        ],
        [
            'fetchTicketsRepliedTrend',
            fetchTicketsRepliedTrend,
            ticketsRepliedQueryFactory,
            ticketsRepliedCountQueryV2Factory,
        ],
        [
            'fetchMessagesSentTrend',
            fetchMessagesSentTrend,
            messagesSentQueryFactory,
            sentMessagesCountQueryV2Factory,
        ],
        [
            'fetchMessagesPerTicketTrend',
            fetchMessagesPerTicketTrend,
            messagesPerTicketQueryFactory,
            messagesPerTicketCountQueryV2Factory,
        ],
        [
            'fetchTicketHandleTimeTrend',
            fetchTicketHandleTimeTrend,
            ticketAverageHandleTimeQueryFactory,
            ticketAverageHandleTimeQueryV2Factory,
        ],
        [
            'fetchOnlineTimeTrend',
            fetchOnlineTimeTrend,
            onlineTimeQueryFactory,
            onlineTimeQueryV2Factory,
        ],
        [
            'fetchMessagesReceivedTrend',
            fetchMessagesReceivedTrend,
            messagesReceivedQueryFactory,
            messagesReceivedCountQueryV2Factory,
        ],
        [
            'fetchMedianResponseTimeTrend',
            fetchMedianResponseTimeTrend,
            medianResponseTimeQueryFactory,
            medianResponseTimeQueryV2Factory,
        ],
    ])('%s', (_testName, fetchTrendFn, queryFactory, queryV2Factory?: any) => {
        it('should create reporting filters', async () => {
            await fetchTrendFn(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                queryFactory(statsFilters, timezone),
                queryFactory(prevStatsFilters, timezone),
                queryV2Factory?.({ filters: statsFilters, timezone }),
                queryV2Factory?.({ filters: prevStatsFilters, timezone }),
            )
        })
    })

    describe('factory functions with undefined queryV2', () => {
        it('getTrendHook should handle undefined queryV2', () => {
            const testHook = getTrendHook(openTicketsQueryFactory)
            renderHook(() => testHook(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                openTicketsQueryFactory(statsFilters, timezone),
                openTicketsQueryFactory(prevStatsFilters, timezone),
                undefined,
                undefined,
                true,
            )
        })

        it('getTrendFetch should handle undefined queryV2', async () => {
            const testFetch = getTrendFetch(openTicketsQueryFactory)
            await testFetch(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                openTicketsQueryFactory(statsFilters, timezone),
                openTicketsQueryFactory(prevStatsFilters, timezone),
                undefined,
                undefined,
            )
        })
    })
})
