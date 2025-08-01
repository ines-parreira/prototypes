import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchClosedTicketsTrend,
    fetchCustomerSatisfactionTrend,
    fetchMedianFirstResponseTimeTrend,
    fetchMedianResolutionTimeTrend,
    fetchMessagesPerTicketTrend,
    fetchMessagesSentTrend,
    fetchOneTouchTicketsTrend,
    fetchOpenTicketsTrend,
    fetchTicketHandleTimeTrend,
    fetchTicketsCreatedTrend,
    fetchTicketsRepliedTrend,
    fetchZeroTouchTicketsTrend,
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useMedianFirstResponseTimeTrend,
    useMedianResolutionTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOneTouchTicketsTrend,
    useOpenTicketsTrend,
    useTicketHandleTimeTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
    useZeroTouchTicketsTrend,
} from 'domains/reporting/hooks/metricTrends'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { ticketAverageHandleTimeQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { medianFirstResponseTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { medianResolutionTimeQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { messagesPerTicketQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesPerTicket'
import { messagesSentQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { openTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/openTickets'
import { ticketsCreatedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
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
    const timezone = 'someTimeZone'

    useMetricTrendMock.mockImplementation(
        ((queryCreator: ReportingQuery) => queryCreator) as any,
    )
    describe.each([
        ['useOpenTicketsTrend', useOpenTicketsTrend, openTicketsQueryFactory],
        [
            'useCustomerSatisfactionTrend',
            useCustomerSatisfactionTrend,
            customerSatisfactionQueryFactory,
        ],
        [
            'useMedianFirstResponseTimeTrend',
            useMedianFirstResponseTimeTrend,
            medianFirstResponseTimeQueryFactory,
        ],
        [
            'useMedianResolutionTimeTrend',
            useMedianResolutionTimeTrend,
            medianResolutionTimeQueryFactory,
        ],
        [
            'useClosedTicketsTrend',
            useClosedTicketsTrend,
            closedTicketsQueryFactory,
        ],
        [
            'useTicketsCreatedTrend',
            useTicketsCreatedTrend,
            ticketsCreatedQueryFactory,
        ],
        [
            'useOneTouchTicketsTrend',
            useOneTouchTicketsTrend,
            oneTouchTicketsQueryFactory,
        ],
        [
            'useZeroTouchTicketsTrend',
            useZeroTouchTicketsTrend,
            zeroTouchTicketsQueryFactory,
        ],
        ['useOpenTicketsTrend', useOpenTicketsTrend, openTicketsQueryFactory],
        [
            'useTicketsRepliedTrend',
            useTicketsRepliedTrend,
            ticketsRepliedQueryFactory,
        ],
        [
            'useMessagesSentTrend',
            useMessagesSentTrend,
            messagesSentQueryFactory,
        ],
        [
            'useMessagesPerTicketTrend',
            useMessagesPerTicketTrend,
            messagesPerTicketQueryFactory,
        ],
        [
            'useTicketHandleTimeTrend',
            useTicketHandleTimeTrend,
            ticketAverageHandleTimeQueryFactory,
        ],
    ])('%s', (_testName, useTrendFn, queryFactory) => {
        it('should create reporting filters', () => {
            renderHook(() => useTrendFn(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                queryFactory(statsFilters, timezone),
                queryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })

    describe.each([
        [
            'fetchOpenTicketsTrend',
            fetchOpenTicketsTrend,
            openTicketsQueryFactory,
        ],
        [
            'fetchCustomerSatisfactionTrend',
            fetchCustomerSatisfactionTrend,
            customerSatisfactionQueryFactory,
        ],
        [
            'fetchMedianFirstResponseTimeTrend',
            fetchMedianFirstResponseTimeTrend,
            medianFirstResponseTimeQueryFactory,
        ],
        [
            'fetchMedianResolutionTimeTrend',
            fetchMedianResolutionTimeTrend,
            medianResolutionTimeQueryFactory,
        ],
        [
            'fetchClosedTicketsTrend',
            fetchClosedTicketsTrend,
            closedTicketsQueryFactory,
        ],
        [
            'fetchTicketsCreatedTrend',
            fetchTicketsCreatedTrend,
            ticketsCreatedQueryFactory,
        ],
        [
            'fetchOneTouchTicketsTrend',
            fetchOneTouchTicketsTrend,
            oneTouchTicketsQueryFactory,
        ],
        [
            'fetchZeroTouchTicketsTrend',
            fetchZeroTouchTicketsTrend,
            zeroTouchTicketsQueryFactory,
        ],
        [
            'fetchOpenTicketsTrend',
            fetchOpenTicketsTrend,
            openTicketsQueryFactory,
        ],
        [
            'fetchTicketsRepliedTrend',
            fetchTicketsRepliedTrend,
            ticketsRepliedQueryFactory,
        ],
        [
            'fetchMessagesSentTrend',
            fetchMessagesSentTrend,
            messagesSentQueryFactory,
        ],
        [
            'fetchMessagesPerTicketTrend',
            fetchMessagesPerTicketTrend,
            messagesPerTicketQueryFactory,
        ],
        [
            'fetchTicketHandleTimeTrend',
            fetchTicketHandleTimeTrend,
            ticketAverageHandleTimeQueryFactory,
        ],
    ])('%s', (_testName, fetchTrendFn, queryFactory) => {
        it('should create reporting filters', async () => {
            await fetchTrendFn(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                queryFactory(statsFilters, timezone),
                queryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })
})
