import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { AIAgentAutomatedInteractionsV2Cube } from 'domains/reporting/models/cubes/automate_v2/AIAgentAutomatedInteractionsV2Cube'
import {
    AIAgentAutomatedInteractionsV2Dimension,
    AIAgentAutomatedInteractionsV2FilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentAutomatedInteractionsV2Cube'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

const buildPeriodFilters = (filters: StatsFilters) => [
    {
        member: AIAgentAutomatedInteractionsV2FilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [filters.period.start_datetime],
    },
    {
        member: AIAgentAutomatedInteractionsV2FilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [filters.period.end_datetime],
    },
]

export const allAgentsAutomatedInteractionsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentAutomatedInteractionsV2Cube> => ({
    metricName:
        METRIC_NAMES.AI_AGENT_ALL_AGENTS_AUTOMATED_INTERACTIONS_DRILLDOWN,
    measures: [],
    dimensions: [AIAgentAutomatedInteractionsV2Dimension.TicketId],
    filters: buildPeriodFilters(filters),
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting
        ? [[AIAgentAutomatedInteractionsV2Dimension.TicketId, sorting]]
        : [],
})

export const shoppingAssistantAutomatedInteractionsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentAutomatedInteractionsV2Cube> => ({
    metricName:
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_DRILLDOWN,
    measures: [],
    dimensions: [AIAgentAutomatedInteractionsV2Dimension.TicketId],
    filters: [
        {
            member: AIAgentAutomatedInteractionsV2FilterMember.AiAgentSkill,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSales],
        },
        ...buildPeriodFilters(filters),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting
        ? [[AIAgentAutomatedInteractionsV2Dimension.TicketId, sorting]]
        : [],
})

export const supportAgentAutomatedInteractionsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentAutomatedInteractionsV2Cube> => ({
    metricName:
        METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_DRILLDOWN,
    measures: [],
    dimensions: [AIAgentAutomatedInteractionsV2Dimension.TicketId],
    filters: [
        {
            member: AIAgentAutomatedInteractionsV2FilterMember.AiAgentSkill,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSupport],
        },
        ...buildPeriodFilters(filters),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting
        ? [[AIAgentAutomatedInteractionsV2Dimension.TicketId, sorting]]
        : [],
})
