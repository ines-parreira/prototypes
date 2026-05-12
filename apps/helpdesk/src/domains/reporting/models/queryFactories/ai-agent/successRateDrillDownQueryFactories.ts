import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { SuccessRateCube } from 'domains/reporting/models/cubes/ai-agent/SuccessRateCube'
import {
    SuccessRateDimension,
    SuccessRateFilterMember,
} from 'domains/reporting/models/cubes/ai-agent/SuccessRateCube'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import type { StatsFiltersMembers } from 'domains/reporting/utils/reporting'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

const successRateFiltersMembers: StatsFiltersMembers = {
    periodStart: SuccessRateFilterMember.PeriodStart,
    periodEnd: SuccessRateFilterMember.PeriodEnd,
    channels: SuccessRateFilterMember.Channel,
    stores: SuccessRateFilterMember.StoreIntegrationId,
}

const isSuccessfulFilter = {
    member: SuccessRateFilterMember.IsSuccessful,
    operator: ReportingFilterOperator.Equals,
    values: ['1'],
}

export const shoppingAssistantSuccessRateDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<SuccessRateCube> => ({
    metricName: METRIC_NAMES.AI_SALES_AGENT_SUCCESS_RATE_DRILL_DOWN,
    measures: [],
    dimensions: [SuccessRateDimension.TicketId],
    filters: [
        {
            member: SuccessRateFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSales],
        },
        isSuccessfulFilter,
        ...statsFiltersToReportingFilters(successRateFiltersMembers, filters),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[SuccessRateDimension.TicketId, sorting]] : [],
})

export const allAgentsSuccessRateDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<SuccessRateCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_SUCCESS_RATE_DRILL_DOWN,
    measures: [],
    dimensions: [SuccessRateDimension.TicketId],
    filters: [
        isSuccessfulFilter,
        ...statsFiltersToReportingFilters(successRateFiltersMembers, filters),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[SuccessRateDimension.TicketId, sorting]] : [],
})

export const supportAgentSuccessRateDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<SuccessRateCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_SUCCESS_RATE_DRILL_DOWN,
    measures: [],
    dimensions: [SuccessRateDimension.TicketId],
    filters: [
        {
            member: SuccessRateFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSupport],
        },
        isSuccessfulFilter,
        ...statsFiltersToReportingFilters(successRateFiltersMembers, filters),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[SuccessRateDimension.TicketId, sorting]] : [],
})
