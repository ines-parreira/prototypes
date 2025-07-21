import moment from 'moment'

import {
    fetchSurveysSentTrend,
    useSurveysSentTrend,
} from 'domains/reporting/hooks/quality-management/satisfaction/useSurveysSentTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { surveysSentQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/surveysSentQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import {
    formatReportingQueryDate,
    getPreviousPeriod,
} from 'domains/reporting/utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('SurveysSentTrend', () => {
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

    describe('useSurveysSentTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => useSurveysSentTrend(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                surveysSentQueryFactory(statsFilters, timezone),
                surveysSentQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })

    describe('fetchSurveysSentTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchSurveysSentTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                surveysSentQueryFactory(statsFilters, timezone),
                surveysSentQueryFactory(
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
