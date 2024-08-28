import {
    LiveCallQueueAgent,
    LiveCallQueueAgentCallStatusesItem,
    LiveCallQueueVoiceCall,
    VoiceCallStatus,
} from '@gorgias/api-queries'
import {VoiceCallStatus as LegacyVoiceCallStatus} from 'models/voiceCall/types'
import {VoiceCallSummary} from '../../models/types'

export enum AgentStatusCategory {
    Busy = 'Busy',
    Available = 'Available',
    Unavailable = 'Unavailable',
}

export enum LiveVoiceStatusFilterOption {
    ALL = 'all',
    IN_QUEUE = 'in_queue',
    IN_PROGRESS = 'in_progress',
}

export const isAgentBusy = (agent: LiveCallQueueAgent): boolean => {
    return !!agent.call_statuses?.length
}

export const isAgentAvailable = (agent: LiveCallQueueAgent): boolean => {
    return !!agent.is_available_for_call
}

const sortOnlineAgentsFirst = (
    agents: LiveCallQueueAgent[]
): LiveCallQueueAgent[] => {
    return agents.sort((agentA) => (agentA.online ? -1 : 1))
}

export const groupAgentsByStatus = (
    agents: LiveCallQueueAgent[]
): Record<AgentStatusCategory, LiveCallQueueAgent[]> => {
    const busyAgents: LiveCallQueueAgent[] = []
    const availableAgents: LiveCallQueueAgent[] = []
    const unavailableAgents: LiveCallQueueAgent[] = []

    agents.forEach((agent) => {
        if (isAgentBusy(agent)) {
            busyAgents.push(agent)
        } else if (isAgentAvailable(agent)) {
            availableAgents.push(agent)
        } else {
            unavailableAgents.push(agent)
        }
    })

    return {
        [AgentStatusCategory.Busy]: busyAgents,
        [AgentStatusCategory.Available]: sortOnlineAgentsFirst(availableAgents),
        [AgentStatusCategory.Unavailable]:
            sortOnlineAgentsFirst(unavailableAgents),
    }
}

export const getOldestCall = (
    agent: LiveCallQueueAgent
): LiveCallQueueAgentCallStatusesItem | null => {
    if (!agent.call_statuses?.length) {
        return null
    }

    return agent.call_statuses?.reduce((oldestCall, call) => {
        if (!oldestCall) {
            return call
        }

        return call.created_datetime &&
            oldestCall.created_datetime &&
            call.created_datetime < oldestCall.created_datetime
            ? call
            : oldestCall
    })
}

export const formatVoiceCallsData = (
    voiceCalls: LiveCallQueueVoiceCall[]
): VoiceCallSummary[] =>
    voiceCalls.map((voiceCall) => {
        const agentId =
            voiceCall.last_answered_by_agent_id ??
            voiceCall.initiated_by_agent_id

        return {
            agentId: isNaN(Number(agentId)) ? null : Number(agentId),
            customerId: voiceCall.customer_id,
            customerName: voiceCall.customer_name,
            direction: voiceCall.direction,
            integrationId: voiceCall.integration_id,
            createdAt: voiceCall.created_datetime,
            status: voiceCall.status as LegacyVoiceCallStatus,
            duration: voiceCall.duration,
            ticketId: voiceCall.ticket_id,
            phoneNumberDestination: voiceCall.phone_number_destination ?? '',
            phoneNumberSource: voiceCall.phone_number_source ?? '',
            talkTime: null,
            waitTime: null,
            voicemailAvailable: voiceCall.has_voicemail,
            voicemailUrl: null,
            callRecordingAvailable: voiceCall.has_call_recording,
            callRecordingUrl: null,
        }
    })

export const isLiveInboundVoiceCallAnswered = (
    status: VoiceCallStatus
): boolean => {
    switch (status) {
        case VoiceCallStatus.Ringing:
        case VoiceCallStatus.Initiated:
        case VoiceCallStatus.Queued:
        case VoiceCallStatus.InProgress:
            return false
        default:
            return true
    }
}
