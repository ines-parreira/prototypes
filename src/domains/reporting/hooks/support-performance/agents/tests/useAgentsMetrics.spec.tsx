import React from 'react'

import moment from 'moment/moment'
import { Provider } from 'react-redux'

import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
    useMedianResponseTimeMetricPerAgent,
    useMessagesReceivedMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketAverageHandleTimePerAgent,
    useTicketsRepliedMetricPerAgent,
    useZeroTouchTicketsMetricPerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import { useAgentsMetrics } from 'domains/reporting/hooks/support-performance/agents/useAgentsMetrics'
import { usePercentageOfClosedTicketsMetricPerAgent } from 'domains/reporting/hooks/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent'
import { useOneTouchTicketsPercentageMetricPerAgent } from 'domains/reporting/hooks/support-performance/overview/useOneTouchTicketsPercentageMetricPerAgent'
import { useMessagesSentPerHourPerAgent } from 'domains/reporting/hooks/useMessagesSentPerHourPerAgent'
import { useTicketsClosedPerHourPerAgent } from 'domains/reporting/hooks/useTicketsClosedPerHourPerAgent'
import { useTicketsRepliedPerHourPerAgent } from 'domains/reporting/hooks/useTicketsRepliedPerHourPerAgent'
import { initialState as agentPerformanceInitialState } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { AGENT_PERFORMANCE_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { RootState } from 'state/types'
import { assumeMock, mockStore } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/metricsPerAgent')
jest.mock('domains/reporting/hooks/useMessagesSentPerHourPerAgent')
jest.mock(
    'domains/reporting/hooks/support-performance/overview/useOneTouchTicketsPercentageMetricPerAgent',
)

jest.mock(
    'domains/reporting/hooks/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent',
)
jest.mock('domains/reporting/hooks/useTicketsClosedPerHourPerAgent')
jest.mock('domains/reporting/hooks/useTicketsRepliedPerHourPerAgent')
const useCustomerSatisfactionMetricPerAgentMock = assumeMock(
    useCustomerSatisfactionMetricPerAgent,
)
const usePercentageOfClosedTicketsMetricPerAgentMock = assumeMock(
    usePercentageOfClosedTicketsMetricPerAgent,
)
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent,
)
const useMedianFirstResponseTimeMetricPerAgentMock = assumeMock(
    useMedianFirstResponseTimeMetricPerAgent,
)
const useMedianResponseTimeMetricPerAgentMock = assumeMock(
    useMedianResponseTimeMetricPerAgent,
)
const useMessagesSentMetricPerAgentMock = assumeMock(
    useMessagesSentMetricPerAgent,
)
const useMessagesReceivedMetricPerAgentMock = assumeMock(
    useMessagesReceivedMetricPerAgent,
)
const useMedianResolutionTimeMetricPerAgentMock = assumeMock(
    useMedianResolutionTimeMetricPerAgent,
)
const useTicketsRepliedMetricPerAgentMock = assumeMock(
    useTicketsRepliedMetricPerAgent,
)
const useOneTouchTicketsPercentageMetricPerAgentMock = assumeMock(
    useOneTouchTicketsPercentageMetricPerAgent,
)
const useZeroTouchTicketsMetricPerAgentMock = assumeMock(
    useZeroTouchTicketsMetricPerAgent,
)
const useTicketsRepliedPerHourPerAgentMock = assumeMock(
    useTicketsRepliedPerHourPerAgent,
)
const useOnlineTimePerAgentMock = assumeMock(useOnlineTimePerAgent)
const useMessagesSentPerHourPerAgentMock = assumeMock(
    useMessagesSentPerHourPerAgent,
)
const useTicketsClosedPerHourPerAgentMock = assumeMock(
    useTicketsClosedPerHourPerAgent,
)
const useTicketAverageHandleTimePerAgentMock = assumeMock(
    useTicketAverageHandleTimePerAgent,
)

describe('useAgentsMetric', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const period = {
        end_datetime: periodEnd.toISOString(),
        start_datetime: periodStart.toISOString(),
    }
    const metricData = {
        isFetching: false,
        isError: false,
        data: {
            value: 2,
            decile: 0,
            allData: [],
        },
    }
    const expectedAgentsMetrics: ReturnType<typeof useAgentsMetrics> = {
        reportData: {
            closedTicketsMetric: metricData,
            customerSatisfactionMetric: metricData,
            medianFirstResponseTimeMetric: metricData,
            medianResponseTimeMetric: metricData,
            messagesSentMetric: metricData,
            messagesReceivedMetric: metricData,
            percentageOfClosedTicketsMetric: metricData,
            medianResolutionTimeMetric: metricData,
            ticketsRepliedMetric: metricData,
            oneTouchTicketsMetric: metricData,
            zeroTouchTicketsMetric: metricData,
            repliedTicketsPerHourMetric: metricData,
            onlineTimeMetric: metricData,
            messagesSentPerHourMetric: metricData,
            closedTicketsPerHourMetric: metricData,
            ticketHandleTimeMetric: metricData,
        },
        isLoading: false,
        period,
    }
    const state = {
        stats: {
            filters: { period },
        },
        ui: {
            stats: {
                filters: uiStatsInitialState,
                statsTables: {
                    [AGENT_PERFORMANCE_SLICE_NAME]:
                        agentPerformanceInitialState,
                },
            },
        },
    } as RootState

    beforeEach(() => {
        useCustomerSatisfactionMetricPerAgentMock.mockReturnValue(metricData)
        usePercentageOfClosedTicketsMetricPerAgentMock.mockReturnValue(
            metricData,
        )
        useClosedTicketsMetricPerAgentMock.mockReturnValue(metricData)
        useMedianFirstResponseTimeMetricPerAgentMock.mockReturnValue(metricData)
        useMedianResponseTimeMetricPerAgentMock.mockReturnValue(metricData)
        useMessagesSentMetricPerAgentMock.mockReturnValue(metricData)
        useMessagesReceivedMetricPerAgentMock.mockReturnValue(metricData)
        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(metricData)
        useTicketsRepliedMetricPerAgentMock.mockReturnValue(metricData)
        useOneTouchTicketsPercentageMetricPerAgentMock.mockReturnValue(
            metricData,
        )
        useZeroTouchTicketsMetricPerAgentMock.mockReturnValue(metricData)
        useTicketsRepliedPerHourPerAgentMock.mockReturnValue(metricData)
        useOnlineTimePerAgentMock.mockReturnValue(metricData)
        useMessagesSentPerHourPerAgentMock.mockReturnValue(metricData)
        useTicketsClosedPerHourPerAgentMock.mockReturnValue(metricData)
        useTicketAverageHandleTimePerAgentMock.mockReturnValue(metricData)
    })

    it('should return agents performance metrics', () => {
        const { result } = renderHook(() => useAgentsMetrics(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual(expectedAgentsMetrics)
    })
})
