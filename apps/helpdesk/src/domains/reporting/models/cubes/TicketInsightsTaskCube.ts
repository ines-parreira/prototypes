import type { Cube } from 'domains/reporting/models/types'

export enum TicketInsightsTaskMeasure {
    TicketCount = 'TicketInsightsTask.ticketCount',
    AvgSurveyScore = 'TicketInsightsTask.avgSurveyScore',
}

export enum TicketInsightsTaskDimension {
    TicketId = 'TicketInsightsTask.ticketId',
    AccountId = 'TicketInsightsTask.accountId',
    ShopName = 'TicketInsightsTask.shopName',
    ShopIntegrationId = 'TicketInsightsTask.shopIntegrationId',
    ResourceType = 'TicketInsightsTask.resourceType',
    ResourceSourceId = 'TicketInsightsTask.resourceSourceId',
    ResourceSourceSetId = 'TicketInsightsTask.resourceSourceSetId',
    ResourceLocale = 'TicketInsightsTask.resourceLocale',
}

export type TicketInsightsTaskCube = Cube<
    TicketInsightsTaskMeasure,
    TicketInsightsTaskDimension,
    never,
    never,
    never
>
