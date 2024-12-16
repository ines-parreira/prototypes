import {renderHook} from '@testing-library/react-hooks'

import {
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
    useTicketAverageHandleTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import {useAgentsSummaryMetrics} from 'hooks/reporting/support-performance/agents/useAgentsSummaryMetrics'
import {useOneTouchTicketsPercentageMetricTrend} from 'hooks/reporting/support-performance/agents/useOneTouchTicketsPercentageMetricTrend'
import {useMessagesSentPerHour} from 'hooks/reporting/useMessagesSentPerHour'
import {useTicketsClosedPerHour} from 'hooks/reporting/useTicketsClosedPerHour'
import {useTicketsRepliedPerHour} from 'hooks/reporting/useTicketsRepliedPerHour'
import useAppSelector from 'hooks/useAppSelector'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/metrics')
const useCustomerSatisfactionMetricMock = assumeMock(
    useCustomerSatisfactionMetric
)
const useClosedTicketsMetricMock = assumeMock(useClosedTicketsMetric)

const useMedianFirstResponseTimeMetricMock = assumeMock(
    useMedianFirstResponseTimeMetric
)
const useMessagesSentMetricMock = assumeMock(useMessagesSentMetric)
const useMedianResolutionTimeMetricMock = assumeMock(
    useMedianResolutionTimeMetric
)
const useTicketsRepliedMetricMock = assumeMock(useTicketsRepliedMetric)
jest.mock(
    'hooks/reporting/support-performance/agents/useOneTouchTicketsPercentageMetricTrend'
)
const useOneTouchTicketsPercentageMetricTrendMock = assumeMock(
    useOneTouchTicketsPercentageMetricTrend
)
jest.mock('hooks/reporting/useTicketsRepliedPerHour')
const useTicketsRepliedPerHourMock = assumeMock(useTicketsRepliedPerHour)
const useOnlineTimeMetricMock = assumeMock(useOnlineTimeMetric)
jest.mock('hooks/reporting/useMessagesSentPerHour')
const useMessagesSentPerHourMock = assumeMock(useMessagesSentPerHour)
jest.mock('hooks/reporting/useTicketsClosedPerHour')
const useTicketsClosedPerHourMock = assumeMock(useTicketsClosedPerHour)
const useTicketAverageHandleTimeMetricMock = assumeMock(
    useTicketAverageHandleTimeMetric
)
jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

describe('useAgentsSummaryMetrics', () => {
    const granularity = ReportingGranularity.Month

    const timeZone = 'UTC'
    const filters: StatsFilters = {
        period: {start_datetime: '2023-01-01', end_datetime: '2023-02-01'},
    }
    const metricData = {
        isFetching: false,
        isError: false,
        data: {
            value: 2,
        },
    }
    const agentsMetrics: ReturnType<typeof useAgentsSummaryMetrics> = {
        summaryData: {
            closedTicketsMetric: metricData,
            customerSatisfactionMetric: metricData,
            medianFirstResponseTimeMetric: metricData,
            messagesSentMetric: metricData,
            percentageOfClosedTicketsMetric: metricData,
            medianResolutionTimeMetric: metricData,
            ticketsRepliedMetric: metricData,
            oneTouchTicketsMetric: {
                ...metricData,
                data: {...metricData.data, prevValue: 0},
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
    useMessagesSentMetricMock.mockReturnValue(metricData)
    useMedianResolutionTimeMetricMock.mockReturnValue(metricData)
    useTicketsRepliedMetricMock.mockReturnValue(metricData)
    useOneTouchTicketsPercentageMetricTrendMock.mockReturnValue({
        ...metricData,
        data: {...metricData.data, prevValue: 0},
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

    it('should return agents performance summary metrics', () => {
        const {result} = renderHook(() => useAgentsSummaryMetrics())

        expect(result.current).toEqual(agentsMetrics)
    })
})
