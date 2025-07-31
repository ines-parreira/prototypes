import { renderHook } from '@repo/testing'
import moment from 'moment'

import {
    fetchResolutionCompletenessPerAgent,
    useResolutionCompletenessPerAgent,
} from 'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessPerAgent'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { resolutionCompletenessPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)
const fetchMetricPerDimensionMock = assumeMock(fetchMetricPerDimension)

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

            expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
                resolutionCompletenessPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
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

            expect(fetchMetricPerDimensionMock).toHaveBeenCalledWith(
                resolutionCompletenessPerAgentQueryFactory(
                    statsFilters,
                    timezone,
                    undefined,
                ),
                agentId,
            )
        })
    })
})
