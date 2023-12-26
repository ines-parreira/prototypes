import {PhoneIntegrationEvent} from 'constants/integrations/types/event'

export type VoiceCallDirection = 'inbound' | 'outbound'

export enum VoiceCallStatus {
    Answered = 'answered',
    Connected = 'connected',
    InProgress = 'in-progress',
    Initiated = 'initiated',
    Queued = 'queued',
    Ringing = 'ringing',
    Ending = 'ending',

    // Final statuses:
    Busy = 'busy',
    Canceled = 'canceled',
    Completed = 'completed',
    Failed = 'failed',
    NoAnswer = 'no-answer',
    Missed = 'missed',
}

export enum VoiceCallDisplayStatus {
    Answered = 'Answered',
    InProgress = 'In progress',
    Ringing = 'Ringing',
    Missed = 'Missed',
    Failed = 'Failed',
}

export type VoiceCall = {
    id: number
    integration_id: number
    ticket_id: number
    phone_number_id: number
    external_id: string
    provider: string
    status: VoiceCallStatus
    direction: VoiceCallDirection
    phone_number_source: string
    country_source: string
    phone_number_destination: string
    country_destination: string
    duration: number
    started_datetime: string
    created_datetime: string
    updated_datetime: string
    last_answered_by_agent_id: number | null
    initiated_by_agent_id?: number | null
    customer_id: number
    has_call_recording: boolean
    has_voicemail: boolean
}

export enum VoiceCallRecordingType {
    Recording = 'call-recording',
    Voicemail = 'voicemail',
}

export enum VoiceCallRecordingErrorCode {
    RECORDING_IS_PRIVATE = 'RECORDING_IS_PRIVATE',
}

export type VoiceCallRecording = {
    id: number
    call_id: number
    external_id: string
    url: string
    duration: number
    type: VoiceCallRecordingType
    created_datetime: string
    deleted_datetime: string | null
    deleted_by_user_id: number | null
    error_code: VoiceCallRecordingErrorCode | null
}

export type VoiceCallEvent = {
    id: number
    type: PhoneIntegrationEvent
    account_id: number
    call_id: number
    user_id: number
    customer_id: number
    created_datetime: string
    meta: Record<string, unknown>
}

export type ListVoiceCallsParams = {
    ticket_id?: number
}

export type ListCallRecordingsParams = {
    call_id?: number
}

export type ListCallEventsParams = {
    call_id?: number
}

export const isVoiceCall = (object: unknown): object is VoiceCall => {
    const obj = object as VoiceCall
    return obj &&
        typeof obj.id === 'number' &&
        obj.provider &&
        typeof obj.provider === 'string' &&
        obj.status &&
        typeof obj.status === 'string' &&
        obj.direction &&
        typeof obj.direction === 'string' &&
        obj.phone_number_source &&
        typeof obj.phone_number_source === 'string' &&
        obj.phone_number_destination &&
        typeof obj.phone_number_destination === 'string'
        ? true
        : false
}

export type OutboundVoiceCall = VoiceCall & {
    initiated_by_agent_id: number
}

export const isOutboundVoiceCall = (
    input: unknown
): input is OutboundVoiceCall =>
    isVoiceCall(input) && typeof input.initiated_by_agent_id === 'number'

export const getDisplayOutboundVoiceCallStatus = (status: VoiceCallStatus) => {
    switch (status) {
        case VoiceCallStatus.Ringing:
        case VoiceCallStatus.InProgress:
        case VoiceCallStatus.Queued:
        case VoiceCallStatus.Initiated:
            return VoiceCallDisplayStatus.Ringing
        case VoiceCallStatus.Failed:
            return VoiceCallDisplayStatus.Failed
        case VoiceCallStatus.Canceled:
        case VoiceCallStatus.Busy:
        case VoiceCallStatus.NoAnswer:
        case VoiceCallStatus.Missed:
            return VoiceCallDisplayStatus.Missed
        case VoiceCallStatus.Answered:
        case VoiceCallStatus.Connected:
            return VoiceCallDisplayStatus.InProgress
        case VoiceCallStatus.Completed:
            return VoiceCallDisplayStatus.Answered
        default:
            return null
    }
}

export const getDisplayInboundVoiceCallStatus = (status: VoiceCallStatus) => {
    switch (status) {
        case VoiceCallStatus.Ringing:
        case VoiceCallStatus.Initiated:
        case VoiceCallStatus.Queued:
        case VoiceCallStatus.InProgress:
            return VoiceCallDisplayStatus.Ringing
        case VoiceCallStatus.Failed:
        case VoiceCallStatus.NoAnswer:
            return VoiceCallDisplayStatus.Failed
        case VoiceCallStatus.Canceled:
        case VoiceCallStatus.Busy:
        case VoiceCallStatus.Missed:
        case VoiceCallStatus.Ending:
            return VoiceCallDisplayStatus.Missed
        case VoiceCallStatus.Answered:
        case VoiceCallStatus.Connected:
            return VoiceCallDisplayStatus.InProgress
        case VoiceCallStatus.Completed:
            return VoiceCallDisplayStatus.Answered
        default:
            return null
    }
}
