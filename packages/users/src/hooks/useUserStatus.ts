import type { UserAvailability } from '@gorgias/helpdesk-queries'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import { useUserAvailability } from './useUserAvailability'

export type UserStatus = {
    status: 'online' | 'offline'
    availability: UserAvailability | undefined
}

export function useUserStatus(userId: number | undefined): UserStatus {
    const { onlineAgents } = useAgentsOnlineStatus()
    const availability = useUserAvailability(userId)

    const isOnline = userId !== undefined && Boolean(onlineAgents[userId])

    return {
        status: isOnline ? 'online' : 'offline',
        availability,
    }
}
