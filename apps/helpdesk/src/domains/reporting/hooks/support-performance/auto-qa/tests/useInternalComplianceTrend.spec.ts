import { renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchInternalComplianceTrend,
    useInternalComplianceTrend,
} from 'domains/reporting/hooks/support-performance/auto-qa/useInternalComplianceTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { internalComplianceQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/internalComplianceQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/useMetricTrend')
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
