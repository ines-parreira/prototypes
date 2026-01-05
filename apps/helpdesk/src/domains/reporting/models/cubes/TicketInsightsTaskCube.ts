import type { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import type {
    Cube,
    JoinedCubesWithMapping,
} from 'domains/reporting/models/types'

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

export enum TicketInsightsTaskMeasureV2 {
    TicketCount = 'ticketCount',
    AverageSurveyScore = 'averageSurveyScore',
}

export enum TicketInsightsTaskDimensionV2 {
    TicketId = 'ticketId',
    ResourceType = 'resourceType',
    ResourceSourceId = 'resourceSourceId',
    ResourceSourceSetId = 'resourceSourceSetId',
    CustomFieldTop2LevelsValue = 'customFieldTop2LevelsValue',
}

export type TicketInsightsTaskCube = Cube<
    TicketInsightsTaskMeasure,
    TicketInsightsTaskDimension,
    never,
    never,
    never
>

export type TicketInsightsTaskCubeWithJoins = JoinedCubesWithMapping<
    TicketInsightsTaskCube,
    TicketCubeWithJoins
>
