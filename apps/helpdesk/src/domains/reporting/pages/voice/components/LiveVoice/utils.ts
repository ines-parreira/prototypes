import {
    LiveCallQueueAgent,
    LiveCallQueueAgentCallStatusesItem,
    LiveCallQueueVoiceCall,
    User,
    VoiceCallDirection,
    VoiceCallStatus,
} from '@gorgias/helpdesk-queries'

import { LiveVoiceStatusFilterOption } from 'domains/reporting/pages/voice/components/LiveVoice/types'
import { VoiceCallTableColumn } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import {
    getInboundDisplayStatus,
    getOutboundDisplayStatus,
} from 'models/voiceCall/types'
import { getMoment } from 'utils/date'

export enum AgentStatusCategory {
    Busy = 'Busy',
    Available = 'Available',
    Unavailable = 'Unavailable',
}

export const liveVoiceCallTableColumns: VoiceCallTableColumn[] = [
    VoiceCallTableColumn.Activity,
    VoiceCallTableColumn.LiveStatus,
    VoiceCallTableColumn.OngoingTime,
    VoiceCallTableColumn.Integration,
    VoiceCallTableColumn.Queue,
    VoiceCallTableColumn.Ticket,
]

export const isAgentBusy = (agent: LiveCallQueueAgent): boolean => {
    return !!agent.call_statuses?.length
}

export const isAgentAvailable = (agent: LiveCallQueueAgent): boolean => {
    return !!agent.is_available_for_call
}

export const isAgentAvailableComputed = (
    agent: LiveCallQueueAgent,
): boolean => {
    const available =
        !!agent.available &&
        (!!agent.online ||
            (!!agent.forward_calls && !!agent.forward_when_offline))
    return available && !isAgentBusy(agent) && !!agent.voice_queue_ids?.length
}

export const recomputeAgentsWithOnlineStatusChange = (
    agents: LiveCallQueueAgent[],
    onlineAgents: Record<number, User>,
): LiveCallQueueAgent[] => {
    return agents.map((agent) => {
        const online = agent.id ? !!onlineAgents[agent.id] : !!agent.online
        return {
            ...agent,
            online,
            is_available_for_call: isAgentAvailableComputed({
                ...agent,
                online,
            }),
        }
    })
}

const sortAgentsByOnlineAndName = (
    agents: LiveCallQueueAgent[],
): LiveCallQueueAgent[] => {
    return agents.sort((a, b) => {
        if (a.online !== b.online) {
            return a.online ? -1 : 1
        }

        const nameA = a.name?.toLowerCase() || ''
        const nameB = b.name?.toLowerCase() || ''
        return nameA.localeCompare(nameB) // Sort by name
    })
}

