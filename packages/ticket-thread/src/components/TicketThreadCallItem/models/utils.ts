import { VoiceCallDirection, VoiceCallStatus } from '@gorgias/helpdesk-types'

import type { VoiceCallSubject } from './types'
import { VoiceCallSubjectType } from './types'

export const isFinalVoiceCallStatus = (status: VoiceCallStatus) => {
    const finalStatuses: VoiceCallStatus[] = [
        VoiceCallStatus.Busy,
        VoiceCallStatus.Canceled,
        VoiceCallStatus.Completed,
        VoiceCallStatus.Failed,
        VoiceCallStatus.NoAnswer,
        VoiceCallStatus.Ending,
        VoiceCallStatus.Missed,
    ]

    return finalStatuses.includes(status)
}

export const getFormattedDurationEndedCall = (
    durationInSeconds: number,
): string => {
    const totalSeconds = Math.floor(Number(durationInSeconds))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`
    }

    return `${seconds}s`
}

export const getFormattedDurationOngoingCall = (
    startedDatetime: string,
): string => {
    const startedMs = new Date(startedDatetime).getTime()
    const nowMs = Date.now()
    const totalSeconds = Math.max(0, Math.floor((nowMs - startedMs) / 1000))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const pad = (n: number) => String(n).padStart(2, '0')

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }

    return `${pad(minutes)}:${pad(seconds)}`
}

export const getFormattedDurationTranscriptionStart = (
    startedSecond: number,
) => {
    const totalSeconds = Math.floor(Number(startedSecond))
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(minutes)}:${pad(seconds)}`
}

export const getAnsweringVoiceSubject = (voiceCall: {
    answered_by_external_number?: string
    answered_by_external_customer_id?: number
    last_answered_by_agent_id: number | null
}): VoiceCallSubject | null => {
    if (voiceCall.answered_by_external_number) {
        return {
            type: VoiceCallSubjectType.External,
            value: voiceCall.answered_by_external_number,
            customer: voiceCall.answered_by_external_customer_id
                ? {
                      id: voiceCall.answered_by_external_customer_id,
                  }
                : null,
        }
    }
    if (voiceCall.last_answered_by_agent_id) {
        return {
            type: VoiceCallSubjectType.Agent,
            id: voiceCall.last_answered_by_agent_id,
        }
    }
    return null
}

export const isCallTransfer = (voiceCall: {
    direction: string
    last_answered_by_agent_id: number | null
    answered_by_external_number?: string
    status: VoiceCallStatus
}): boolean => {
    if (voiceCall.direction === VoiceCallDirection.Inbound) {
        return (
            !!voiceCall.last_answered_by_agent_id ||
            !!voiceCall.answered_by_external_number
        )
    }

    if (voiceCall.direction === VoiceCallDirection.Outbound) {
        return (
            !!voiceCall.last_answered_by_agent_id ||
            !!voiceCall.answered_by_external_number ||
            voiceCall.status === VoiceCallStatus.Queued
        )
    }

    return false
}

export const isCallBeingTransferredToQueue = (voiceCall: {
    status: VoiceCallStatus
    direction: string
    last_answered_by_agent_id: number | null
}): boolean => {
    if (
        voiceCall.status === VoiceCallStatus.Queued &&
        voiceCall.last_answered_by_agent_id
    ) {
        return true
    }
    if (
        voiceCall.status === VoiceCallStatus.Queued &&
        voiceCall.direction === VoiceCallDirection.Outbound
    ) {
        return true
    }
    return false
}

export const isCallInProgress = (voiceCall: {
    status: VoiceCallStatus
    direction: string
    last_answered_by_agent_id: number | null
}): boolean => {
    if (voiceCall.status === VoiceCallStatus.Answered) {
        return true
    }
    if (voiceCall.status === VoiceCallStatus.Connected) {
        return true
    }
    if (isCallBeingTransferredToQueue(voiceCall)) {
        return true
    }

    return false
}

const missedInboundCallStatuses: VoiceCallStatus[] = [
    VoiceCallStatus.Canceled,
    VoiceCallStatus.Completed,
    VoiceCallStatus.Ending,
]

const noDurationStatuses: VoiceCallStatus[] = [
    VoiceCallStatus.InProgress,
    VoiceCallStatus.Initiated,
    VoiceCallStatus.Queued,
    VoiceCallStatus.Ringing,
    VoiceCallStatus.Failed,
    VoiceCallStatus.Busy,
    VoiceCallStatus.NoAnswer,
]

export const shouldShowDuration = (voiceCall: {
    status: VoiceCallStatus
    direction: string
    last_answered_by_agent_id: number | null
    answered_by_external_number?: string
}): boolean => {
    const transfer = isCallTransfer(voiceCall)
    const isMissedInbound =
        voiceCall.direction === VoiceCallDirection.Inbound &&
        missedInboundCallStatuses.includes(voiceCall.status)

    if (
        !transfer &&
        (isMissedInbound || noDurationStatuses.includes(voiceCall.status))
    ) {
        return false
    }
    return true
}
