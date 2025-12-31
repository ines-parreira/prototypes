import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { AiSalesAgentConversationsCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsFilterMember,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import type { AiSalesAgentOrdersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { SourceFilter } from 'domains/reporting/models/queryFactories/ai-sales-agent/constants'
import {
    aiSalesAgentConversationsDefaultFiltersMembers,
    aiSalesAgentOrdersDefaultFiltersMembers,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/filters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'

const baseAISalesAgentOrdersFilters = [
    {
        member: AiSalesAgentOrdersDimension.Source,
        operator: ReportingFilterOperator.Equals,
        values: [SourceFilter.ShoppingAssistant],
    },
]

const baseAISalesAgentConversationsFilters = [
    {
        member: AiSalesAgentConversationsDimension.Source,
        operator: ReportingFilterOperator.Equals,
        values: [SourceFilter.ShoppingAssistant],
    },
]

export const handoverInteractionsPerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
) => ({
    measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
    dimensions: [TicketDimension.Channel],
    filters: [
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [String(outcomeCustomFieldId)],
        },
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.StartsWith,
            values: ['Handover::'],
        },
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    timezone,
    metricName: METRIC_NAMES.AI_AGENT_HANDOVER_INTERACTIONS_PER_CHANNEL,
})

export const gmvInfluencedPerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.GmvUsd],
    dimensions: [AiSalesAgentOrdersDimension.Channel],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        ...baseAISalesAgentOrdersFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentOrdersDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
    metricName: METRIC_NAMES.AI_SALES_AGENT_GMV_INFLUENCED_PER_CHANNEL,
})

export const totalSalesConversationsPerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [AiSalesAgentConversationsDimension.Channel],
    filters: [
        {
            member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        ...baseAISalesAgentConversationsFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
    metricName:
        METRIC_NAMES.AI_SALES_AGENT_TOTAL_SALES_CONVERSATIONS_PER_CHANNEL,
})

export const automatedSalesConversationsPerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [AiSalesAgentConversationsDimension.Channel],
    filters: [
        {
            member: AiSalesAgentConversationsDimension.IsSalesOpportunity,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
        {
            member: AiSalesAgentConversationsFilterMember.Outcome,
            operator: ReportingFilterOperator.NotEquals,
            values: ['handover'],
        },
        ...baseAISalesAgentConversationsFilters,
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
    metricName:
        METRIC_NAMES.AI_SALES_AGENT_AUTOMATED_SALES_CONVERSATIONS_PER_CHANNEL,
})

export const snoozedInteractionsPerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
) => ({
    measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
    dimensions: [TicketDimension.Channel],
    filters: [
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [String(outcomeCustomFieldId)],
        },
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.StartsWith,
            values: ['Snooze::'],
        },
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    timezone,
    metricName: METRIC_NAMES.AI_AGENT_SNOOZED_INTERACTIONS_PER_CHANNEL,
})
