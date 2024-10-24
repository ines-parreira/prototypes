import {User} from '@gorgias/api-queries'

import {
    AvailabilityStatusTag,
    User as GorgiasStateUser,
} from 'config/types/user'

export const mergeAgentData = (
    agentsData: GorgiasStateUser[],
    agentsDataWithStatus?: User[]
): {
    id: number
    status?: string
    name: string
    meta: {profile_picture_url?: string | null}
}[] => {
    const result = agentsData.map((agent) => {
        const agentWithStatus = agentsDataWithStatus?.find(
            (agentWithStatus) => agentWithStatus.id === agent.id
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
    status: string | undefined
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
