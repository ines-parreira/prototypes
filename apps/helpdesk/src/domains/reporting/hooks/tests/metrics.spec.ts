import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchClosedTicketsMetric,
    fetchCustomerSatisfactionMetric,
    fetchHumanResponseTimeAfterAiHandoffMetric,
    fetchMedianFirstResponseTimeMetric,
    fetchMedianResolutionTimeMetric,
    fetchMedianResponseTimeMetric,
    fetchMessagesReceivedMetric,
    fetchMessagesSentMetric,
    fetchOneTouchTicketsMetric,
    fetchOnlineTimeMetric,
    fetchTicketAverageHandleTimeMetric,
    fetchTicketsCreatedMetric,
    fetchTicketsRepliedMetric,
    fetchZeroTouchTicketsMetric,
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useHumanResponseTimeAfterAiHandoffMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useMedianResponseTimeMetric,
    useMessagesReceivedMetric,
    useMessagesSentMetric,
    useOneTouchTicketsMetric,
    useOnlineTimeMetric,
    useTicketAverageHandleTimeMetric,
    useTicketsCreatedMetric,
    useTicketsRepliedMetric,
    useZeroTouchTicketsMetric,
} from 'domains/reporting/hooks/metrics'
import { fetchMetric, useMetric } from 'domains/reporting/hooks/useMetric'
import { onlineTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { humanResponseTimeAfterAiHandoffQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import { medianFirstAgentResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesReceivedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { medianFirstResponseTime } from 'domains/reporting/models/scopes/firstResponseTime'
import { humanResponseTimeAfterAiHandoff } from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import { messagesReceivedCount } from 'domains/reporting/models/scopes/messagesReceived'
import { sentMessagesCount } from 'domains/reporting/models/scopes/messagesSent'
import { oneTouchTickets } from 'domains/reporting/models/scopes/oneTouchTickets'
import { onlineTime } from 'domains/reporting/models/scopes/onlineTime'
import { medianResolutionTime } from 'domains/reporting/models/scopes/resolutionTime'
import { ticketAverageHandleTime } from 'domains/reporting/models/scopes/ticketHandleTime'
import { closedTicketsCount } from 'domains/reporting/models/scopes/ticketsClosed'
import { createdTicketsCount } from 'domains/reporting/models/scopes/ticketsCreated'
import { ticketsRepliedCount } from 'domains/reporting/models/scopes/ticketsReplied'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useMetric')
const useMetricMock = assumeMock(useMetric)
const fetchMetricMock = assumeMock(fetchMetric)

describe('metrics', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'UTC'

    const defaultMetricValue = {
        data: { value: 1 },
        isError: false,
        isFetching: false,
    }

    beforeEach(() => {
        useMetricMock.mockReturnValue(defaultMetricValue)
        fetchMetricMock.mockResolvedValue(defaultMetricValue)
    })

    describe.each([
        [
            'useClosedTicketsMetric',
            useClosedTicketsMetric,
            closedTicketsQueryFactory,
            closedTicketsCount,
        ],
        [
            'useCustomerSatisfactionMetric',
            useCustomerSatisfactionMetric,
            customerSatisfactionQueryFactory,
        ],
        [
            'useMedianResponseTimeMetric',
            useMedianResponseTimeMetric,
            medianResponseTimeQueryFactory,
        ],
        [
            'useHumanResponseTimeAfterAiHandoffMetric',
            useHumanResponseTimeAfterAiHandoffMetric,
            humanResponseTimeAfterAiHandoffQueryFactory,
            humanResponseTimeAfterAiHandoff,
        ],
        [
            'useMedianResolutionTimeMetric',
            useMedianResolutionTimeMetric,
            medianResolutionTimeQueryFactory,
            medianResolutionTime,
        ],
        [
            'useOneTouchTicketsMetric',
            useOneTouchTicketsMetric,
            oneTouchTicketsQueryFactory,
            oneTouchTickets,
        ],
        [
            'useZeroTouchTicketsMetric',
            useZeroTouchTicketsMetric,
            zeroTouchTicketsQueryFactory,
        ],
        [
            'useTicketHandleTimeMetric',
            useTicketAverageHandleTimeMetric,
            ticketAverageHandleTimeQueryFactory,
            ticketAverageHandleTime,
        ],
    ])(
        '%s',
        (
            _,
            useTrendFn,
            queryFactory: (
                statsFilters: StatsFilters,
                timezone: string,
            ) => ReportingQuery,
            newQueryBuilder?: {
                build: (ctx: { filters: StatsFilters; timezone: string }) => any
            },
        ) => {
            it('should create reporting metric with assigned tickets only', () => {
                const { result } = renderHook(() =>
                    useTrendFn(statsFilters, timezone),
                )

                if (newQueryBuilder) {
                    expect(useMetricMock).toHaveBeenCalledWith(
                        queryFactory(statsFilters, timezone),
                        newQueryBuilder.build({
                            filters: statsFilters,
                            timezone,
                        }),
                    )
                } else {
                    expect(useMetricMock).toHaveBeenCalledWith(
                        queryFactory(statsFilters, timezone),
                    )
                }
                expect(result.current).toBe(defaultMetricValue)
            })
        },
    )

    it('should create reporting metric with tickets that have firstResponseAssignee only', () => {
        const { result } = renderHook(() =>
            useMedianFirstResponseTimeMetric(statsFilters, timezone),
        )

        expect(useMetricMock).toHaveBeenCalledWith(
            medianFirstAgentResponseTimeQueryFactory(statsFilters, timezone),
            medianFirstResponseTime.build({
                filters: statsFilters,
                timezone,
            }),
        )
        expect(result.current).toBe(defaultMetricValue)
    })

    it('calls medianFirstResponseTimeQueryFactory', () => {
        renderHook(() =>
            useMedianFirstResponseTimeMetric(statsFilters, timezone),
        )

        expect(useMetricMock).toHaveBeenCalledWith(
            medianFirstAgentResponseTimeQueryFactory(statsFilters, timezone),
            medianFirstResponseTime.build({
                filters: statsFilters,
                timezone,
            }),
        )
    })

    it('calls medianFirstResponseTimeQueryFactory', async () => {
        await fetchMedianFirstResponseTimeMetric(statsFilters, timezone)

        expect(fetchMetricMock).toHaveBeenCalledWith(
            medianFirstAgentResponseTimeQueryFactory(statsFilters, timezone),
            medianFirstResponseTime.build({
                filters: statsFilters,
                timezone,
            }),
        )
    })

    describe.each([
        [
            'fetchClosedTicketsMetric',
            fetchClosedTicketsMetric,
            closedTicketsQueryFactory,
            closedTicketsCount,
        ],
        [
            'fetchMedianResolutionTimeMetric',
            fetchMedianResolutionTimeMetric,
            medianResolutionTimeQueryFactory,
            medianResolutionTime,
        ],
        [
            'fetchHumanResponseTimeAfterAiHandoffMetric',
            fetchHumanResponseTimeAfterAiHandoffMetric,
            humanResponseTimeAfterAiHandoffQueryFactory,
            humanResponseTimeAfterAiHandoff,
        ],
        [
            'fetchOneTouchTicketsMetric',
            fetchOneTouchTicketsMetric,
            oneTouchTicketsQueryFactory,
            oneTouchTickets,
        ],
        [
            'fetchTicketHandleTimeMetric',
            fetchTicketAverageHandleTimeMetric,
            ticketAverageHandleTimeQueryFactory,
            ticketAverageHandleTime,
        ],
    ])(
        '%s',
        (
            _,
            fetchTrendFn,
            queryFactory: (
                statsFilters: StatsFilters,
                timezone: string,
            ) => ReportingQuery,
            newQueryBuilder: any,
        ) => {
            it('should fetch reporting metric with assigned tickets only', async () => {
                const result = await fetchTrendFn(statsFilters, timezone)

                expect(fetchMetricMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone),
                    newQueryBuilder.build({
                        filters: statsFilters,
                        timezone,
                    }),
                )
                expect(result).toBe(defaultMetricValue)
            })
        },
    )

    describe.each([
        [
            'fetchCustomerSatisfactionMetric',
            fetchCustomerSatisfactionMetric,
            customerSatisfactionQueryFactory,
        ],
        [
            'fetchMedianResponseTimeMetric',
            fetchMedianResponseTimeMetric,
            medianResponseTimeQueryFactory,
        ],
        [
            'fetchZeroTouchTicketsMetric',
            fetchZeroTouchTicketsMetric,
            zeroTouchTicketsQueryFactory,
        ],
    ])(
        '%s',
        (
            _,
            fetchTrendFn,
            queryFactory: (
                statsFilters: StatsFilters,
                timezone: string,
            ) => ReportingQuery,
        ) => {
            it('should fetch reporting metric with assigned tickets only', async () => {
                const result = await fetchTrendFn(statsFilters, timezone)

                expect(fetchMetricMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone),
                )
                expect(result).toBe(defaultMetricValue)
            })
        },
    )

    describe.each([
        [
            'useMessagesSentMetric',
            useMessagesSentMetric,
            messagesSentQueryFactory,
            sentMessagesCount,
        ],
        [
            'useMessagesReceivedMetric',
            useMessagesReceivedMetric,
            messagesReceivedQueryFactory,
            messagesReceivedCount,
        ],
        [
            'useTicketsRepliedMetric',
            useTicketsRepliedMetric,
            ticketsRepliedQueryFactory,
            ticketsRepliedCount,
        ],
        [
            'useOnlineTimeMetric',
            useOnlineTimeMetric,
            onlineTimeQueryFactory,
            onlineTime,
        ],
        [
            'useTicketsCreatedMetric',
            useTicketsCreatedMetric,
            ticketsCreatedQueryFactory,
            createdTicketsCount,
        ],
    ])(
        '%s',
        (
            _,
            useTrendFn,
            queryFactory: (
                statsFilters: StatsFilters,
                timezone: string,
            ) => ReportingQuery,
            newQueryBuilder?: {
                build: (ctx: { filters: StatsFilters; timezone: string }) => any
            },
        ) => {
            it('should create reporting metric with all tickets', () => {
                const { result } = renderHook(() =>
                    useTrendFn(statsFilters, timezone),
                )

                if (newQueryBuilder) {
                    expect(useMetricMock).toHaveBeenCalledWith(
                        queryFactory(statsFilters, timezone),
                        newQueryBuilder.build({
                            filters: statsFilters,
                            timezone,
                        }),
                    )
                } else {
                    expect(useMetricMock).toHaveBeenCalledWith(
                        queryFactory(statsFilters, timezone),
                    )
                }
                expect(result.current).toBe(defaultMetricValue)
            })
        },
    )

    describe.each([
        [
            'fetchMessagesSentMetric',
            fetchMessagesSentMetric,
            messagesSentQueryFactory,
            sentMessagesCount,
        ],
        [
            'fetchMessagesReceivedMetric',
            fetchMessagesReceivedMetric,
            messagesReceivedQueryFactory,
            messagesReceivedCount,
        ],
        [
            'fetchTicketsRepliedMetric',
            fetchTicketsRepliedMetric,
            ticketsRepliedQueryFactory,
            ticketsRepliedCount,
        ],
        [
            'fetchOnlineTimeMetric',
            fetchOnlineTimeMetric,
            onlineTimeQueryFactory,
            onlineTime,
        ],
        [
            'fetchTicketsCreatedMetric',
            fetchTicketsCreatedMetric,
            ticketsCreatedQueryFactory,
            createdTicketsCount,
        ],
    ])(
        '%s',
        (
            _,
            fetchTrendFn,
            queryFactory: (
                statsFilters: StatsFilters,
                timezone: string,
            ) => ReportingQuery,
            queryBuilder,
        ) => {
            it('should create reporting metric with all tickets', async () => {
                const result = await fetchTrendFn(statsFilters, timezone)

                expect(fetchMetricMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone),
                    queryBuilder.build({
                        filters: statsFilters,
                        timezone,
                    }),
                )
                expect(result).toBe(defaultMetricValue)
            })
        },
    )

    it('should create online time metric with sortDirection', () => {
        const { result } = renderHook(() =>
            useOnlineTimeMetric(statsFilters, timezone, OrderDirection.Desc),
        )

        expect(useMetricMock).toHaveBeenCalledWith(
            onlineTimeQueryFactory(statsFilters, timezone, OrderDirection.Desc),
            onlineTime.build({
                filters: statsFilters,
                timezone,
                sortDirection: OrderDirection.Desc,
            }),
        )
        expect(result.current).toBe(defaultMetricValue)
    })
})
