import {
    VoiceCallStatus,
    VoiceCallTerminationStatus,
} from '@gorgias/helpdesk-queries'

import { PhoneIntegrationEvent } from 'constants/integrations/types/event'

export type VoiceCallDirection = 'inbound' | 'outbound'

export enum VoiceCallDisplayStatus {
    Routing = 'routing',
    Ringing = 'ringing',
    InProgress = 'in-progress',
    Answered = 'answered',
    Missed = 'missed',
    Abandoned = 'abandoned',
    CallbackRequested = 'callback-requested',
    Cancelled = 'cancelled',
    Failed = 'failed',
    Unanswered = 'unanswered',
    Queued = 'queued',
    Calling = 'calling',
}

export type VoiceCallSummary = {
    id: number
    recording_id: number
    created_datetime: string
    summary: string
}

export type VoiceCall = {
    id: number
    integration_id: number
    ticket_id?: number
    phone_number_id?: number
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
    last_rang_agent_id?: number
    customer_id: number
    has_call_recording: boolean
    has_voicemail: boolean
    summaries?: VoiceCallSummary[]
    status_in_queue?: string
    queue_id?: number
    termination_status?: VoiceCallTerminationStatus
}

export enum VoiceCallRecordingType {
    Recording = 'call-recording',
    Voicemail = 'voicemail',
}

export enum VoiceCallRecordingTranscriptionStatus {
    Requested = 'requested',
    Completed = 'completed',
    Failed = 'failed',
    RecordingTooShort = 'recording_too_short',
    RecordingTooLong = 'recording_too_long',
    LowQualityTranscription = 'low_quality_transcription',
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
    transcription_status?: string | null
}

export type VoiceCallEvent = {
    id: number
    type: PhoneIntegrationEvent
    account_id: number
    call_id: number
    user_id: number | null
    customer_id: number
    created_datetime: string
    meta: Record<string, unknown>
}

export type ListVoiceCallsParams = {
    ticket_id?: number
    limit?: number
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
    input: unknown,
): input is OutboundVoiceCall =>
    isVoiceCall(input) && typeof input.initiated_by_agent_id === 'number'

const getFinalDisplayStatus = (
    terminationStatus: VoiceCallTerminationStatus,
) => {
    switch (terminationStatus) {
        case VoiceCallTerminationStatus.Answered:
            return VoiceCallDisplayStatus.Answered
        case VoiceCallTerminationStatus.Missed:
            return VoiceCallDisplayStatus.Missed
        case VoiceCallTerminationStatus.Abandoned:
            return VoiceCallDisplayStatus.Abandoned
        case VoiceCallTerminationStatus.CallbackRequested:
            return VoiceCallDisplayStatus.CallbackRequested
        case VoiceCallTerminationStatus.Cancelled:
            return VoiceCallDisplayStatus.Cancelled
    }
}

const getLegacyFinalDisplayStatus = (lastAnsweredByAgentId?: number | null) => {
    if (lastAnsweredByAgentId === null) {
        return VoiceCallDisplayStatus.Missed
    }
    return VoiceCallDisplayStatus.Answered
}

export const getInboundDisplayStatus = (
    status: VoiceCallStatus,
    termination_status?: VoiceCallTerminationStatus,
    lastAnsweredByAgentId?: number | null,
    status_in_queue?: string,
): VoiceCallDisplayStatus | null => {
    switch (status) {
        case VoiceCallStatus.Ringing:
        case VoiceCallStatus.Initiated:
        case VoiceCallStatus.InProgress:
            return VoiceCallDisplayStatus.Routing
        case VoiceCallStatus.Queued:
            if (status_in_queue === 'distributing') {
                return VoiceCallDisplayStatus.Calling
            }
            return VoiceCallDisplayStatus.Queued
        case VoiceCallStatus.Answered:
        case VoiceCallStatus.Connected: // should not be possible
            return VoiceCallDisplayStatus.InProgress
        case VoiceCallStatus.Completed:
        case VoiceCallStatus.Ending:
        case VoiceCallStatus.NoAnswer:
        case VoiceCallStatus.Busy:
        case VoiceCallStatus.Failed:
        case VoiceCallStatus.Canceled:
        case VoiceCallStatus.Missed: // should not be possible
            return termination_status
                ? getFinalDisplayStatus(termination_status)
                : getLegacyFinalDisplayStatus(lastAnsweredByAgentId)
        default:
            return null
    }
}

export const getOutboundDisplayStatus = (
    status: VoiceCallStatus,
): VoiceCallDisplayStatus | null => {
    switch (status) {
        case VoiceCallStatus.Ringing:
        case VoiceCallStatus.InProgress:
        case VoiceCallStatus.Queued:
        case VoiceCallStatus.Initiated:
            return VoiceCallDisplayStatus.Ringing
        case VoiceCallStatus.Answered: // should not be possible
        case VoiceCallStatus.Connected:
            return VoiceCallDisplayStatus.InProgress
        case VoiceCallStatus.Failed:
            return VoiceCallDisplayStatus.Failed
        case VoiceCallStatus.Canceled:
        case VoiceCallStatus.Busy:
        case VoiceCallStatus.NoAnswer:
        case VoiceCallStatus.Missed:
            return VoiceCallDisplayStatus.Unanswered
        case VoiceCallStatus.Completed:
            return VoiceCallDisplayStatus.Answered
        default:
            return null
    }
}

export const getPrettyVoiceCallDisplayStatusName = (
    status: VoiceCallDisplayStatus,
): string => {
    switch (status) {
        case VoiceCallDisplayStatus.Ringing:
            return 'Ringing'
        case VoiceCallDisplayStatus.Routing:
            return 'Routing'
        case VoiceCallDisplayStatus.InProgress:
            return 'In Progress'
        case VoiceCallDisplayStatus.Answered:
            return 'Answered'
        case VoiceCallDisplayStatus.Missed:
            return 'Missed'
        case VoiceCallDisplayStatus.Abandoned:
            return 'Abandoned'
        case VoiceCallDisplayStatus.Cancelled:
            return 'Cancelled'
        case VoiceCallDisplayStatus.Failed:
            return 'Failed'
        case VoiceCallDisplayStatus.Unanswered:
            return 'Unanswered'
        case VoiceCallDisplayStatus.CallbackRequested:
            return 'Callback Requested'
        case VoiceCallDisplayStatus.Queued:
            return 'Queued'
        default:
            return ''
    }
}
