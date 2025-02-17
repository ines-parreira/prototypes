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
    useTicketAverageHandleTimePerChannel,
    useCreatedTicketsMetricPerChannel,
} from 'hooks/reporting/support-performance/channels/metricsPerChannel'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
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
import {LegacyStatsFilters} from 'models/stat/types'

import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

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

    describe('useMedianFirstResponseTimeMetricPerChannel', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useMedianFirstResponseTimeMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        channel
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                medianFirstResponseTimeMetricPerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                channel
            )
        })
    })

    describe('useTicketsRepliedMetricPerChannel', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useTicketsRepliedMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        channel
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                ticketsRepliedMetricPerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                channel
            )
        })
    })

    describe('useClosedTicketsMetricPerChannel', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useClosedTicketsMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        channel
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                closedTicketsPerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                channel
            )
        })
    })

    describe('useCreatedTicketsMetricPerChannel', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useCreatedTicketsMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        channel
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                ticketsCreatedPerChannelPerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                channel
            )
        })
    })

    describe('useMessagesSentMetricPerChannel', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useMessagesSentMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        channel
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                messagesSentMetricPerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                channel
            )
        })
    })

    describe('useMedianResolutionTimeMetricPerChannel', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useMedianResolutionTimeMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        channel
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                medianResolutionTimeMetricPerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                channel
            )
        })
    })

    describe('useCustomerSatisfactionMetricPerChannel', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useCustomerSatisfactionMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        channel
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customerSatisfactionMetricPerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                channel
            )
        })
    })

    describe('useOneTouchTicketsMetricPerChannel', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useOneTouchTicketsMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        channel
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                oneTouchTicketsPerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                channel
            )
        })
    })

    describe('useTicketAverageHandleTimePerChannel', () => {
        it('should pass the query to useMetricPerDimension hook with channel', () => {
            renderHook(
                () =>
                    useTicketAverageHandleTimePerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        channel
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                ticketAverageHandleTimePerAgentPerChannelQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                channel
            )
        })
    })
})
