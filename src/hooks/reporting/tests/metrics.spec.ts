import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'
import {
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useFirstResponseTimeMetric,
    useMessagesSentMetric,
    useResolutionTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import {useMetric} from 'hooks/reporting/useMetric'

jest.mock('hooks/reporting/useMetric')
const useMetricMock = assumeMock(useMetric)

describe('metrics', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }

    const defaultMetricValue = {
        data: {value: 1},
        isError: false,
        isFetching: false,
    }

    useMetricMock.mockReturnValue(defaultMetricValue)

    describe.each([
        ['useClosedTicketsMetric', useClosedTicketsMetric],
        ['useCustomerSatisfactionMetric', useCustomerSatisfactionMetric],
        ['useFirstResponseTimeMetric', useFirstResponseTimeMetric],
        ['useMessagesSentMetric', useMessagesSentMetric],
        ['useResolutionTimeMetric', useResolutionTimeMetric],
        ['useTicketsRepliedMetric', useTicketsRepliedMetric],
    ])('%s', (testName, useTrendFn) => {
        it('should create reporting metric', () => {
            const {result} = renderHook(() => useTrendFn(statsFilters, 'UTC'))
            expect(result.current).toBe(defaultMetricValue)
        })
    })
})
