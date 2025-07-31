import { renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchEfficiencyPerAgent,
    useEfficiencyPerAgent,
} from 'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyPerAgent'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { efficiencyPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/efficiencyQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

describe('EfficiencyPerAgent', () => {
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

    describe('useEfficiencyPerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useEfficiencyPerAgent(
                    statsFilters,
                    timezone,
                    undefined,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                efficiencyPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                agentId,
            )
        })
    })

    describe('fetchEfficiencyPerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchEfficiencyPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId,
            )

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                efficiencyPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                agentId,
            )
        })
    })
})
