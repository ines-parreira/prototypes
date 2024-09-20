import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {communicationSkillsPerAgentQueryFactory} from 'models/reporting/queryFactories/auto-qa/communicationSkillsQueryFactory'
import {StatsFilters} from 'models/stat/types'

export const useCommunicationSkillsPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        communicationSkillsPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )
