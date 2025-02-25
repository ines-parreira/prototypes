import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment'

import {
    fetchClosedTicketsMetric,
    fetchCustomerSatisfactionMetric,
    fetchMedianFirstResponseTimeMetric,
    fetchMedianResolutionTimeMetric,
    fetchMessagesSentMetric,
    fetchOneTouchTicketsMetric,
    fetchOnlineTimeMetric,
    fetchTicketAverageHandleTimeMetric,
    fetchTicketsCreatedMetric,
    fetchTicketsRepliedMetric,
    fetchZeroTouchTicketsMetric,
    ignoreNotAssignedTicketsFilter,
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useMessagesSentMetric,
    useOneTouchTicketsMetric,
    useOnlineTimeMetric,
    useTicketAverageHandleTimeMetric,
    useTicketsCreatedMetric,
    useTicketsRepliedMetric,
    useZeroTouchTicketsMetric,
} from 'hooks/reporting/metrics'
import { fetchMetric, useMetric } from 'hooks/reporting/useMetric'
import { onlineTimeQueryFactory } from 'models/reporting/queryFactories/agentxp/onlineTime'
import { ticketAverageHandleTimeQueryFactory } from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsQueryFactory } from 'models/reporting/queryFactories/support-performance/closedTickets'
import { customerSatisfactionQueryFactory } from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import { medianFirstResponseTimeQueryFactory } from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeQueryFactory } from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import { messagesSentQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsQueryFactory } from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import { ticketsCreatedQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsQueryFactory } from 'models/reporting/queryFactories/support-performance/zeroTouchTickets'
import { ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate, withFilter } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/useMetric')
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
            'useMedianFirstResponseTimeMetric',
            useMedianFirstResponseTimeMetric,
            medianFirstResponseTimeQueryFactory,
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
