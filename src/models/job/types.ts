enum JobStatus {
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
    UpdateTicket = 'updateTicket',
}

type JobInfo = {
    progress_count: number
}

type JobParams = {
    ticket_ids?: number[]
    updates?: {
        status: JobParamsStatus
    }
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
