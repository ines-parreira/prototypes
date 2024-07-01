import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import {ticketAverageHandleTimeQueryFactory} from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import {closedTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {medianFirstResponseTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import {medianResolutionTimeQueryFactory} from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import {oneTouchTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/oneTouchTickets'
import {ticketsCreatedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import {messagesPerTicketQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesPerTicket'
import {messagesSentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {openTicketsQueryFactory} from 'models/reporting/queryFactories/support-performance/openTickets'
import {ticketsRepliedQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

import {
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useMedianFirstResponseTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useMedianResolutionTimeTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
    useOneTouchTicketsTrend,
    useTicketHandleTimeTrend,
} from '../metricTrends'

jest.mock('../useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

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
        ((queryCreator: ReportingQuery) => queryCreator) as any
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
                    timezone
                )
            )
        })
    })
})
