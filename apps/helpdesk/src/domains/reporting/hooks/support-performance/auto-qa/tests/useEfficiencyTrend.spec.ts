import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchEfficiencyTrend,
    useEfficiencyTrend,
} from 'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { efficiencyQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/efficiencyQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
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
                    timezone,
                ),
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
                    timezone,
                ),
            )
        })
    })
})
