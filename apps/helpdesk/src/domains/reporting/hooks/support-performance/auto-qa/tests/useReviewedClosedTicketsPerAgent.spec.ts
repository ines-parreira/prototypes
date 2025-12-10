import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchReviewedClosedTicketsPerAgent,
    useReviewedClosedTicketsPerAgent,
} from 'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { reviewedClosedTicketsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import { reviewedClosedTicketsPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)
const fetchMetricPerDimensionV2Mock = assumeMock(fetchMetricPerDimensionV2)

describe('ReviewedClosedTicketsPerAgent', () => {
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

    describe('useReviewedClosedTicketsPerAgent', () => {
        it('should call perDimension hook with agent id', () => {
            renderHook(() =>
                useReviewedClosedTicketsPerAgent(
                    statsFilters,
                    timezone,
                    undefined,
                    agentId,
                ),
            )

            expect(useMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                reviewedClosedTicketsPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                reviewedClosedTicketsPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })

    describe('fetchReviewedClosedTicketsPerAgent', () => {
        it('should call perDimension hook with agent id', async () => {
            await fetchReviewedClosedTicketsPerAgent(
                statsFilters,
                timezone,
                undefined,
                agentId,
            )

            expect(fetchMetricPerDimensionV2Mock).toHaveBeenCalledWith(
                reviewedClosedTicketsPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                reviewedClosedTicketsPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                }),
                agentId,
            )
        })
    })
})
