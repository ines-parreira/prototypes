import { useMemo } from 'react'

import type { UserAvailability } from '@gorgias/helpdesk-queries'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import { useAllUserAvailabilities } from './useAllUserAvailabilities'

export type UserStatus = {
    status: 'online' | 'offline'
    availability: UserAvailability | undefined
}

export function useUserStatus(userId: number | undefined): UserStatus {
    const { onlineAgents } = useAgentsOnlineStatus()
    const availabilities = useAllUserAvailabilities()

    const availability = useMemo(() => {
        if (userId === undefined) return undefined
        return availabilities.find((entry) => entry.user_id === userId)
    }, [availabilities, userId])

    const isOnline = userId !== undefined && Boolean(onlineAgents[userId])

    return {
        status: isOnline ? 'online' : 'offline',
        availability,
    }
}
