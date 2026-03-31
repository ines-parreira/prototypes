import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { AIAgentAutomatedInteractionsV2Cube } from 'domains/reporting/models/cubes/automate_v2/AIAgentAutomatedInteractionsV2Cube'
import {
    AIAgentAutomatedInteractionsV2Dimension,
    AIAgentAutomatedInteractionsV2FilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentAutomatedInteractionsV2Cube'
import type { AIAgentClosedTicketsCube } from 'domains/reporting/models/cubes/automate_v2/AIAgentClosedTicketsCube'
import {
    AIAgentClosedTicketsDimension,
    AIAgentClosedTicketsFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentClosedTicketsCube'
import type { AIAgentCSATCube } from 'domains/reporting/models/cubes/automate_v2/AIAgentCSATCube'
import {
    AIAgentCSATDimension,
    AIAgentCSATFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentCSATCube'
import type { AIAgentDecreaseInFRTCube } from 'domains/reporting/models/cubes/automate_v2/AIAgentDecreaseInFRTCube'
import {
    AIAgentDecreaseInFRTDimension,
    AIAgentDecreaseInFRTFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentDecreaseInFRTCube'
import type { AIAgentDecreaseInResolutionTimeCube } from 'domains/reporting/models/cubes/automate_v2/AIAgentDecreaseInResolutionTimeCube'
import {
    AIAgentDecreaseInResolutionTimeDimension,
    AIAgentDecreaseInResolutionTimeFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentDecreaseInResolutionTimeCube'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import type { HandoverInteractionsCube } from 'domains/reporting/models/cubes/automate_v2/HandoverInteractionsCube'
import {
    HandoverInteractionsDimension,
    HandoverInteractionsFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/HandoverInteractionsCube'
import type { SuccessRateCube } from 'domains/reporting/models/cubes/automate_v2/SuccessRateCube'
import {
    SuccessRateDimension,
    SuccessRateFilterMember,
} from 'domains/reporting/models/cubes/automate_v2/SuccessRateCube'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
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

const buildHandoverPeriodFilters = (filters: StatsFilters) => [
    {
        member: HandoverInteractionsFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [filters.period.start_datetime],
    },
    {
        member: HandoverInteractionsFilterMember.PeriodEnd,
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
            member: AIAgentAutomatedInteractionsV2FilterMember.AiAgentRole,
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
            member: AIAgentAutomatedInteractionsV2FilterMember.AiAgentRole,
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

export const allAgentsHandoverInteractionsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HandoverInteractionsCube> => ({
    metricName:
        METRIC_NAMES.AI_AGENT_ALL_AGENTS_HANDOVER_INTERACTIONS_DRILLDOWN,
    measures: [],
    dimensions: [HandoverInteractionsDimension.TicketId],
    filters: [
        {
            member: HandoverInteractionsFilterMember.FeatureType,
            operator: ReportingFilterOperator.Equals,
            values: [AutomationFeatureType.AiAgent],
        },
        ...buildHandoverPeriodFilters(filters),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[HandoverInteractionsDimension.TicketId, sorting]] : [],
})

export const shoppingAssistantHandoverInteractionsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HandoverInteractionsCube> => ({
    metricName:
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_HANDOVER_INTERACTIONS_DRILLDOWN,
    measures: [],
    dimensions: [HandoverInteractionsDimension.TicketId],
    filters: [
        {
            member: HandoverInteractionsFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSales],
        },
        ...buildHandoverPeriodFilters(filters),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[HandoverInteractionsDimension.TicketId, sorting]] : [],
})

export const supportAgentHandoverInteractionsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HandoverInteractionsCube> => ({
    metricName:
        METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_HANDOVER_INTERACTIONS_DRILLDOWN,
    measures: [],
    dimensions: [HandoverInteractionsDimension.TicketId],
    filters: [
        {
            member: HandoverInteractionsFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSupport],
        },
        ...buildHandoverPeriodFilters(filters),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[HandoverInteractionsDimension.TicketId, sorting]] : [],
})

const buildClosedTicketsPeriodFilters = (filters: StatsFilters) => [
    {
        member: AIAgentClosedTicketsFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [filters.period.start_datetime],
    },
    {
        member: AIAgentClosedTicketsFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [filters.period.end_datetime],
    },
]

const buildFRTPeriodFilters = (filters: StatsFilters) => [
    {
        member: AIAgentDecreaseInFRTFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [filters.period.start_datetime],
    },
    {
        member: AIAgentDecreaseInFRTFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [filters.period.end_datetime],
    },
]

export const allAgentsClosedTicketsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentClosedTicketsCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_CLOSED_TICKETS_DRILLDOWN,
    measures: [],
    dimensions: [AIAgentClosedTicketsDimension.TicketId],
    filters: buildClosedTicketsPeriodFilters(filters),
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[AIAgentClosedTicketsDimension.TicketId, sorting]] : [],
})

const buildCsatPeriodFilters = (filters: StatsFilters) => [
    {
        member: AIAgentCSATFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [filters.period.start_datetime],
    },
    {
        member: AIAgentCSATFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [filters.period.end_datetime],
    },
    {
        member: AIAgentCSATFilterMember.SurveyScore,
        operator: ReportingFilterOperator.Gte,
        values: ['1'],
    },
]

export const allAgentsCsatDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentCSATCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CSAT_DRILL_DOWN,
    measures: [],
    dimensions: [
        AIAgentCSATDimension.TicketId,
        AIAgentCSATDimension.SurveyScore,
    ],
    filters: buildCsatPeriodFilters(filters),
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[AIAgentCSATDimension.SurveyScore, sorting]] : [],
})

