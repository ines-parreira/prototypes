import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {internalCompliancePerAgentQueryFactory} from 'models/reporting/queryFactories/auto-qa/internalComplianceQueryFactory'
import {StatsFilters} from 'models/stat/types'

export const useInternalCompliancePerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        internalCompliancePerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )

export const fetchInternalCompliancePerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    fetchMetricPerDimension(
        internalCompliancePerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )
