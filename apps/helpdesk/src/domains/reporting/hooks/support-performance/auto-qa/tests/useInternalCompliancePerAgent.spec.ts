import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchInternalCompliancePerAgent,
    useInternalCompliancePerAgent,
} from 'domains/reporting/hooks/support-performance/auto-qa/useInternalCompliancePerAgent'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { internalCompliancePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/internalComplianceQueryFactory'
import { internalCompliancePerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

describe('InternalCompliancePerAgent', () => {
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

    describe('useInternalCompliancePerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useInternalCompliancePerAgent(
                    statsFilters,
                    timezone,
                    undefined,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                internalCompliancePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                internalCompliancePerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })

    describe('fetchInternalCompliancePerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchInternalCompliancePerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId,
            )

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                internalCompliancePerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                internalCompliancePerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })
})
