import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'

import {assumeMock} from 'utils/testing'
import {useAgentsSummaryMetrics} from 'hooks/reporting/useAgentsSummaryMetrics'

jest.mock('hooks/reporting/useAgentsSummaryMetrics')
const useAgentsSummaryMetricsMock = assumeMock(useAgentsSummaryMetrics)

describe('useAgentsSummaryMetrics', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
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
            firstResponseTimeMetric: metricData,
            messagesSentMetric: metricData,
            percentageOfClosedTicketsMetric: metricData,
            resolutionTimeMetric: metricData,
            ticketsRepliedMetric: metricData,
            oneTouchTicketsMetric: metricData,
        },
        isLoading: false,
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }

    it('should return agents performance summary metrics', () => {
        useAgentsSummaryMetricsMock.mockReturnValue(agentsMetrics)
        const {result} = renderHook(() => useAgentsSummaryMetrics())

        expect(result.current).toEqual(agentsMetrics)
    })
})
