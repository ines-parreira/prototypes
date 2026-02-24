import type {
    MetricWithDecile,
    ReportingMetricItemValue,
} from 'domains/reporting/hooks/types'
import { useStatsMetricPerDimension } from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type { Cubes } from 'domains/reporting/models/cubes'
import {
    availabilityTrackingPerAgentPerStatusQueryV2Factory,
    availabilityTrackingPerAgentQueryV2Factory,
} from 'domains/reporting/models/scopes/userAvailabilityTracking'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OrderDirection } from 'models/api/types'

export const useOnlineTimePerAgentAvailability = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentId?: string,
    limit?: number,
    offset?: number,
): MetricWithDecile<ReportingMetricItemValue, Cubes> => {
    const newQuery = availabilityTrackingPerAgentQueryV2Factory({
        filters,
        timezone,
        sortDirection: sorting,
        limit,
        offset,
    })

    return useStatsMetricPerDimension(newQuery, agentId)
}

export const useAvailabilityPerAgentPerStatus = (
    filters: StatsFilters,
    timezone: string,
    sortDirection?: OrderDirection,
    agentId?: string,
    limit?: number,
    offset?: number,
): MetricWithDecile<ReportingMetricItemValue, Cubes> => {
    const newQuery = availabilityTrackingPerAgentPerStatusQueryV2Factory({
        filters,
        timezone,
        sortDirection,
        limit,
        offset,
    })

    return useStatsMetricPerDimension(newQuery, agentId)
}
