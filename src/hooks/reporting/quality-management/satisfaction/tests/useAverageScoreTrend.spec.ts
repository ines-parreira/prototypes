import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'

import {
    fetchAverageScoreTrend,
    useAverageScoreTrend,
} from 'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {averageScoreQueryFactory} from 'models/reporting/queryFactories/satisfaction/averageScoreQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('AverageScoreTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useAverageScoreTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() => useAverageScoreTrend(statsFilters, timezone))

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                averageScoreQueryFactory(statsFilters, timezone),
                averageScoreQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone
                )
            )
        })
    })

    describe('fetchAverageScoreTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchAverageScoreTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                averageScoreQueryFactory(statsFilters, timezone),
                averageScoreQueryFactory(
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
