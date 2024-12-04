import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'

import {useSurveysSentTrend} from 'hooks/reporting/quality-management/satisfaction/useSurveysSentTrend'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {surveysSentQueryFactory} from 'models/reporting/queryFactories/satisfaction/surveysSentQueryFactory'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

describe('useSurveysSentTrend', () => {
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
