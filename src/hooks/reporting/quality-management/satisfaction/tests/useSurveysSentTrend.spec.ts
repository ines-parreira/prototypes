import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'

import {
    fetchSurveysSentTrend,
    useSurveysSentTrend,
} from 'hooks/reporting/quality-management/satisfaction/useSurveysSentTrend'
import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {surveysSentQueryFactory} from 'models/reporting/queryFactories/satisfaction/surveysSentQueryFactory'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
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
        ((queryCreator: ReportingQuery) => queryCreator) as any
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
                    timezone
                )
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
                    timezone
                )
            )
        })
    })
})
