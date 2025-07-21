import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { brandVoicePerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/brandVoiceQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

export const useBrandVoicePerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimension(
        brandVoicePerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId,
    )

export const fetchBrandVoicePerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    fetchMetricPerDimension(
        brandVoicePerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId,
    )
