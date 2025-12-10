import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchEfficiencyPerAgent,
    useEfficiencyPerAgent,
} from 'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyPerAgent'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { efficiencyPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/efficiencyQueryFactory'
import { efficiencyPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

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

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                efficiencyPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                efficiencyPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
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

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                efficiencyPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                efficiencyPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })
})
