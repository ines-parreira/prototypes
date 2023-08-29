import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'

import {assumeMock} from 'utils/testing'
import {useAgentsMetrics} from 'pages/stats/useAgentsMetrics'

jest.mock('pages/stats/useAgentsMetrics')
const useAgentsMetricsMock = assumeMock(useAgentsMetrics)

describe('useAgentsMetric', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const metricData = {
        isFetching: false,
        isError: false,
        data: {
            value: 2,
            decile: 0,
            allData: [],
        },
    }
    const agentsMetrics: ReturnType<typeof useAgentsMetrics> = {
        reportData: {
            agents: [],
            closedTicketsMetric: metricData,
            customerSatisfactionMetric: metricData,
            firstResponseTimeMetric: metricData,
            messagesSentMetric: metricData,
            percentageOfClosedTicketsMetric: metricData,
            resolutionTimeMetric: metricData,
            ticketsRepliedMetric: metricData,
        },
        isLoading: false,
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }

    it('should return agents performance metrics', () => {
        useAgentsMetricsMock.mockReturnValue(agentsMetrics)
        const {result} = renderHook(() => useAgentsMetrics())

        expect(result.current).toEqual(agentsMetrics)
    })
})
