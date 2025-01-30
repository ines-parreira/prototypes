import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'

import {useSurveyScores} from 'hooks/reporting/quality-management/satisfaction/useSurveyScores'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {TicketSatisfactionSurveyDimension} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {surveyScoresQueryFactory} from 'models/reporting/queryFactories/satisfaction/surveyScoresQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('useSurveyScores', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    useMetricPerDimensionMock.mockImplementation(() => ({
        isFetching: false,
        isError: false,
        data: {
            value: null,
            decile: null,
            allData: [
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '1'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '2'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '3'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '4'},
                {[TicketSatisfactionSurveyDimension.SurveyScore]: '5'},
            ],
        },
    }))

    it('should pass query factories with two periods', () => {
        renderHook(() => useSurveyScores(statsFilters, timezone))

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            surveyScoresQueryFactory(statsFilters, timezone)
        )
    })
})
