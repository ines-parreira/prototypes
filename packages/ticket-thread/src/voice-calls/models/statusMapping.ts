import {
    VoiceCallStatus,
    VoiceCallTerminationStatus,
} from '@gorgias/helpdesk-types'

import { VoiceCallDisplayStatus } from './types'

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
        case VoiceCallStatus.Connected:
            return VoiceCallDisplayStatus.InProgress
        case VoiceCallStatus.Completed:
        case VoiceCallStatus.Ending:
        case VoiceCallStatus.NoAnswer:
        case VoiceCallStatus.Busy:
        case VoiceCallStatus.Failed:
        case VoiceCallStatus.Canceled:
        case VoiceCallStatus.Missed:
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
        case VoiceCallStatus.Initiated:
            return VoiceCallDisplayStatus.Ringing
        case VoiceCallStatus.Answered:
        case VoiceCallStatus.Connected:
        case VoiceCallStatus.Queued:
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
