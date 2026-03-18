import {
    AIJourneyDiscountCodesOfferedQueryFactory,
    AIJourneyDiscountCodesUsedQueryFactory,
    aiJourneyOptedOutAfterReplyQueryFactory,
    aiJourneyOptedOutQueryFactory,
    aiJourneyRepliedMessagesQueryFactory,
    aiJourneyTotalConversationsQueryFactory,
    aiJourneyTotalNumberOfOrderQueryFactory,
    aiJourneyUniqClicksQueryFactory,
} from 'AIJourney/utils/analytics-factories/factories'
import type { AiSalesAgentConversationsCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentConversationsDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import type { AiSalesAgentOrdersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const aiJourneyOrdersDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    ...aiJourneyTotalNumberOfOrderQueryFactory(
        integrationId,
        filters,
        timezone,
        journeyIds,
    ),
    measures: [AiSalesAgentOrdersMeasure.GmvUsd],
    dimensions: [
        AiSalesAgentOrdersDimension.TicketId,
        AiSalesAgentOrdersDimension.OrderId,
        AiSalesAgentOrdersDimension.TotalAmount,
        AiSalesAgentOrdersDimension.CustomerId,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentOrdersDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const aiJourneyResponseRateDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...aiJourneyRepliedMessagesQueryFactory(
        integrationId,
        filters,
        timezone,
        journeyIds,
    ),
    measures: [],
    dimensions: [AiSalesAgentConversationsDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentConversationsDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const aiJourneyOptOutRateDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...aiJourneyOptedOutQueryFactory(
        integrationId,
        filters,
        timezone,
        journeyIds,
    ),
    measures: [],
    dimensions: [AiSalesAgentConversationsDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentConversationsDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const aiJourneyClickThroughRateDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...aiJourneyUniqClicksQueryFactory(
        filters,
        timezone,
        integrationId,
        journeyIds,
    ),
    measures: [],
    dimensions: [AiSalesAgentConversationsDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentConversationsDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const aiJourneyDiscountCodesGeneratedDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...AIJourneyDiscountCodesOfferedQueryFactory(
        integrationId,
        filters,
        timezone,
        journeyIds,
    ),
    measures: [],
    dimensions: [AiSalesAgentConversationsDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentConversationsDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const aiJourneyDiscountCodesUsedDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    ...AIJourneyDiscountCodesUsedQueryFactory(
        integrationId,
        filters,
        timezone,
        journeyIds,
    ),
    measures: [AiSalesAgentOrdersMeasure.GmvUsd],
    dimensions: [
        AiSalesAgentOrdersDimension.TicketId,
        AiSalesAgentOrdersDimension.OrderId,
        AiSalesAgentOrdersDimension.TotalAmount,
        AiSalesAgentOrdersDimension.CustomerId,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentOrdersDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const aiJourneyTotalConversationsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...aiJourneyTotalConversationsQueryFactory(
        integrationId,
        filters,
        timezone,
        journeyIds,
    ),
    measures: [],
    dimensions: [AiSalesAgentConversationsDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentConversationsDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const aiJourneyTotalOptOutsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...aiJourneyOptedOutQueryFactory(
        integrationId,
        filters,
        timezone,
        journeyIds,
    ),
    measures: [],
    dimensions: [AiSalesAgentConversationsDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentConversationsDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const aiJourneyTotalRepliesDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...aiJourneyRepliedMessagesQueryFactory(
        integrationId,
        filters,
        timezone,
        journeyIds,
    ),
    measures: [],
    dimensions: [AiSalesAgentConversationsDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentConversationsDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})

export const aiJourneyOptOutAfterReplyDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyIds?: string[],
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    ...aiJourneyOptedOutAfterReplyQueryFactory(
        integrationId,
        filters,
        timezone,
        journeyIds,
    ),
    measures: [],
    dimensions: [AiSalesAgentConversationsDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[AiSalesAgentConversationsDimension.TicketId, sorting]],
          }
        : {
              order: [],
          }),
})
