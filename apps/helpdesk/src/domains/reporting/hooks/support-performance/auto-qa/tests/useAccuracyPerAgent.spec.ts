import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchAccuracyPerAgent,
    useAccuracyPerAgent,
} from 'domains/reporting/hooks/support-performance/auto-qa/useAccuracyPerAgent'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { accuracyPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/accuracyQueryFactory'
import { accuracyPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

describe('AccuracyPerAgent', () => {
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

    describe('useAccuracyPerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useAccuracyPerAgent(statsFilters, timezone, undefined, agentId),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                accuracyPerAgentQueryFactory(statsFilters, timezone, undefined),
                accuracyPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })

    describe('fetchAccuracyPerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchAccuracyPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId,
            )

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                accuracyPerAgentQueryFactory(statsFilters, timezone, undefined),
                accuracyPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })
})
