import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { communicationSkillsPerAgentQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/communicationSkillsQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

export const useCommunicationSkillsPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    useMetricPerDimension(
        communicationSkillsPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        agentAssigneeId,
    )

export const fetchCommunicationSkillsPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
) =>
    fetchMetricPerDimension(
        communicationSkillsPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting,
        ),
        agentAssigneeId,
    )
