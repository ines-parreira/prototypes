import { User, VoiceCallTransferReceiverType } from '@gorgias/helpdesk-queries'

import {
    AgentWithStatus,
    AvailabilityStatusTag,
    User as GorgiasStateUser,
} from 'config/types/user'
import {
    TransferTarget,
    TransferType,
} from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/types'

export const mergeAgentData = (
    agentsData: GorgiasStateUser[],
    agentsDataWithStatus?: User[],
): AgentWithStatus[] => {
    const result = agentsData.map((agent) => {
        const agentWithStatus = agentsDataWithStatus?.find(
            (agentWithStatus) => agentWithStatus.id === agent.id,
        )

        return {
            id: agent.id,
            status: agentWithStatus?.availability_status?.status,
            name: agent.name,
            meta: {
                profile_picture_url: agent.meta?.profile_picture_url,
            },
        }
    })

    return result
}

export const getAvailabilityBadgeColor = (
    status: string | undefined,
): string | undefined => {
    switch (status) {
        case AvailabilityStatusTag.Offline:
            return 'var(--neutral-grey-4)'
        case AvailabilityStatusTag.Busy:
            return 'var(--feedback-warning)'
        case AvailabilityStatusTag.Online:
            return 'var(--feedback-success)'
        default:
            return
    }
}

export const getAvailabilityStatus = (
    status: string | undefined,
): 'away' | 'offline' | 'online' | undefined => {
    switch (status) {
        case AvailabilityStatusTag.Offline:
            return 'offline'
        case AvailabilityStatusTag.Busy:
            return 'away'
        case AvailabilityStatusTag.Online:
            return 'online'
        default:
            return
    }
}

export const getTransferReceiverData = (target: TransferTarget) => {
    // convert from transfer target to transfer API receiver data
    switch (target.type) {
        case TransferType.Agent:
            return {
                receiver_type: VoiceCallTransferReceiverType.Agent,
                receiver_id: target.id,
            }
        case TransferType.External:
            return {
                receiver_type: VoiceCallTransferReceiverType.External,
                receiver_value: target.value,
            }
    }
}
