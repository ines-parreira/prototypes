import { HandleTimeCubeWithJoins } from 'domains/reporting/models/cubes/agentxp/HandleTimeCube'
import { AiSalesAgentConversationsCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { TicketQAScoreCubeWithJoins } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { ConvertOrderConversionCube } from 'domains/reporting/models/cubes/ConvertOrderConversionCube'
import { TicketProductsEnrichedCube } from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import { HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketSLACubeWithJoins } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { TicketMessagesEnrichedResponseTimes } from 'domains/reporting/models/cubes/TicketMessagesEnrichedResponseTimesCube'
import { TicketTagsEnrichedCube } from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import { VoiceCallCube } from 'domains/reporting/models/cubes/VoiceCallCube'
import { ReportingQuery } from 'domains/reporting/models/types'

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
    | HelpdeskMessageCubeWithJoins
    | HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins
    | TicketQAScoreCubeWithJoins
    | TicketSLACubeWithJoins
    | VoiceCallCube
    | TicketTagsEnrichedCube
    | TicketMessagesEnrichedResponseTimes
    | AiSalesAgentConversationsCube
    | AiSalesAgentOrdersCube
    | TicketProductsEnrichedCube
>

export type ReportingQueryJobParams = {
    reporting_query: DrillDownReportingQuery
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
