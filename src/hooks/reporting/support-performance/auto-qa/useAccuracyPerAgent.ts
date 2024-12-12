import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {accuracyPerAgentQueryFactory} from 'models/reporting/queryFactories/auto-qa/accuracyQueryFactory'
import {StatsFilters} from 'models/stat/types'

export const useAccuracyPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        accuracyPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )
