import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { HandoverInteractionsCube } from 'domains/reporting/models/cubes/ai-agent/HandoverInteractionsCube'
import {
    HandoverInteractionsDimension,
    HandoverInteractionsFilterMember,
} from 'domains/reporting/models/cubes/ai-agent/HandoverInteractionsCube'
import type { AiSalesAgentActivityCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentActivity'
import {
    AiSalesAgentActivityDimension,
    AiSalesAgentActivityFilterMember,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentActivity'
import type { AIAgentAutomatedInteractionsV2Cube } from 'domains/reporting/models/cubes/automate_v2/AIAgentAutomatedInteractionsV2Cube'
import {
    AIAgentAutomatedInteractionsV2Dimension,
    AIAgentAutomatedInteractionsV2FilterMember,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentAutomatedInteractionsV2Cube'
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
import type { TicketCube } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketDimension,
    TicketMember,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import { mapTicketChannelsToAutomateChannels } from 'domains/reporting/models/queryFactories/automate_v2/filters'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import type { StatsFiltersMembers } from 'domains/reporting/utils/reporting'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

// Channels and stores are conditionally included when the AiAgentAnalyticsFilters feature flag is enabled —
// useDrillDownQuery (domains/reporting/hooks/useDrillDownData.ts) passes them via useAiAgentStatsFilters

// Maps ticket channel values (e.g. 'contact_form') to automate cube channel values ('contact-form')
const withAutomateChannels = (filters: StatsFilters): StatsFilters => {
    if (!filters.channels) return filters
    return {
        ...filters,
        channels: {
            ...filters.channels,
            values: mapTicketChannelsToAutomateChannels(
                filters.channels.values,
            ),
        },
    }
}

const automatedInteractionsFiltersMembers: StatsFiltersMembers = {
    periodStart: AIAgentAutomatedInteractionsV2FilterMember.PeriodStart,
    periodEnd: AIAgentAutomatedInteractionsV2FilterMember.PeriodEnd,
    channels: AIAgentAutomatedInteractionsV2FilterMember.Channel,
    stores: AIAgentAutomatedInteractionsV2FilterMember.StoreIntegrationId,
}

const aiSalesAgentActivityDrillDownFiltersMembers: StatsFiltersMembers = {
    periodStart: AiSalesAgentActivityFilterMember.PeriodStart,
    periodEnd: AiSalesAgentActivityFilterMember.PeriodEnd,
    channels: AiSalesAgentActivityFilterMember.Channel,
    stores: AiSalesAgentActivityFilterMember.StoreIntegrationId,
}

const handoverInteractionsFiltersMembers: StatsFiltersMembers = {
    periodStart: HandoverInteractionsFilterMember.PeriodStart,
    periodEnd: HandoverInteractionsFilterMember.PeriodEnd,
    channels: HandoverInteractionsFilterMember.Channel,
    stores: HandoverInteractionsFilterMember.StoreIntegrationId,
}

const ticketClosedDrillDownFiltersMembers: StatsFiltersMembers = {
    periodStart: TicketMember.PeriodStart,
    periodEnd: TicketMember.PeriodEnd,
    channels: TicketMember.Channel,
}

const csatFiltersMembers: StatsFiltersMembers = {
    periodStart: AIAgentCSATFilterMember.PeriodStart,
    periodEnd: AIAgentCSATFilterMember.PeriodEnd,
    channels: AIAgentCSATFilterMember.Channel,
    stores: AIAgentCSATFilterMember.StoreIntegrationId,
}

const frtFiltersMembers: StatsFiltersMembers = {
    periodStart: AIAgentDecreaseInFRTFilterMember.PeriodStart,
    periodEnd: AIAgentDecreaseInFRTFilterMember.PeriodEnd,
    channels: AIAgentDecreaseInFRTFilterMember.Channel,
    stores: AIAgentDecreaseInFRTFilterMember.StoreIntegrationId,
}

const resolutionTimeFiltersMembers: StatsFiltersMembers = {
    periodStart: AIAgentDecreaseInResolutionTimeFilterMember.PeriodStart,
    periodEnd: AIAgentDecreaseInResolutionTimeFilterMember.PeriodEnd,
    channels: AIAgentDecreaseInResolutionTimeFilterMember.Channel,
    stores: AIAgentDecreaseInResolutionTimeFilterMember.StoreIntegrationId,
}

export const allAgentsAutomatedInteractionsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentAutomatedInteractionsV2Cube> => ({
    metricName:
        METRIC_NAMES.AI_AGENT_ALL_AGENTS_AUTOMATED_INTERACTIONS_DRILL_DOWN,
    measures: [],
    dimensions: [AIAgentAutomatedInteractionsV2Dimension.TicketId],
    filters: statsFiltersToReportingFilters(
        automatedInteractionsFiltersMembers,
        withAutomateChannels(filters),
    ),
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
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_DRILL_DOWN,
    measures: [],
    dimensions: [AIAgentAutomatedInteractionsV2Dimension.TicketId],
    filters: [
        {
            member: AIAgentAutomatedInteractionsV2FilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSales],
        },
        ...statsFiltersToReportingFilters(
            automatedInteractionsFiltersMembers,
            withAutomateChannels(filters),
        ),
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
        METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_DRILL_DOWN,
    measures: [],
    dimensions: [AIAgentAutomatedInteractionsV2Dimension.TicketId],
    filters: [
        {
            member: AIAgentAutomatedInteractionsV2FilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSupport],
        },
        ...statsFiltersToReportingFilters(
            automatedInteractionsFiltersMembers,
            withAutomateChannels(filters),
        ),
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
        METRIC_NAMES.AI_AGENT_ALL_AGENTS_HANDOVER_INTERACTIONS_DRILL_DOWN,
    measures: [],
    dimensions: [HandoverInteractionsDimension.TicketId],
    filters: [
        {
            member: HandoverInteractionsFilterMember.FeatureType,
            operator: ReportingFilterOperator.Equals,
            values: [AutomationFeatureType.AiAgent],
        },
        ...statsFiltersToReportingFilters(
            handoverInteractionsFiltersMembers,
            withAutomateChannels(filters),
        ),
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
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_HANDOVER_INTERACTIONS_DRILL_DOWN,
    measures: [],
    dimensions: [HandoverInteractionsDimension.TicketId],
    filters: [
        {
            member: HandoverInteractionsFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSales],
        },
        ...statsFiltersToReportingFilters(
            handoverInteractionsFiltersMembers,
            withAutomateChannels(filters),
        ),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[HandoverInteractionsDimension.TicketId, sorting]] : [],
})

export const shoppingAssistantProductRecommendationsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AiSalesAgentActivityCube> => ({
    metricName:
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_PRODUCT_RECOMMENDATIONS_DRILL_DOWN,
    measures: [],
    dimensions: [
        AiSalesAgentActivityDimension.TicketId,
        AiSalesAgentActivityDimension.ProductRecommended,
        AiSalesAgentActivityDimension.StoreIntegrationId,
        AiSalesAgentActivityDimension.ProductVariantIds,
    ],
    filters: [
        {
            member: AiSalesAgentActivityFilterMember.ProductRecommended,
            operator: ReportingFilterOperator.Set,
            values: [],
        },
        ...statsFiltersToReportingFilters(
            aiSalesAgentActivityDrillDownFiltersMembers,
            withAutomateChannels(filters),
        ),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[AiSalesAgentActivityDimension.TicketId, sorting]] : [],
})

export const supportAgentHandoverInteractionsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HandoverInteractionsCube> => ({
    metricName:
        METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_HANDOVER_INTERACTIONS_DRILL_DOWN,
    measures: [],
    dimensions: [HandoverInteractionsDimension.TicketId],
    filters: [
        {
            member: HandoverInteractionsFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSupport],
        },
        ...statsFiltersToReportingFilters(
            handoverInteractionsFiltersMembers,
            withAutomateChannels(filters),
        ),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[HandoverInteractionsDimension.TicketId, sorting]] : [],
})

export const allAgentsClosedTicketsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    assigneeUserId?: number,
): ReportingQuery<TicketCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_CLOSED_TICKETS_DRILL_DOWN,
    measures: [],
    dimensions: [
        TicketDimension.TicketId,
        TicketDimension.CreatedDatetime,
        TicketDimension.AssigneeUserId,
    ],
    segments: [TicketSegment.ClosedTickets],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            ticketClosedDrillDownFiltersMembers,
            filters,
        ),
        ...(assigneeUserId !== undefined
            ? [
                  {
                      member: TicketMember.AssigneeUserId,
                      operator: ReportingFilterOperator.Equals,
                      values: [String(assigneeUserId)],
                  },
              ]
            : []),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: [[TicketDimension.CreatedDatetime, sorting ?? OrderDirection.Desc]],
})

