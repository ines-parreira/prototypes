import {
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useMedianResponseTimeMetric,
    useMessagesReceivedMetric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
    useTicketAverageHandleTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import { useAgentsAverageMetrics } from 'hooks/reporting/support-performance/agents/useAgentsAverageMetrics'
import { useOneTouchTicketsPercentageMetricTrend } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { useZeroTouchTicketsMetricTrend } from 'hooks/reporting/support-performance/overview/useZeroTouchTicketsMetricTrend'
import { useMessagesSentPerHour } from 'hooks/reporting/useMessagesSentPerHour'
import { useTicketsClosedPerHour } from 'hooks/reporting/useTicketsClosedPerHour'
import { useTicketsRepliedPerHour } from 'hooks/reporting/useTicketsRepliedPerHour'
import useAppSelector from 'hooks/useAppSelector'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/metrics')
const useCustomerSatisfactionMetricMock = assumeMock(
    useCustomerSatisfactionMetric,
)
const useClosedTicketsMetricMock = assumeMock(useClosedTicketsMetric)

const useMedianFirstResponseTimeMetricMock = assumeMock(
    useMedianFirstResponseTimeMetric,
)
const useMedianResponseTimeMetricMock = assumeMock(useMedianResponseTimeMetric)
const useMessagesSentMetricMock = assumeMock(useMessagesSentMetric)
const useMessagesReceivedMetricMock = assumeMock(useMessagesReceivedMetric)
const useMedianResolutionTimeMetricMock = assumeMock(
    useMedianResolutionTimeMetric,
)
const useTicketsRepliedMetricMock = assumeMock(useTicketsRepliedMetric)
jest.mock(
    'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricTrend',
)
const useOneTouchTicketsPercentageMetricTrendMock = assumeMock(
    useOneTouchTicketsPercentageMetricTrend,
)
jest.mock(
    'hooks/reporting/support-performance/overview/useZeroTouchTicketsMetricTrend',
)
const useZeroTouchTicketsPercentageMetricTrendMock = assumeMock(
    useZeroTouchTicketsMetricTrend,
)
jest.mock('hooks/reporting/useTicketsRepliedPerHour')
const useTicketsRepliedPerHourMock = assumeMock(useTicketsRepliedPerHour)
const useOnlineTimeMetricMock = assumeMock(useOnlineTimeMetric)
jest.mock('hooks/reporting/useMessagesSentPerHour')
const useMessagesSentPerHourMock = assumeMock(useMessagesSentPerHour)
jest.mock('hooks/reporting/useTicketsClosedPerHour')
const useTicketsClosedPerHourMock = assumeMock(useTicketsClosedPerHour)
const useTicketAverageHandleTimeMetricMock = assumeMock(
    useTicketAverageHandleTimeMetric,
)
jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

describe('useAgentsAverageMetrics', () => {
    const granularity = ReportingGranularity.Month

    const timeZone = 'UTC'
    const filters: StatsFilters = {
        period: { start_datetime: '2023-01-01', end_datetime: '2023-02-01' },
    }
    const metricData = {
        isFetching: false,
        isError: false,
        data: {
            value: 2,
        },
    }
    const agentsMetrics: ReturnType<typeof useAgentsAverageMetrics> = {
        averageData: {
            closedTicketsMetric: metricData,
            customerSatisfactionMetric: metricData,
            medianFirstResponseTimeMetric: metricData,
            medianResponseTimeMetric: metricData,
            messagesSentMetric: metricData,
            messagesReceivedMetric: metricData,
            percentageOfClosedTicketsMetric: metricData,
            medianResolutionTimeMetric: metricData,
            ticketsRepliedMetric: metricData,
            oneTouchTicketsMetric: {
                ...metricData,
                data: { ...metricData.data, prevValue: 0 },
            },
            zeroTouchTicketsMetric: {
                ...metricData,
                data: { ...metricData.data, prevValue: 0 },
            },
            repliedTicketsPerHourMetric: metricData,
            onlineTimeMetric: metricData,
            messagesSentPerHourMetric: metricData,
            closedTicketsPerHourMetric: metricData,
            ticketHandleTimeMetric: metricData,
        },
        isLoading: false,
    }

    useCustomerSatisfactionMetricMock.mockReturnValue(metricData)
    useClosedTicketsMetricMock.mockReturnValue(metricData)
    useClosedTicketsMetricMock.mockReturnValue(metricData)
    useMedianFirstResponseTimeMetricMock.mockReturnValue(metricData)
    useMedianResponseTimeMetricMock.mockReturnValue(metricData)
    useMessagesSentMetricMock.mockReturnValue(metricData)
    useMessagesReceivedMetricMock.mockReturnValue(metricData)
    useMedianResolutionTimeMetricMock.mockReturnValue(metricData)
    useTicketsRepliedMetricMock.mockReturnValue(metricData)
    useOneTouchTicketsPercentageMetricTrendMock.mockReturnValue({
        ...metricData,
        data: { ...metricData.data, prevValue: 0 },
    })
    useZeroTouchTicketsPercentageMetricTrendMock.mockReturnValue({
        ...metricData,
        data: { ...metricData.data, prevValue: 0 },
    })
    useTicketsRepliedPerHourMock.mockReturnValue(metricData)
    useOnlineTimeMetricMock.mockReturnValue(metricData)
    useMessagesSentPerHourMock.mockReturnValue(metricData)
    useTicketsClosedPerHourMock.mockReturnValue(metricData)
    useTicketAverageHandleTimeMetricMock.mockReturnValue(metricData)
    useAppSelectorMock.mockReturnValue({
        cleanStatsFilters: filters,
        userTimezone: timeZone,
        granularity: granularity,
    })

    it('should return agents performance average metrics', () => {
        const { result } = renderHook(() => useAgentsAverageMetrics())

        expect(result.current).toEqual(agentsMetrics)
    })
})
