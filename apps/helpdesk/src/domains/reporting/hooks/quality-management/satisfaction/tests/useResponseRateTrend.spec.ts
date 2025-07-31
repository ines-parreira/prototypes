import { renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchResponseRateTrend,
    useResponseRateTrend,
} from 'domains/reporting/hooks/quality-management/satisfaction/useResponseRateTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { responseRateQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/responseRateQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('ResponseRateTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useResponseRateTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => useResponseRateTrend(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                responseRateQueryFactory(statsFilters, timezone),
                responseRateQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })

    describe('fetchResponseRateTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchResponseRateTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                responseRateQueryFactory(statsFilters, timezone),
                responseRateQueryFactory(
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
