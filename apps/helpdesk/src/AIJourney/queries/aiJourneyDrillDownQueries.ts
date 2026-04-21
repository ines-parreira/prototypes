import {
    AIJourneyDiscountCodesOfferedQueryFactory,
    AIJourneyDiscountCodesUsedQueryFactory,
    aiJourneyOptedOutAfterReplyQueryFactory,
    aiJourneyOptedOutQueryFactory,
    aiJourneyProviderTotalNumberOfOrderQueryFactory,
    aiJourneyRepliedMessagesQueryFactory,
    aiJourneySankeyOrdersQueryFactory,
    aiJourneyTotalConversationsQueryFactory,
    aiJourneyTotalNumberOfOrderQueryFactory,
    aiJourneyUniqClicksQueryFactory,
} from 'AIJourney/utils/analytics-factories/factories'
import type { AttributionModelComparison } from 'AIJourney/utils/attributionModelComparison'
import type { AIJourneyOrdersAsProviderCube } from 'domains/reporting/models/cubes/ai-sales-agent/AIJourneyOrdersAsProvider'
import {
    AIJourneyOrdersAsProviderDimension,
    AIJourneyOrdersAsProviderMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AIJourneyOrdersAsProvider'
import type { AiSalesAgentConversationsCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentConversationsDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import type { AiSalesAgentOrdersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
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

export const aiJourneyProviderOrdersDrillDownQueryFactory =
    (provider: AttributionModelComparison | null) =>
    (
        filters: StatsFilters,
        timezone: string,
        integrationId: string,
        sorting?: OrderDirection,
        journeyIds?: string[],
    ): ReportingQuery<AIJourneyOrdersAsProviderCube> => ({
        ...aiJourneyProviderTotalNumberOfOrderQueryFactory(provider)(
            integrationId,
            filters,
            timezone,
            journeyIds,
        ),
        measures: [AIJourneyOrdersAsProviderMeasure.GmvUsd],
        dimensions: [
            AIJourneyOrdersAsProviderDimension.TicketId,
            AIJourneyOrdersAsProviderDimension.OrderId,
            AIJourneyOrdersAsProviderDimension.TotalAmount,
            AIJourneyOrdersAsProviderDimension.CustomerId,
        ],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [
                      [AIJourneyOrdersAsProviderDimension.TicketId, sorting],
                  ],
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

export const aiJourneySankeyConversionsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    integrationId: string,
    sorting?: OrderDirection,
    journeyIds?: string[],
    engagementCategory?: string,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    const baseQuery = aiJourneySankeyOrdersQueryFactory(
        integrationId,
        filters,
        timezone,
        journeyIds,
    )
    return {
        ...baseQuery,
        measures: [AiSalesAgentOrdersMeasure.GmvUsd],
        dimensions: [
            AiSalesAgentOrdersDimension.TicketId,
            AiSalesAgentOrdersDimension.OrderId,
            AiSalesAgentOrdersDimension.TotalAmount,
            AiSalesAgentOrdersDimension.CustomerId,
        ],
        filters: [
            ...baseQuery.filters,
            {
                member: AiSalesAgentOrdersDimension.TicketId,
                operator: ReportingFilterOperator.Set,
                values: [],
            },
            ...(engagementCategory
                ? [
                      {
                          member: AiSalesAgentOrdersDimension.EngagementCategory,
                          operator: ReportingFilterOperator.Equals,
                          values: [engagementCategory],
                      },
                  ]
                : []),
        ],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [[AiSalesAgentOrdersDimension.TicketId, sorting]],
              }
            : {
                  order: [],
              }),
    }
}
