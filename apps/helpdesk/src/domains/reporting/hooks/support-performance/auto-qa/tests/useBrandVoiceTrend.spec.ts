import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchBrandVoiceTrend,
    useBrandVoiceTrend,
} from 'domains/reporting/hooks/support-performance/auto-qa/useBrandVoiceTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { brandVoiceQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/brandVoiceQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('BrandVoiceTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'
    describe('useBrandVoiceTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => useBrandVoiceTrend(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                brandVoiceQueryFactory(statsFilters, timezone),
                brandVoiceQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })

    describe('fetchBrandVoiceTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchBrandVoiceTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                brandVoiceQueryFactory(statsFilters, timezone),
                brandVoiceQueryFactory(
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
