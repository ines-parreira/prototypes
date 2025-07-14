import { BillableTicketCube } from 'domains/reporting/models/cubes/automate/BillableTicketCube'
import { Cube, JoinedCubesWithMapping } from 'domains/reporting/models/types'

export enum AutomationBillingEventMeasure {
    FirstResponseTimeWithAutomateFeatures = 'AutomationBillingEvent.firstResponseTimeWithAutomateFeatures',
    ResolutionTimeWithAutomateFeatures = 'AutomationBillingEvent.resolutionTimeWithAutomateFeatures',
    DecreaseInResolutionTimeWithAutomateFeatures = 'AutomationBillingEvent.decreaseInResolutionTimeWithAutomateFeatures',
    AutomationRate = 'AutomationBillingEvent.automationRate',
    AutomatedInteractions = 'AutomationBillingEvent.automatedInteractions',
    AutomatedInteractionsByTrackOrder = 'AutomationBillingEvent.automatedInteractionsByTrackOrder',
    AutomatedInteractionsByLoopReturns = 'AutomationBillingEvent.automatedInteractionsByLoopReturns',
    AutomatedInteractionsByQuickResponse = 'AutomationBillingEvent.automatedInteractionsByQuickResponse',
    AutomatedInteractionsByArticleRecommendation = 'AutomationBillingEvent.automatedInteractionsByArticleRecommendation',
    AutomatedInteractionsByAutomatedResponse = 'AutomationBillingEvent.automatedInteractionsByAutomatedResponse',
    AutomatedInteractionsByAutoResponders = 'AutomationBillingEvent.automatedInteractionsByAutoResponders',
    AutomatedInteractionsByQuickResponseFlows = 'AutomationBillingEvent.automatedInteractionsByQuickResponseFlows',
    AutomatedInteractionsByAIAgent = 'AutomationBillingEvent.automatedInteractionsByAIAgent',
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
    AutomationBillingEventCube,
    BillableTicketCube
>
