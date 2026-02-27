import type { Moment } from 'moment'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { TicketMeasure } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'

export enum AutomateTrendMetrics {
    AutomationRate = 'automationRateTrend',
    Interactions = 'automatedInteractionTrend',
    DecreaseInResolutionTime = 'decreaseInResolutionTimeTrend',
    DecreaseInFirstResponseTime = 'decreaseInFirstResponseTimeTrend',
}

export enum WorkflowTrendMetrics {
    WorkflowTotalViews = 'workflowTotalViews',
    WorkflowAutomatedInteractions = 'workflowAutomatedInteractions',
    WorkflowAutomationRate = 'workflowAutomationRate',
    WorkflowDropoff = 'workflowDropoff',
    WorkflowTicketCreated = 'workflowTicketCreated',
}

export type TrendData = {
    value: number | null
    prevValue: number | null
}

export type AutomateTimeseries = {
    isFetching: boolean
    isError: boolean
    automationRateTimeSeries: TimeSeriesDataItem[][]
    automatedInteractionTimeSeries: TimeSeriesDataItem[][]
    automatedInteractionByEventTypesTimeSeries: TimeSeriesDataItem[][]
}

export type GreyArea = {
    from: Moment
    to: Moment
}

export const FLOW_STARTED = 'flow_started'
export const FLOW_PROMPT_STARTED = 'flow_prompt_started'
export const FLOW_PROMPT_NOT_HELPFUL = 'flow_prompt_not_helpful'
export const FLOW_ENDED_WITHOUT_ACTION = 'flow_ended_without_action'
export const FLOW_ENDED_WITH_TICKET_HANDOVER = 'flow_ended_with_ticket_handover'
export const FLOW_HANDOVER_TICKET_CREATED = 'flow_handover_ticket_created'
export const FLOW_STEP_STARTED = 'flow_step_started'
export const FLOW_STEP_ENDED = 'flow_step_ended'
export const AI_AGENT_TICKET_HANDOVER = 'ai_agent_ticket_handover'

export const DEFAULT_WORKFLOW_ANALYTICS_DATA = {
    views: 0,
    viewRate: 0,
    dropoff: 0,
    dropoffRate: 0,
    automatedInteractions: 0,
    automatedInteractionsRate: 0,
    ticketsCreated: 0,
    ticketsCreatedRate: 0,
}

export const BREAKDOWN_FIELD =
    TicketCustomFieldsDimension.TicketCustomFieldsValueString
export const TICKET_COUNT = TicketMeasure.TicketCount
export const CUSTOM_FIELD_COUNT =
    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount

export type EnrichedTicketCustomFields = {
    [BREAKDOWN_FIELD]: string | null
    [TICKET_COUNT]: string | null
    [CUSTOM_FIELD_COUNT]: string | null
}

export type EnrichedTicketCustomFieldsWithSuccessRateUpliftOpportunity =
    EnrichedTicketCustomFields & {
        successRateUpliftOpportunity: number
    }

export type EnrichedTicketCustomFieldsWithSuccessRate =
    EnrichedTicketCustomFields & {
        successRate: number
    }

export type SortingField =
    | keyof EnrichedTicketCustomFieldsWithSuccessRateUpliftOpportunity
    | keyof EnrichedTicketCustomFieldsWithSuccessRate

export const CUSTOM_FIELD_AI_AGENT_HANDOVER = 'Handover'
export const CUSTOM_FIELD_AI_AGENT_CLOSE = 'Close'

export enum AI_AGENT_OUTCOME_DISPLAY_LABELS {
    Handover = 'Handover',
    Automated = 'Automated',
}
