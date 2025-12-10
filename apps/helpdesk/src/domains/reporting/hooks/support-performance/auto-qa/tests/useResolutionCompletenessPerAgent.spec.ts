import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchResolutionCompletenessPerAgent,
    useResolutionCompletenessPerAgent,
} from 'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessPerAgent'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { resolutionCompletenessPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import { resolutionCompletenessPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

describe('ResolutionCompletenessPerAgent', () => {
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

    describe('useResolutionCompletenessPerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useResolutionCompletenessPerAgent(
                    statsFilters,
                    timezone,
                    undefined,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                resolutionCompletenessPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                resolutionCompletenessPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })

    describe('fetchResolutionCompletenessPerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchResolutionCompletenessPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId,
            )

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                resolutionCompletenessPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                resolutionCompletenessPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })
})
