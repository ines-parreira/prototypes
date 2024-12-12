import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment'

import {useEfficiencyTrend} from 'hooks/reporting/support-performance/auto-qa/useEfficiencyTrend'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {efficiencyQueryFactory} from 'models/reporting/queryFactories/auto-qa/efficiencyQueryFactory'

import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

describe('useEfficiencyTrend', () => {
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
        renderHook(() => useEfficiencyTrend(statsFilters, timezone))

        expect(useMetricTrendMock).toHaveBeenCalledWith(
            efficiencyQueryFactory(statsFilters, timezone),
            efficiencyQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone
            )
        )
    })
})
