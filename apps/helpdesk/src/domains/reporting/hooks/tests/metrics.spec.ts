import moment from 'moment'

import {
    fetchClosedTicketsMetric,
    fetchCustomerSatisfactionMetric,
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
    ignoreNotAssignedFirstResponseMessageAssigneeFilter,
    ignoreNotAssignedTicketsFilter,
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
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
import { medianFirstResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesReceivedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    withFilter,
} from 'domains/reporting/utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

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

    useMetricMock.mockReturnValue(defaultMetricValue)
    fetchMetricMock.mockResolvedValue(defaultMetricValue)

    describe.each([
        [
            'useClosedTicketsMetric',
            useClosedTicketsMetric,
            closedTicketsQueryFactory,
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
            'useMedianResolutionTimeMetric',
            useMedianResolutionTimeMetric,
            medianResolutionTimeQueryFactory,
        ],
        [
            'useOneTouchTicketsMetric',
            useOneTouchTicketsMetric,
            oneTouchTicketsQueryFactory,
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
        ) => {
            it('should create reporting metric with assigned tickets only', () => {
                const { result } = renderHook(() =>
                    useTrendFn(statsFilters, timezone),
                )

                expect(useMetricMock).toHaveBeenCalledWith(
                    withFilter(
                        queryFactory(statsFilters, timezone),
                        ignoreNotAssignedTicketsFilter,
                    ),
                )
                expect(result.current).toBe(defaultMetricValue)
            })
        },
    )

    it('should create reporting metric with tickets that have firstResponseAssignee only', () => {
        const { result } = renderHook(() =>
            useMedianFirstResponseTimeMetric(statsFilters, timezone),
        )

        expect(useMetricMock).toHaveBeenCalledWith(
            withFilter(
                medianFirstResponseTimeQueryFactory(statsFilters, timezone),
                ignoreNotAssignedFirstResponseMessageAssigneeFilter,
            ),
        )
        expect(result.current).toBe(defaultMetricValue)
    })

    describe.each([
        [
            'fetchClosedTicketsMetric',
            fetchClosedTicketsMetric,
            closedTicketsQueryFactory,
        ],
        [
            'fetchCustomerSatisfactionMetric',
            fetchCustomerSatisfactionMetric,
            customerSatisfactionQueryFactory,
        ],
        [
            'fetchMedianFirstResponseTimeMetric',
            fetchMedianFirstResponseTimeMetric,
            medianFirstResponseTimeQueryFactory,
        ],
        [
            'fetchMedianResponseTimeMetric',
            fetchMedianResponseTimeMetric,
            medianResponseTimeQueryFactory,
        ],
        [
            'fetchMedianResolutionTimeMetric',
            fetchMedianResolutionTimeMetric,
            medianResolutionTimeQueryFactory,
        ],
        [
            'fetchOneTouchTicketsMetric',
            fetchOneTouchTicketsMetric,
            oneTouchTicketsQueryFactory,
        ],
        [
            'fetchZeroTouchTicketsMetric',
            fetchZeroTouchTicketsMetric,
            zeroTouchTicketsQueryFactory,
        ],
        [
            'fetchTicketHandleTimeMetric',
            fetchTicketAverageHandleTimeMetric,
            ticketAverageHandleTimeQueryFactory,
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
                    withFilter(
                        queryFactory(statsFilters, timezone),
                        ignoreNotAssignedTicketsFilter,
                    ),
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
        ],
        [
            'useMessagesReceivedMetric',
            useMessagesReceivedMetric,
            messagesReceivedQueryFactory,
        ],
        [
            'useTicketsRepliedMetric',
            useTicketsRepliedMetric,
            ticketsRepliedQueryFactory,
        ],
        ['useOnlineTimeMetric', useOnlineTimeMetric, onlineTimeQueryFactory],
        [
            'useTicketsCreatedMetric',
            useTicketsCreatedMetric,
            ticketsCreatedQueryFactory,
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
        ) => {
            it('should create reporting metric with all tickets', () => {
                const { result } = renderHook(() =>
                    useTrendFn(statsFilters, timezone),
                )

                expect(useMetricMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone),
                )
                expect(result.current).toBe(defaultMetricValue)
            })
        },
    )

    describe.each([
        [
            'fetchMessagesSentMetric',
            fetchMessagesSentMetric,
            messagesSentQueryFactory,
        ],
        [
            'fetchMessagesReceivedMetric',
            fetchMessagesReceivedMetric,
            messagesReceivedQueryFactory,
        ],
        [
            'fetchTicketsRepliedMetric',
            fetchTicketsRepliedMetric,
            ticketsRepliedQueryFactory,
        ],
        [
            'fetchOnlineTimeMetric',
            fetchOnlineTimeMetric,
            onlineTimeQueryFactory,
        ],
        [
            'fetchTicketsCreatedMetric',
            fetchTicketsCreatedMetric,
            ticketsCreatedQueryFactory,
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
            it('should create reporting metric with all tickets', async () => {
                const result = await fetchTrendFn(statsFilters, timezone)

                expect(fetchMetricMock).toHaveBeenCalledWith(
                    queryFactory(statsFilters, timezone),
                )
                expect(result).toBe(defaultMetricValue)
            })
        },
    )
})
