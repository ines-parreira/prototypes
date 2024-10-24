import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment'

import {useCommunicationSkillsTrend} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsTrend'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {communicationSkillsQueryFactory} from 'models/reporting/queryFactories/auto-qa/communicationSkillsQueryFactory'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {formatReportingQueryDate, getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

describe('useCommunicationSkillsTrend', () => {
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
        renderHook(() => useCommunicationSkillsTrend(statsFilters, timezone))

        expect(useMetricTrendMock).toHaveBeenCalledWith(
            communicationSkillsQueryFactory(statsFilters, timezone),
            communicationSkillsQueryFactory(
                {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone
            )
        )
    })
})
