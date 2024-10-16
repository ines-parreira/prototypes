import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'
import {ticketAverageHandleTimePerAgentQueryFactory} from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import {onlineTimePerAgentQueryFactory} from 'models/reporting/queryFactories/agentxp/onlineTime'
import {closedTicketsPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/closedTickets'
import {customerSatisfactionMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {customFieldsTicketCountQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {medianFirstResponseTimeMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import {messagesSentMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/messagesSent'
import {medianResolutionTimeMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import {ticketsRepliedMetricPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import {oneTouchTicketsPerAgentQueryFactory} from 'models/reporting/queryFactories/support-performance/oneTouchTickets'

import {TicketChannel} from 'business/types/ticket'
import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useCustomFieldsTicketCount,
    useCustomTicketFieldWithBreakdown,
    useMedianFirstResponseTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
    useTicketsRepliedMetricPerAgent,
    useOneTouchTicketsMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketAverageHandleTimePerAgent,
} from 'hooks/reporting/metricsPerAgent'
import {
    useMetricPerDimension,
    useMetricPerDimensionWithBreakdown,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {LegacyStatsFilters} from 'models/stat/types'

import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
jest.mock('models/reporting/queryFactories/ticket-insights/tagsTicketCount')

const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const useCustomTicketFieldWithBreakdownMock = assumeMock(
    useMetricPerDimensionWithBreakdown
)

describe('metricsPerAgent', () => {
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
    const agentId = '2'
    const customFieldId = '1'

    describe('useMedianFirstResponseTimeMetricPerAgent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useMedianFirstResponseTimeMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                medianFirstResponseTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })

    describe('useTicketsRepliedMetricPerAgent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useTicketsRepliedMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                ticketsRepliedMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })

    describe('useClosedTicketsMetricPerAgent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useClosedTicketsMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                closedTicketsPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })

    describe('useMessagesSentMetricPerAgent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useMessagesSentMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                messagesSentMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })

    describe('useMedianResolutionTimeMetricPerAgent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useMedianResolutionTimeMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                medianResolutionTimeMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })

    describe('useCustomerSatisfactionMetricPerAgent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useCustomerSatisfactionMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customerSatisfactionMetricPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })

    describe('useCustomFieldsTicketCount', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useCustomFieldsTicketCount(
                        statsFilters,
                        timezone,
                        customFieldId,
                        sorting
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                customFieldsTicketCountQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    sorting
                )
            )
        })
    })

    describe('useCustomFieldsTicketCountWithBreakdown', () => {
        it('should pass the query to useCustomTicketFieldWithBreakdown hook', () => {
            renderHook(
                () =>
                    useCustomTicketFieldWithBreakdown(
                        statsFilters,
                        timezone,
                        customFieldId,
                        sorting
                    ),
                {}
            )

            expect(useCustomTicketFieldWithBreakdownMock).toHaveBeenCalledWith(
                customFieldsTicketCountQueryFactory(
                    statsFilters,
                    timezone,
                    customFieldId,
                    sorting
                )
            )
        })
    })

    describe('useOneTouchTicketsMetricPerAgent', () => {
        it('should pass the query to useMetricPerDimension hook', () => {
            renderHook(
                () =>
                    useOneTouchTicketsMetricPerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                oneTouchTicketsPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })

    describe('useOnlineTimePerAgent', () => {
        it('should pass the query to useMetricPerDimension hook with agentId', () => {
            renderHook(
                () =>
                    useOnlineTimePerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                onlineTimePerAgentQueryFactory(statsFilters, timezone, sorting),
                agentId
            )
        })
    })

    describe('useTicketAverageHandleTimePerAgent', () => {
        it('should pass the query to useMetricPerDimension hook with agentId', () => {
            renderHook(
                () =>
                    useTicketAverageHandleTimePerAgent(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId
                    ),
                {}
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                ticketAverageHandleTimePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    sorting
                ),
                agentId
            )
        })
    })
})
