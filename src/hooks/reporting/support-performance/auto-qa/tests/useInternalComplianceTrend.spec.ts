import moment from 'moment'

import {
    fetchInternalComplianceTrend,
    useInternalComplianceTrend,
} from 'hooks/reporting/support-performance/auto-qa/useInternalComplianceTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { internalComplianceQueryFactory } from 'models/reporting/queryFactories/auto-qa/internalComplianceQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate, getPreviousPeriod } from 'utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('InternalComplianceTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useInternalComplianceTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => useInternalComplianceTrend(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                internalComplianceQueryFactory(statsFilters, timezone),
                internalComplianceQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })

    describe('fetchInternalComplianceTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() =>
                fetchInternalComplianceTrend(statsFilters, timezone),
            )

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                internalComplianceQueryFactory(statsFilters, timezone),
                internalComplianceQueryFactory(
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
