import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment/moment'
import { Provider } from 'react-redux'

import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketAverageHandleTimePerAgent,
    useTicketsRepliedMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import { useAgentsMetrics } from 'hooks/reporting/support-performance/agents/useAgentsMetrics'
import { usePercentageOfClosedTicketsMetricPerAgent } from 'hooks/reporting/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent'
import { useOneTouchTicketsPercentageMetricPerAgent } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricPerAgent'
import { useZeroTouchTicketsPercentageMetricPerAgent } from 'hooks/reporting/support-performance/overview/useZeroTouchTicketsPercentageMetricPerAgent'
import { useMessagesSentPerHourPerAgent } from 'hooks/reporting/useMessagesSentPerHourPerAgent'
import { useTicketsClosedPerHourPerAgent } from 'hooks/reporting/useTicketsClosedPerHourPerAgent'
import { useTicketsRepliedPerHourPerAgent } from 'hooks/reporting/useTicketsRepliedPerHourPerAgent'
import { RootState } from 'state/types'
import { initialState as agentPerformanceInitialState } from 'state/ui/stats/agentPerformanceSlice'
import { AGENT_PERFORMANCE_SLICE_NAME } from 'state/ui/stats/constants'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { assumeMock, mockStore } from 'utils/testing'

jest.mock('hooks/reporting/metricsPerAgent')
jest.mock('hooks/reporting/useMessagesSentPerHourPerAgent')
jest.mock(
    'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricPerAgent',
)
jest.mock(
    'hooks/reporting/support-performance/overview/useZeroTouchTicketsPercentageMetricPerAgent',
)
jest.mock(
    'hooks/reporting/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent',
)
jest.mock('hooks/reporting/useTicketsClosedPerHourPerAgent')
jest.mock('hooks/reporting/useTicketsRepliedPerHourPerAgent')
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
const useMessagesSentMetricPerAgentMock = assumeMock(
    useMessagesSentMetricPerAgent,
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
const useZeroTouchTicketsPercentageMetricPerAgentMock = assumeMock(
    useZeroTouchTicketsPercentageMetricPerAgent,
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
            messagesSentMetric: metricData,
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
        useMessagesSentMetricPerAgentMock.mockReturnValue(metricData)
        useMedianResolutionTimeMetricPerAgentMock.mockReturnValue(metricData)
        useTicketsRepliedMetricPerAgentMock.mockReturnValue(metricData)
        useOneTouchTicketsPercentageMetricPerAgentMock.mockReturnValue(
            metricData,
        )
        useZeroTouchTicketsPercentageMetricPerAgentMock.mockReturnValue(
            metricData,
        )
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
