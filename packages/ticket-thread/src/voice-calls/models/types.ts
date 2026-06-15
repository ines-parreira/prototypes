import type { PhoneIntegrationEvent } from './voiceCallEventTypes'

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

export enum VoiceCallSubjectType {
    Agent = 'agent',
    External = 'external',
    Queue = 'queue',
    IvrMenuOption = 'ivr-menu-option',
}

export type VoiceCallSubject =
    | { type: VoiceCallSubjectType.Agent; id: number }
    | { type: VoiceCallSubjectType.Queue; id: number }
    | {
          type: VoiceCallSubjectType.External
          value: string
          customer?: { id: number; name?: string } | null
      }
    | {
          type: VoiceCallSubjectType.IvrMenuOption
          digit: string
      }

export const VoiceCallRecordingType = {
    Recording: 'call-recording',
    Voicemail: 'voicemail',
} as const
export type VoiceCallRecordingType =
    (typeof VoiceCallRecordingType)[keyof typeof VoiceCallRecordingType]

export const VoiceCallRecordingTranscriptionStatus = {
    Requested: 'requested',
    Completed: 'completed',
    Failed: 'failed',
    RecordingTooShort: 'recording_too_short',
    RecordingTooLong: 'recording_too_long',
    LowQualityTranscription: 'low_quality_transcription',
} as const
export type VoiceCallRecordingTranscriptionStatus =
    (typeof VoiceCallRecordingTranscriptionStatus)[keyof typeof VoiceCallRecordingTranscriptionStatus]

export const VoiceCallRecordingErrorCode = {
    RECORDING_IS_PRIVATE: 'RECORDING_IS_PRIVATE',
} as const
export type VoiceCallRecordingErrorCode =
    (typeof VoiceCallRecordingErrorCode)[keyof typeof VoiceCallRecordingErrorCode]

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