export const allAgentsCsatDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    outcomeCustomFieldId?: number,
): ReportingQuery<AIAgentCSATCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CSAT_DRILL_DOWN,
    measures: [],
    dimensions: [
        AIAgentCSATDimension.TicketId,
        AIAgentCSATDimension.SurveyScore,
    ],
    filters: [
        ...statsFiltersToReportingFilters(csatFiltersMembers, filters),
        {
            member: AIAgentCSATFilterMember.SurveyScore,
            operator: ReportingFilterOperator.Gte,
            values: ['1'],
        },
        ...(outcomeCustomFieldId !== undefined
            ? [
                  {
                      member: AIAgentCSATFilterMember.AiAgentOutcomeCustomFieldId,
                      operator: ReportingFilterOperator.Equals,
                      values: [String(outcomeCustomFieldId)],
                  },
              ]
            : []),
    ],
    timezone,
    limit: DRILLDOWN_QUERY_LIMIT,
    order: sorting ? [[AIAgentCSATDimension.SurveyScore, sorting]] : [],
})

export const supportAgentCsatDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    outcomeCustomFieldId?: number,
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
        ...statsFiltersToReportingFilters(csatFiltersMembers, filters),
        {
            member: AIAgentCSATFilterMember.SurveyScore,
            operator: ReportingFilterOperator.Gte,
            values: ['1'],
        },
        ...(outcomeCustomFieldId !== undefined
            ? [
                  {
                      member: AIAgentCSATFilterMember.AiAgentOutcomeCustomFieldId,
                      operator: ReportingFilterOperator.Equals,
                      values: [String(outcomeCustomFieldId)],
                  },
              ]
            : []),
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
    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_FRT_DRILL_DOWN,
    measures: [],
    dimensions: [
        AIAgentDecreaseInFRTDimension.TicketId,
        AIAgentDecreaseInFRTDimension.FirstResponseTime,
    ],
    filters: statsFiltersToReportingFilters(frtFiltersMembers, filters),
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
    metricName: METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_FRT_DRILL_DOWN,
    filters: [
        {
            member: AIAgentDecreaseInFRTFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSupport],
        },
        ...statsFiltersToReportingFilters(frtFiltersMembers, filters),
    ],
})

export const allAgentsResolutionTimeDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<AIAgentDecreaseInResolutionTimeCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_RESOLUTION_TIME_DRILL_DOWN,
    measures: [],
    dimensions: [
        AIAgentDecreaseInResolutionTimeDimension.TicketId,
        AIAgentDecreaseInResolutionTimeDimension.ResolutionTime,
    ],
    filters: statsFiltersToReportingFilters(
        resolutionTimeFiltersMembers,
        filters,
    ),
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
    metricName: METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_RESOLUTION_TIME_DRILL_DOWN,
    filters: [
        {
            member: AIAgentDecreaseInResolutionTimeFilterMember.AiAgentRole,
            operator: ReportingFilterOperator.Equals,
            values: [AIAgentSkills.AIAgentSupport],
        },
        ...statsFiltersToReportingFilters(
            resolutionTimeFiltersMembers,
            filters,
        ),
    ],
})
