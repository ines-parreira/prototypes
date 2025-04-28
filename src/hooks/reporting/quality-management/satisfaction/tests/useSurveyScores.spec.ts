import moment from 'moment'

import {
    fetchSurveyScores,
    useSurveyScores,
} from 'hooks/reporting/quality-management/satisfaction/useSurveyScores'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { surveyScoresQueryFactory } from 'models/reporting/queryFactories/satisfaction/surveyScoresQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

describe('SurveyScores', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useSurveyScores', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => useSurveyScores(statsFilters, timezone))

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                surveyScoresQueryFactory(statsFilters, timezone),
            )
        })
    })

    describe('fetchSurveyScores', () => {
        it('should pass query factories with two periods', async () => {
            await fetchSurveyScores(statsFilters, timezone)

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                surveyScoresQueryFactory(statsFilters, timezone),
            )
        })
    })
})
