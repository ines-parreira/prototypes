import type { Cube } from 'domains/reporting/models/types'

export enum TicketInsightsTaskMeasure {
    TicketCount = 'TicketInsightsTaskV3.ticketCount',
    AvgSurveyScore = 'TicketInsightsTaskV3.avgSurveyScore',
}

export enum TicketInsightsTaskDimension {
    TicketId = 'TicketInsightsTaskV3.ticketId',
    AccountId = 'TicketInsightsTaskV3.accountId',
    ShopName = 'TicketInsightsTaskV3.shopName',
    ShopIntegrationId = 'TicketInsightsTaskV3.shopIntegrationId',
    ResourceType = 'TicketInsightsTaskV3.resourceType',
    ResourceSourceId = 'TicketInsightsTaskV3.resourceSourceId',
    ResourceSourceSetId = 'TicketInsightsTaskV3.resourceSourceSetId',
    ResourceLocale = 'TicketInsightsTaskV3.resourceLocale',
}

export type TicketInsightsTaskCube = Cube<
    TicketInsightsTaskMeasure,
    TicketInsightsTaskDimension,
    never,
    never,
    never
>
