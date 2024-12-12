import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment'

import {useBrandVoiceTrend} from 'hooks/reporting/support-performance/auto-qa/useBrandVoiceTrend'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {brandVoiceQueryFactory} from 'models/reporting/queryFactories/auto-qa/brandVoiceQueryFactory'

import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

describe('useBrandVoiceTrend', () => {
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
        renderHook(() => useBrandVoiceTrend(statsFilters, timezone))

        expect(useMetricTrendMock).toHaveBeenCalledWith(
            brandVoiceQueryFactory(statsFilters, timezone),
            brandVoiceQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone
            )
        )
    })
})
