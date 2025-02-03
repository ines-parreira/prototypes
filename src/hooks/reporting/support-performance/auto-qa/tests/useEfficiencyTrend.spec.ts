import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment'

import {
    fetchEfficiencyTrend,
    useEfficiencyTrend,
} from 'hooks/reporting/support-performance/auto-qa/useEfficiencyTrend'
import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {efficiencyQueryFactory} from 'models/reporting/queryFactories/auto-qa/efficiencyQueryFactory'

import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('EfficiencyTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useEfficiencyTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => useEfficiencyTrend(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                efficiencyQueryFactory(statsFilters, timezone),
                efficiencyQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone
                )
            )
        })
    })

    describe('fetchEfficiencyTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => fetchEfficiencyTrend(statsFilters, timezone))

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                efficiencyQueryFactory(statsFilters, timezone),
                efficiencyQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone
                )
            )
        })
    })
})
