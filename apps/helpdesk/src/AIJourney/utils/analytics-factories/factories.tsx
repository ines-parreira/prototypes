import {
    AiSalesAgentConversationsCube,
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersCube,
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    ConvertTrackingEventsCube,
    ConvertTrackingEventsDimension,
    ConvertTrackingEventsMeasure,
} from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import {
    aiSalesAgentConversationsDefaultFiltersMembers,
    aiSalesAgentOrdersDefaultFiltersMembers,
    clicksDefaultFilters,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/filters'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import { statsFiltersToReportingFilters } from 'domains/reporting/utils/reporting'

export const aiJourneyGmvInfluencedQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyId?: string,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    const journeyFilter = journeyId
        ? [
              {
                  member: AiSalesAgentOrdersDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
              },
          ]
        : []

    return {
        measures: [AiSalesAgentOrdersMeasure.Gmv],
        dimensions: [AiSalesAgentOrdersDimension.Currency],
        filters: [
            {
                member: AiSalesAgentOrdersDimension.IsInfluenced,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
            {
                member: AiSalesAgentOrdersDimension.IntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            {
                member: AiSalesAgentOrdersDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentOrdersDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyTotalNumberOfOrderQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyId?: string,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    const baseFilters = statsFiltersToReportingFilters(
        aiSalesAgentOrdersDefaultFiltersMembers,
        filters,
    )

    const journeyFilter = journeyId
        ? [
              {
                  member: AiSalesAgentOrdersDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
              },
          ]
        : []

    return {
        measures: [AiSalesAgentOrdersMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentOrdersDimension.IsInfluenced,
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
            {
                member: AiSalesAgentOrdersDimension.IntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            {
                member: AiSalesAgentOrdersDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            ...baseFilters,
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyTotalNumberOfSalesConversationsQueryFactory = (
    integrationId: string,
    filters: StatsFilters,
    timezone: string,
    journeyId?: string,
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const journeyFilter = journeyId
        ? [
              {
                  member: AiSalesAgentConversationsDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
              },
          ]
        : []

    return {
        measures: [AiSalesAgentConversationsMeasure.Count],
        dimensions: [],
        filters: [
            {
                member: AiSalesAgentConversationsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            {
                member: AiSalesAgentConversationsDimension.StoreIntegrationId,
                operator: ReportingFilterOperator.Equals,
                values: [integrationId],
            },
            ...statsFiltersToReportingFilters(
                aiSalesAgentConversationsDefaultFiltersMembers,
                filters,
            ),
            ...journeyFilter,
        ],
        timezone,
    }
}

export const aiJourneyUniqClicksQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    shopName: string,
    journeyId?: string,
): ReportingQuery<ConvertTrackingEventsCube> => {
    const journeyIdFilter = journeyId
        ? [
              {
                  member: ConvertTrackingEventsDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
              },
          ]
        : []

    return {
        measures: [ConvertTrackingEventsMeasure.UniqClicks],
        dimensions: [],
        filters: [
            {
                member: ConvertTrackingEventsDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-agent'],
            },
            {
                member: ConvertTrackingEventsDimension.JourneyId,
                operator: ReportingFilterOperator.Set,
                values: [],
            },
            {
                member: ConvertTrackingEventsDimension.ShopName,
                operator: ReportingFilterOperator.Equals,
                values: [shopName],
            },
            ...clicksDefaultFilters(filters),
            ...journeyIdFilter,
        ],
        timezone,
    }
}

export const aiJourneyTotalMessagesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    journeyId?: string,
): ReportingQuery<AiSalesAgentConversationsCube> => {
    const baseFilters = statsFiltersToReportingFilters(
        aiSalesAgentConversationsDefaultFiltersMembers,
        filters,
    )

    const journeyIdFilter = journeyId
        ? [
              {
                  member: AiSalesAgentConversationsDimension.JourneyId,
                  operator: ReportingFilterOperator.Equals,
                  values: [journeyId],
              },
          ]
        : []

    return {
        measures: [AiSalesAgentConversationsMeasure.AiJourneyTotalMessages],
        dimensions: [],
        filters: [...journeyIdFilter, ...baseFilters],
        timezone,
    }
}
