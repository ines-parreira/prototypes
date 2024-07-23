import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'
import {useResolvedTicketsTrend} from 'hooks/reporting/support-performance/auto-qa/useResolvedTicketsTrend'
import {resolvedTicketsQueryFactory} from 'models/reporting/queryFactories/auto-qa/resolvedTicketsQueryFactory'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

describe('useResolvedTicketsTrend', () => {
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
        renderHook(() => useResolvedTicketsTrend(statsFilters, timezone))

        expect(useMetricTrendMock).toHaveBeenCalledWith(
            resolvedTicketsQueryFactory(statsFilters, timezone),
            resolvedTicketsQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone
            )
        )
    })
})
