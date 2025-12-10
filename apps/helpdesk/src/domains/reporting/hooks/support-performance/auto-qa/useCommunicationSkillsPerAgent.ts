import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { communicationSkillsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/communicationSkillsQueryFactory'
import { communicationSkillsPerAgentQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OrderDirection } from 'models/api/types'

export const useCommunicationSkillsPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimensionV2(
        communicationSkillsPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        communicationSkillsPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )

export const fetchCommunicationSkillsPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    fetchMetricPerDimensionV2(
        communicationSkillsPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        communicationSkillsPerAgentQueryV2Factory({
            filters: statsFilters,
            timezone,
            sortDirection: sorting,
        }),
        agentAssigneeId,
    )
