import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { internalCompliancePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/internalComplianceQueryFactory'
import { internalCompliancePerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OrderDirection } from 'models/api/types'

export const useInternalCompliancePerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimensionV2(
        internalCompliancePerAgentQueryFactory(statsFilters, timezone, sorting),
        internalCompliancePerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )

export const fetchInternalCompliancePerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    fetchMetricPerDimensionV2(
        internalCompliancePerAgentQueryFactory(statsFilters, timezone, sorting),
        internalCompliancePerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )
