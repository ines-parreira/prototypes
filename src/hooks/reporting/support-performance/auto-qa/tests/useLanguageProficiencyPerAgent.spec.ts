import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment'

import {
    fetchLanguageProficiencyPerAgent,
    useLanguageProficiencyPerAgent,
} from 'hooks/reporting/support-performance/auto-qa/useLanguageProficiencyPerAgent'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { languageProficiencyPerAgentQueryFactory } from 'models/reporting/queryFactories/auto-qa/languageProficiencyQueryFactory'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

describe('useLanguageProficiencyPerAgent', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const agentId = '123'
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe('useLanguageProficiencyPerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useLanguageProficiencyPerAgent(
                    statsFilters,
                    timezone,
                    undefined,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                languageProficiencyPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                agentId,
            )
        })
    })

    describe('fetchLanguageProficiencyPerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchLanguageProficiencyPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId,
            )

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                languageProficiencyPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                agentId,
            )
        })
    })
})
