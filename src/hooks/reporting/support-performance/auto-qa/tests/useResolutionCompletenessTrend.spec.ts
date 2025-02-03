import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'

import {
    fetchResolutionCompletenessTrend,
    useResolutionCompletenessTrend,
} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessTrend'
import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {resolutionCompletenessQueryFactory} from 'models/reporting/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('ResolutionCompletenessTrend', () => {
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

    describe('useResolutionCompletenessTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() =>
                useResolutionCompletenessTrend(statsFilters, timezone)
            )

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                resolutionCompletenessQueryFactory(statsFilters, timezone),
                resolutionCompletenessQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone
                )
            )
        })
    })

    describe('fetchResolutionCompletenessTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchResolutionCompletenessTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                resolutionCompletenessQueryFactory(statsFilters, timezone),
                resolutionCompletenessQueryFactory(
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
