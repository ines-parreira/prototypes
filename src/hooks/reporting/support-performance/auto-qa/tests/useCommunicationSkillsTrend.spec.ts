import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment'

import {
    fetchCommunicationSkillsTrend,
    useCommunicationSkillsTrend,
} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsTrend'
import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { communicationSkillsQueryFactory } from 'models/reporting/queryFactories/auto-qa/communicationSkillsQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate, getPreviousPeriod } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)
const fetchMetricTrendMock = assumeMock(fetchMetricTrend)

describe('CommunicationSkillsTrend', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useCommunicationSkillsTrend', () => {
        it('should pass query factories with two periods', () => {
            renderHook(() =>
                useCommunicationSkillsTrend(statsFilters, timezone),
            )

            expect(useMetricTrendMock).toHaveBeenCalledWith(
                communicationSkillsQueryFactory(statsFilters, timezone),
                communicationSkillsQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })

    describe('fetchCommunicationSkillsTrend', () => {
        it('should pass query factories with two periods', async () => {
            await fetchCommunicationSkillsTrend(statsFilters, timezone)

            expect(fetchMetricTrendMock).toHaveBeenCalledWith(
                communicationSkillsQueryFactory(statsFilters, timezone),
                communicationSkillsQueryFactory(
                    {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                ),
            )
        })
    })
})