export const groupAgentsByStatus = (
    agents: LiveCallQueueAgent[],
): Record<AgentStatusCategory, LiveCallQueueAgent[]> => {
    const busyAgents: LiveCallQueueAgent[] = []
    const availableAgents: LiveCallQueueAgent[] = []
    const unavailableAgents: LiveCallQueueAgent[] = []

    sortAgentsByOnlineAndName(agents).forEach((agent) => {
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
        [AgentStatusCategory.Available]: availableAgents,
        [AgentStatusCategory.Unavailable]: unavailableAgents,
    }
}

export const formatVoiceCallsData = (
    voiceCalls: LiveCallQueueVoiceCall[],
): VoiceCallSummary[] =>
    voiceCalls.map((voiceCall) => {
        const agentId =
            voiceCall.last_answered_by_agent_id ??
            voiceCall.initiated_by_agent_id
        const status = voiceCall.status
        const displayStatus =
            voiceCall.direction === VoiceCallDirection.Inbound
                ? getInboundDisplayStatus(
                      voiceCall.status,
                      voiceCall.termination_status,
                      voiceCall.last_answered_by_agent_id,
                      voiceCall.status_in_queue,
                  )
                : getOutboundDisplayStatus(status)

        return {
            agentId: isNaN(Number(agentId)) ? null : Number(agentId),
            customerId: voiceCall.customer_id,
            customerName: voiceCall.customer_name,
            direction: voiceCall.direction,
            integrationId: voiceCall.integration_id,
            createdAt: voiceCall.created_datetime,
            status: status,
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
            displayStatus: displayStatus,
            queueId: voiceCall.queue_id ?? null,
            queueName: null,
        }
    })

export const isLiveInboundVoiceCallAnswered = (
    status: VoiceCallStatus,
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

export const isLiveCallRinging = (status: VoiceCallStatus): boolean => {
    switch (status) {
        case VoiceCallStatus.Ringing:
        case VoiceCallStatus.InProgress:
        case VoiceCallStatus.Queued:
        case VoiceCallStatus.Initiated:
            return true
        default:
            return false
    }
}

export const filterLiveCallsByStatus = (
    voiceCalls: LiveCallQueueVoiceCall[],
    statusFilter: LiveVoiceStatusFilterOption,
): LiveCallQueueVoiceCall[] => {
    switch (statusFilter) {
        case LiveVoiceStatusFilterOption.ALL:
            return voiceCalls
        case LiveVoiceStatusFilterOption.IN_QUEUE:
            return voiceCalls.filter(
                (voiceCall) =>
                    voiceCall.direction === VoiceCallDirection.Inbound &&
                    !isLiveInboundVoiceCallAnswered(voiceCall.status),
            )
        case LiveVoiceStatusFilterOption.IN_PROGRESS:
            return voiceCalls.filter(
                (voiceCall) =>
                    voiceCall.direction === VoiceCallDirection.Outbound ||
                    isLiveInboundVoiceCallAnswered(voiceCall.status),
            )
    }
}

export const orderLiveVoiceCallsByOngoingTime = (
    voiceCalls: LiveCallQueueVoiceCall[],
    orderDirection: OrderDirection,
): LiveCallQueueVoiceCall[] => {
    return voiceCalls.sort((voiceCallA, voiceCallB) =>
        orderDirection === OrderDirection.Asc
            ? voiceCallB.created_datetime.localeCompare(
                  voiceCallA.created_datetime,
              )
            : voiceCallA.created_datetime.localeCompare(
                  voiceCallB.created_datetime,
              ),
    )
}

export const getLiveVoicePeriodFilter = (
    timezone: string,
): { start_datetime: string; end_datetime: string } => {
    const now = getMoment().tz(timezone)

    return {
        start_datetime: formatReportingQueryDate(now.clone().startOf('day')),
        end_datetime: formatReportingQueryDate(now.clone().endOf('day')),
    }
}

export const getOldestInProgressCall = (
    agent: LiveCallQueueAgent,
): LiveCallQueueAgentCallStatusesItem | null => {
    if (!agent.call_statuses?.length) {
        return null
    }

    return agent.call_statuses
        ?.filter((call) => call.status === 'in-progress')
        .sort((a, b) =>
            a.created_datetime!.localeCompare(b.created_datetime!),
        )[0]
}

const getLastCall = (
    agent: LiveCallQueueAgent,
): LiveCallQueueAgentCallStatusesItem | undefined => {
    return agent.call_statuses?.[agent.call_statuses.length - 1]
}

export const mapBusyAgentStatus = (
    agent: LiveCallQueueAgent,
): {
    description: string
    isDescriptionTimestamp: boolean
} => {
    const lastCall = getLastCall(agent)

    if (!lastCall) {
        return {
            description: '',
            isDescriptionTimestamp: false,
        }
    }

    const oldestInProgressCall = getOldestInProgressCall(agent)

    if (oldestInProgressCall) {
        return {
            description: oldestInProgressCall.created_datetime!,
            isDescriptionTimestamp: true,
        }
    }

    if (lastCall?.status === 'wrapping-up') {
        return {
            description: 'Wrapping up',
            isDescriptionTimestamp: false,
        }
    }

    return {
        description: 'Ringing',
        isDescriptionTimestamp: false,
    }
}
