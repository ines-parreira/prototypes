import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment'

import {useLanguageProficiencyTrend} from 'hooks/reporting/support-performance/auto-qa/useLanguageProficiencyTrend'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {languageProficiencyQueryFactory} from 'models/reporting/queryFactories/auto-qa/languageProficiencyQueryFactory'

import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

describe('useLanguageProficiencyTrend', () => {
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
        renderHook(() => useLanguageProficiencyTrend(statsFilters, timezone))

        expect(useMetricTrendMock).toHaveBeenCalledWith(
            languageProficiencyQueryFactory(statsFilters, timezone),
            languageProficiencyQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone
            )
        )
    })
})
