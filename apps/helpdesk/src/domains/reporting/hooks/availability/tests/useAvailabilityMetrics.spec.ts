import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'

import {
    useAvailabilityPerAgentPerStatus,
    useOnlineTimePerAgentAvailability,
} from 'domains/reporting/hooks/availability/useAvailabilityMetrics'
import { useStatsMetricPerDimension } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import {
    availabilityTrackingPerAgentPerStatusQueryV2Factory,
    availabilityTrackingPerAgentQueryV2Factory,
} from 'domains/reporting/models/scopes/userAvailabilityTracking'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension')
const useStatsMetricPerDimensionMock = assumeMock(useStatsMetricPerDimension)

describe('useAvailabilityMetrics', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const agentId = '123'
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'UTC'
    const sorting = OrderDirection.Asc
    const limit = 10
    const offset = 0

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('useOnlineTimePerAgentAvailability', () => {
        it('should call useStatsMetricPerDimension with factory result and agentId', () => {
            renderHook(() =>
                useOnlineTimePerAgentAvailability(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId,
                    limit,
                    offset,
                ),
            )

            expect(useStatsMetricPerDimensionMock).toHaveBeenCalledWith(
                availabilityTrackingPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: sorting,
                    limit,
                    offset,
                }),
                agentId,
            )
        })

        it('should handle optional parameters correctly when omitted', () => {
            renderHook(() =>
                useOnlineTimePerAgentAvailability(statsFilters, timezone),
            )

            expect(useStatsMetricPerDimensionMock).toHaveBeenCalledWith(
                availabilityTrackingPerAgentQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                    limit: undefined,
                    offset: undefined,
                }),
                undefined,
            )
        })
    })

    describe('useAvailabilityPerAgentPerStatus', () => {
        it('should call useStatsMetricPerDimension with factory result and agentId', () => {
            renderHook(() =>
                useAvailabilityPerAgentPerStatus(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId,
                    limit,
                    offset,
                ),
            )

            expect(useStatsMetricPerDimensionMock).toHaveBeenCalledWith(
                availabilityTrackingPerAgentPerStatusQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: sorting,
                    limit,
                    offset,
                }),
                agentId,
            )
        })

        it('should handle optional parameters correctly when omitted', () => {
            renderHook(() =>
                useAvailabilityPerAgentPerStatus(statsFilters, timezone),
            )

            expect(useStatsMetricPerDimensionMock).toHaveBeenCalledWith(
                availabilityTrackingPerAgentPerStatusQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                    sortDirection: undefined,
                    limit: undefined,
                    offset: undefined,
                }),
                undefined,
            )
        })
    })
})
