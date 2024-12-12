import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {brandVoicePerAgentQueryFactory} from 'models/reporting/queryFactories/auto-qa/brandVoiceQueryFactory'
import {StatsFilters} from 'models/stat/types'

export const useBrandVoicePerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        brandVoicePerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )
