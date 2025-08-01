import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchSurveyScores,
    useSurveyScores,
} from 'domains/reporting/hooks/quality-management/satisfaction/useSurveyScores'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { surveyScoresQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/surveyScoresQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
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
