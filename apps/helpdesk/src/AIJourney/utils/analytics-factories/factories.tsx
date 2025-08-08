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
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => ({
    measures: [AiSalesAgentOrdersMeasure.Gmv],
    dimensions: [AiSalesAgentOrdersDimension.Currency],
    filters: [
        {
            member: AiSalesAgentOrdersDimension.IsInfluenced,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
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
    ],
    timezone,
})

export const aiJourneyTotalNumberOfOrderQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentOrdersCube> => {
    const baseFilters = statsFiltersToReportingFilters(
        aiSalesAgentOrdersDefaultFiltersMembers,
        filters,
    )

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
                member: AiSalesAgentOrdersDimension.Source,
                operator: ReportingFilterOperator.Equals,
                values: ['ai-journey'],
            },
            ...baseFilters,
        ],
        timezone,
    }
}

export const aiJourneyTotalNumberOfSalesConversationsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AiSalesAgentConversationsCube> => ({
    measures: [AiSalesAgentConversationsMeasure.Count],
    dimensions: [],
    filters: [
        {
            member: AiSalesAgentConversationsDimension.Source,
            operator: ReportingFilterOperator.Equals,
            values: ['ai-journey'],
        },
        ...statsFiltersToReportingFilters(
            aiSalesAgentConversationsDefaultFiltersMembers,
            filters,
        ),
    ],
    timezone,
})

export const aiJourneyUniqClicksQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<ConvertTrackingEventsCube> => ({
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
        ...clicksDefaultFilters(filters),
    ],
    timezone,
})
