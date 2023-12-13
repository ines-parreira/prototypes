import {AutomationEventCube} from 'models/reporting/cubes/AutomationEventCube'
import {BillableDataCubeWithJoins} from 'models/reporting/cubes/BillableDataCube'
import {Cube, JoinedCubesWithMapping} from 'models/reporting/types'

export enum AutomationBillingEventMeasure {
    FirstResponseTimeWithAutomateFeatures = 'AutomationBillingEvent.firstResponseTimeWithAutomateFeatures',
    ResolutionTimeWithAutomateFeatures = 'AutomationBillingEvent.resolutionTimeWithAutomateFeatures',
    OverallTimeSaved = 'AutomationBillingEvent.overallTimeSaved',
    AutomationRate = 'AutomationBillingEvent.automationRate',
    AutomatedInteractions = 'AutomationBillingEvent.automatedInteractions',
    AutomatedInteractionsByTrackOrder = 'AutomationBillingEvent.automatedInteractionsByTrackOrder',
    AutomatedInteractionsByLoopReturns = 'AutomationBillingEvent.automatedInteractionsByLoopReturns',
    AutomatedInteractionsByQuickResponse = 'AutomationBillingEvent.automatedInteractionsByQuickResponse',
    AutomatedInteractionsByArticleRecommendation = 'AutomationBillingEvent.automatedInteractionsByArticleRecommendation',
    AutomatedInteractionsByAutomatedResponse = 'AutomationBillingEvent.automatedInteractionsByAutomatedResponse',
    AutomatedInteractionsByAutoResponders = 'AutomationBillingEvent.automatedInteractionsByAutoResponders',
    AutomatedInteractionsByQuickResponseFlows = 'AutomationBillingEvent.automatedInteractionsByQuickResponseFlows',
}

export enum AutomationBillingEventDimension {
    CreatedDate = 'AutomationBillingEvent.createdDate',
    AccountId = 'AutomationBillingEvent.accountId',
}

export enum AutomationBillingEventMember {
    PeriodStart = 'AutomationBillingEvent.periodStart',
    PeriodEnd = 'AutomationBillingEvent.periodEnd',
    CreatedDate = 'AutomationBillingEvent.createdDate',
    AccountId = 'AutomationBillingEvent.accountId',
    AutomatedInteractions = 'AutomationBillingEvent.automatedInteractions',
}

type AutomationBillingEventCube = Cube<
    AutomationBillingEventMeasure,
    AutomationBillingEventDimension,
    AutomationBillingEventMember,
    never,
    never
>

export type AutomationBillingEventCubeWithJoins = JoinedCubesWithMapping<
    JoinedCubesWithMapping<AutomationBillingEventCube, AutomationEventCube>,
    BillableDataCubeWithJoins
>
