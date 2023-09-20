import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'
import {
    closedTicketsQueryFactory,
    customerSatisfactionQueryFactory,
    firstResponseTimeQueryFactory,
    messagesSentQueryFactory,
    ticketsRepliedQueryFactory,
    resolutionTimeQueryFactory,
} from 'hooks/reporting/metricTrends'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, withFilter} from 'utils/reporting'
import {assumeMock} from 'utils/testing'
import {
    ignoreNotAssignedTicketsFilter,
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
    const timezone = 'UTC'

    const defaultMetricValue = {
        data: {value: 1},
        isError: false,
        isFetching: false,
    }

    useMetricMock.mockReturnValue(defaultMetricValue)

    describe.each([
        [
            'useClosedTicketsMetric',
            useClosedTicketsMetric,
            closedTicketsQueryFactory,
        ],
        [
            'useCustomerSatisfactionMetric',
            useCustomerSatisfactionMetric,
            customerSatisfactionQueryFactory,
        ],
        [
            'useFirstResponseTimeMetric',
            useFirstResponseTimeMetric,
            firstResponseTimeQueryFactory,
        ],
        [
            'useMessagesSentMetric',
            useMessagesSentMetric,
            messagesSentQueryFactory,
        ],
        [
            'useResolutionTimeMetric',
            useResolutionTimeMetric,
            resolutionTimeQueryFactory,
        ],
        [
            'useTicketsRepliedMetric',
            useTicketsRepliedMetric,
            ticketsRepliedQueryFactory,
        ],
    ])(
        '%s',
        (
            _,
            useTrendFn,
            queryFactory: (
                statsFilters: StatsFilters,
                timezone: string
            ) => ReportingQuery
        ) => {
            it('should create reporting metric', () => {
                const {result} = renderHook(() =>
                    useTrendFn(statsFilters, timezone)
                )

                expect(useMetricMock).toHaveBeenCalledWith(
                    withFilter(
                        queryFactory(statsFilters, timezone),
                        ignoreNotAssignedTicketsFilter
                    )
                )
                expect(result.current).toBe(defaultMetricValue)
            })
        }
    )
})