export const supportAgentCsatDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentCSATCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_CSAT_DRILL_DOWN,
    measures: [],
    dimensions: [
        AIAgentCSATDimension.TicketId,
        AIAgentCSATDimension.SurveyScore,
    ],
    filters: [
        {
            member: AIAgentCSATFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSupport],
        },
        ...buildCsatPeriodFilters(filters),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[AIAgentCSATDimension.SurveyScore, sorting]] : [],
})

export const allAgentsFRTDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentDecreaseInFRTCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_FRT_DRILLDOWN,
    measures: [],
    dimensions: [
        AIAgentDecreaseInFRTDimension.TicketId,
        AIAgentDecreaseInFRTDimension.FirstResponseTime,
    ],
    filters: buildFRTPeriodFilters(filters),
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting
        ? [[AIAgentDecreaseInFRTDimension.FirstResponseTime, sorting]]
        : [],
})

export const supportAgentFRTDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentDecreaseInFRTCube> => ({
    ...allAgentsFRTDrillDownQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_FRT_DRILLDOWN,
    filters: [
        {
            member: AIAgentDecreaseInFRTFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSupport],
        },
        ...buildFRTPeriodFilters(filters),
    ],
})

const buildResolutionTimePeriodFilters = (filters: StatsFilters) => [
    {
        member: AIAgentDecreaseInResolutionTimeFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [filters.period.start_datetime],
    },
    {
        member: AIAgentDecreaseInResolutionTimeFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [filters.period.end_datetime],
    },
]

export const allAgentsResolutionTimeDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentDecreaseInResolutionTimeCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_RESOLUTION_TIME_DRILLDOWN,
    measures: [],
    dimensions: [
        AIAgentDecreaseInResolutionTimeDimension.TicketId,
        AIAgentDecreaseInResolutionTimeDimension.ResolutionTime,
    ],
    filters: buildResolutionTimePeriodFilters(filters),
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting
        ? [[AIAgentDecreaseInResolutionTimeDimension.TicketId, sorting]]
        : [],
})

export const supportAgentResolutionTimeDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentDecreaseInResolutionTimeCube> => ({
    ...allAgentsResolutionTimeDrillDownQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_RESOLUTION_TIME_DRILLDOWN,
    filters: [
        {
            member: AIAgentDecreaseInResolutionTimeFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSupport],
        },
        ...buildResolutionTimePeriodFilters(filters),
    ],
})

const buildSuccessRatePeriodFilters = (filters: StatsFilters) => [
    {
        member: SuccessRateFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [filters.period.start_datetime],
    },
    {
        member: SuccessRateFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [filters.period.end_datetime],
    },
]

export const allAgentsSuccessRateDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<SuccessRateCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_SUCCESS_RATE_DRILL_DOWN,
    measures: [],
    dimensions: [SuccessRateDimension.TicketId],
    filters: buildSuccessRatePeriodFilters(filters),
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
        ...buildSuccessRatePeriodFilters(filters),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[SuccessRateDimension.TicketId, sorting]] : [],
})
