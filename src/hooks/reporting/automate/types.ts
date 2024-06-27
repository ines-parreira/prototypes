import {Moment} from 'moment'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'

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

export enum WorkflowStepTrendMetrics {
    workflowStepViews = 'workflowTotalViews',
    workflowAutomatedInteractions = 'workflowAutomatedInteractions',
    workflowAutomationRate = 'workflowAutomationRate',
    workflowDropoff = 'workflowDropoff',
    workflowTicketCreated = 'workflowTicketCreated',
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
