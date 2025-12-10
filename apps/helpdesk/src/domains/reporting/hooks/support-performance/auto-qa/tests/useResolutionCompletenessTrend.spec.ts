import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import {
    fetchResolutionCompletenessTrend,
    useResolutionCompletenessTrend,
} from 'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { resolutionCompletenessQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import { resolutionCompletenessQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('ResolutionCompletenessTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    useMetricTrendMock.mockImplementation(
        ((queryCreator: ReportingQuery) => queryCreator) as any,
    )

    describe('useResolutionCompletenessTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() =>
                useResolutionCompletenessTrend(statsFilters, timezone),
            )

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                resolutionCompletenessQueryFactory(statsFilters, timezone),
                resolutionCompletenessQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
                resolutionCompletenessQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                resolutionCompletenessQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })
    })

    describe('fetchResolutionCompletenessTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchResolutionCompletenessTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                resolutionCompletenessQueryFactory(statsFilters, timezone),
                resolutionCompletenessQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
                resolutionCompletenessQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                resolutionCompletenessQueryV2Factory({
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
