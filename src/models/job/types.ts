import {HandleTimeCubeWithJoins} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketSLACubeWithJoins} from 'models/reporting/cubes/sla/TicketSLACube'
import {VoiceCallCube} from 'models/reporting/cubes/VoiceCallCube'
import {ReportingQuery} from 'models/reporting/types'
import {ConvertOrderConversionCube} from 'models/reporting/cubes/ConvertOrderConversionCube'

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

export type ReportingQueryJobParams = {
    reporting_query: ReportingQuery<
        | HelpdeskMessageCubeWithJoins
        | HandleTimeCubeWithJoins
        | TicketSLACubeWithJoins
        | ConvertOrderConversionCube
        | VoiceCallCube
    >
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
