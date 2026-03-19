import type { HandleTimeCubeWithJoins } from 'domains/reporting/models/cubes/agentxp/HandleTimeCube'
import type { AiSalesAgentConversationsCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import type { AiSalesAgentOrdersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { TicketQAScoreCubeWithJoins } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import type { AIAgentAutomatedInteractionsV2Cube } from 'domains/reporting/models/cubes/automate_v2/AIAgentAutomatedInteractionsV2Cube'
import type { SuccessRateCube } from 'domains/reporting/models/cubes/automate_v2/SuccessRateCube'
import type { ConvertOrderConversionCube } from 'domains/reporting/models/cubes/ConvertOrderConversionCube'
import type { TicketProductsEnrichedCube } from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import type { HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import type { TicketSLACubeWithJoins } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import type { TicketFirstHumanAgentResponseTimeCube } from 'domains/reporting/models/cubes/TicketFirstHumanAgentResponseTime'
import type { TicketInsightsTaskCubeWithJoins } from 'domains/reporting/models/cubes/TicketInsightsTaskCube'
import type { TicketMessagesEnrichedResponseTimes } from 'domains/reporting/models/cubes/TicketMessagesEnrichedResponseTimesCube'
import type { TicketTagsEnrichedCube } from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import type { VoiceCallCube } from 'domains/reporting/models/cubes/VoiceCallCube'
import type { VoiceEventsByAgentCube } from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import type { ReportingQuery } from 'domains/reporting/models/types'

export enum JobStatus {
    CancelRequested = 'cancel_requested',
    Canceled = 'canceled',
    Done = 'done',
    Errored = 'errored',
    FatalErrored = 'fatal_errored',
    Pending = 'pending',
    Running = 'running',
    Scheduled = 'scheduled',
}

enum JobParamsStatus {
    Open = 'open',
    Closed = 'closed',
}

export enum JobType {
    ApplyMacro = 'applyMacro',
    DeleteTicket = 'deleteTicket',
    ExportTicket = 'exportTicket',
    ExportMacro = 'exportMacro',
    ImportMacro = 'importMacro',
    UpdateTicket = 'updateTicket',
    ExportTicketDrilldown = 'exportTicketDrilldown',
    ExportConvertCampaignSalesDrilldown = 'exportConvertCampaignSalesDrilldown',
}

type JobInfo = {
    progress_count: number
}

export type ConvertJobContext = {
    channel_connection_external_ids: string[]
}

export type JobContext = ConvertJobContext

export type JobParams =
    | {
          ticket_ids?: number[]
          updates?: {
              status: JobParamsStatus
          }
          macro_id?: number
          apply_and_close?: boolean
          url?: string
      }
    | ReportingQueryJobParams

export type DrillDownReportingQuery = ReportingQuery<
    | ConvertOrderConversionCube
    | HandleTimeCubeWithJoins
    | AIAgentAutomatedInteractionsV2Cube
    | HelpdeskMessageCubeWithJoins
    | HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins
    | TicketQAScoreCubeWithJoins
    | TicketSLACubeWithJoins
    | VoiceCallCube
    | VoiceEventsByAgentCube
    | TicketTagsEnrichedCube
    | TicketMessagesEnrichedResponseTimes
    | AiSalesAgentConversationsCube
    | AiSalesAgentOrdersCube
    | SuccessRateCube
    | TicketProductsEnrichedCube
    | TicketFirstHumanAgentResponseTimeCube
    | TicketInsightsTaskCubeWithJoins
>

type APIDrillDownReportingQuery = Omit<DrillDownReportingQuery, 'metricName'>

export type ReportingQueryJobParams = {
    reporting_query: APIDrillDownReportingQuery
    metric_name: string
    context?: JobContext
}

export type Job = {
    id: number
    cancel_requested_datetime: Maybe<string>
    cancelled_datetime: Maybe<string>
    created_datetime: string
    ended_datetime: Maybe<string>
    failed_datetime: Maybe<string>
    info: JobInfo
    locked_datetime: Maybe<string>
    meta: Record<string, unknown>
    params: JobParams
    scheduled_datetime: Maybe<string>
    started_datetime: Maybe<string>
    status: JobStatus
    type: JobType
    user_id: number
    uri: string
}

export type JobRequestPayload = {
    type: JobType
    params: JobParams
}
