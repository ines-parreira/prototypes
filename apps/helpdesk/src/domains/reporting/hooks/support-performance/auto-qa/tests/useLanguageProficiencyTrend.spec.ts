import { renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchLanguageProficiencyTrend,
    useLanguageProficiencyTrend,
} from 'domains/reporting/hooks/support-performance/auto-qa/useLanguageProficiencyTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { languageProficiencyQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/languageProficiencyQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('LanguageProficiencyTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useLanguageProficiencyTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() =>
                useLanguageProficiencyTrend(statsFilters, timezone),
            )

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                languageProficiencyQueryFactory(statsFilters, timezone),
                languageProficiencyQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })

    describe('fetchLanguageProficiencyTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchLanguageProficiencyTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                languageProficiencyQueryFactory(statsFilters, timezone),
                languageProficiencyQueryFactory(
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
