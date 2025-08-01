import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchAccuracyPerAgent,
    useAccuracyPerAgent,
} from 'domains/reporting/hooks/support-performance/auto-qa/useAccuracyPerAgent'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { accuracyPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/accuracyQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

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

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                accuracyPerAgentQueryFactory(statsFilters, timezone, undefined),
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

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                accuracyPerAgentQueryFactory(statsFilters, timezone, undefined),
                agentId,
            )
        })
    })
})
