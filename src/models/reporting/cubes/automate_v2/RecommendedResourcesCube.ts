import {Cube} from 'models/reporting/types'

export enum RecommendedResourcesMeasure {
    NumRecommendedResources = 'RecommendedResources.numRecommendedResources',
}

export enum RecommendedResourcesDimension {
    AccountId = 'RecommendedResources.accountId',
    EventType = 'RecommendedResources.eventType',
    Channel = 'RecommendedResources.channel',
    AutomationEventCreatedDatetime = 'RecommendedResources.automationEventCreatedDatetime',
    TicketId = 'RecommendedResources.ticketId',
    RecommendedResourceId = 'RecommendedResources.resourceId',
}

export enum RecommendedResourcesFilterMember {
    AutomatedInteractions = 'RecommendedResources.automatedInteractions',
    EventType = 'RecommendedResources.eventType',
    Channel = 'RecommendedResources.channel',
    PeriodStart = 'RecommendedResources.periodStart',
    PeriodEnd = 'RecommendedResources.periodEnd',
    TicketId = 'RecommendedResources.ticketId',
}
export enum RecommendedResourcesSegment {}

export type RecommendedResourcesCube = Cube<
    RecommendedResourcesMeasure,
    RecommendedResourcesDimension,
    RecommendedResourcesSegment,
    RecommendedResourcesFilterMember
>
