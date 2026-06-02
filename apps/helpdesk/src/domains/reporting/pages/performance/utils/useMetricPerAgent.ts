import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

const AGENT_DIMENSION = 'agentId'

export type AgentBreakdownFactory = (ctx: {
    filters: StatsFilters
    timezone: string
    dimensions: [typeof AGENT_DIMENSION]
}) => BuiltQuery<ScopeMeta>

export const useMetricPerAgent = (
    query: AgentBreakdownFactory,
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricPerDimension(
        query({ filters, timezone, dimensions: [AGENT_DIMENSION] }),
        AGENT_DIMENSION,
    )

export const fetchMetricPerAgent = async (
    query: AgentBreakdownFactory,
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricPerDimension(
        query({ filters, timezone, dimensions: [AGENT_DIMENSION] }),
        AGENT_DIMENSION,
    )
