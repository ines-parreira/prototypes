//@flow
import {
    APPLY_MACRO_JOB_TYPE,
    DELETE_TICKET_JOB_TYPE,
    EXPORT_TICKET_JOB_TYPE,
    UPDATE_TICKET_JOB_TYPE,
} from '../../constants/job'

type JobStatus =
    | 'cancel_requested'
    | 'canceled'
    | 'done'
    | 'errored'
    | 'fatal_errored'
    | 'pending'
    | 'running'
    | 'scheduled'

export type JobType =
    | typeof APPLY_MACRO_JOB_TYPE
    | typeof DELETE_TICKET_JOB_TYPE
    | typeof EXPORT_TICKET_JOB_TYPE
    | typeof UPDATE_TICKET_JOB_TYPE

type JobParamsStatus = 'open' | 'closed'

type JobParams = {
    ticket_ids?: number[],
    updates?: {
        status: JobParamsStatus,
    },
}

type JobInfo = {
    progress_count: number,
}

export type Job = {
    id: number,
    cancel_requested_datetime: ?string,
    cancelled_datetime: ?string,
    created_datetime: string,
    ended_datetime: ?string,
    failed_datetime: ?string,
    info: JobInfo,
    locked_datetime: ?string,
    meta: {},
    params: JobParams,
    scheduled_datetime: ?string,
    started_datetime: ?string,
    status: JobStatus,
    type: JobType,
    user_id: number,
    uri: string,
}
