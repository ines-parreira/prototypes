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
} from 'domains/reporting/hooks/metrics'
import { useAgentsAverageMetrics } from 'domains/reporting/hooks/support-performance/agents/useAgentsAverageMetrics'
import { useOneTouchTicketsPercentageMetricTrend } from 'domains/reporting/hooks/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { useZeroTouchTicketsMetricTrend } from 'domains/reporting/hooks/support-performance/overview/useZeroTouchTicketsMetricTrend'
import { useMessagesSentPerHour } from 'domains/reporting/hooks/useMessagesSentPerHour'
import { useTicketsClosedPerHour } from 'domains/reporting/hooks/useTicketsClosedPerHour'
import { useTicketsRepliedPerHour } from 'domains/reporting/hooks/useTicketsRepliedPerHour'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import useAppSelector from 'hooks/useAppSelector'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/metrics')
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
    'domains/reporting/hooks/support-performance/overview/useOneTouchTicketsPercentageMetricTrend',
)
const useOneTouchTicketsPercentageMetricTrendMock = assumeMock(
    useOneTouchTicketsPercentageMetricTrend,
)
jest.mock(
    'domains/reporting/hooks/support-performance/overview/useZeroTouchTicketsMetricTrend',
)
const useZeroTouchTicketsPercentageMetricTrendMock = assumeMock(
    useZeroTouchTicketsMetricTrend,
)
jest.mock('domains/reporting/hooks/useTicketsRepliedPerHour')
const useTicketsRepliedPerHourMock = assumeMock(useTicketsRepliedPerHour)
const useOnlineTimeMetricMock = assumeMock(useOnlineTimeMetric)
jest.mock('domains/reporting/hooks/useMessagesSentPerHour')
const useMessagesSentPerHourMock = assumeMock(useMessagesSentPerHour)
jest.mock('domains/reporting/hooks/useTicketsClosedPerHour')
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
