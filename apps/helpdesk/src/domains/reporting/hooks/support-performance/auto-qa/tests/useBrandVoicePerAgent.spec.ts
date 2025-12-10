import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchBrandVoicePerAgent,
    useBrandVoicePerAgent,
} from 'domains/reporting/hooks/support-performance/auto-qa/useBrandVoicePerAgent'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { brandVoicePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/brandVoiceQueryFactory'
import { brandVoicePerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

describe('BrandVoicePerAgent', () => {
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
    describe('useBrandVoicePerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useBrandVoicePerAgent(
                    statsFilters,
                    timezone,
                    undefined,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                brandVoicePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                brandVoicePerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })

    describe('fetchBrandVoicePerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchBrandVoicePerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId,
            )

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                brandVoicePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                brandVoicePerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })
})
