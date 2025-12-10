import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchAccuracyTrend,
    useAccuracyTrend,
} from 'domains/reporting/hooks/support-performance/auto-qa/useAccuracyTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { accuracyQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/accuracyQueryFactory'
import { accuracyQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('AccuracyTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useAccuracyTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => useAccuracyTrend(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                accuracyQueryFactory(statsFilters, timezone),
                accuracyQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
                accuracyQueryV2Factory({ filters: statsFilters, timezone }),
                accuracyQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })
    })

    describe('fetchAccuracyTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchAccuracyTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                accuracyQueryFactory(statsFilters, timezone),
                accuracyQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
                accuracyQueryV2Factory({ filters: statsFilters, timezone }),
                accuracyQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })
    })
})
