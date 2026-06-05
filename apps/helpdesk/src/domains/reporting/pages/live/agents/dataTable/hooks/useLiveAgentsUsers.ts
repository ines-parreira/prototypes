import { useMemo } from 'react'

import { useAllUsers } from '@repo/users'

import type { User } from '@gorgias/helpdesk-queries'

import { getUserDisplayName } from '../utils/getUserDisplayName'

export type LiveAgentUser = {
    id: number
    name: string
    user: User
}

/**
 * Returns every active agent that can appear in the Live Agents table, loaded
 * once from the cached user list and sorted by display name so client-side
 * pagination is stable. The agents filter is applied by the caller.
 */
export function useLiveAgentsUsers(): LiveAgentUser[] {
    const users = useAllUsers()

    return useMemo(() => {
        return users
            .flatMap<LiveAgentUser>((user) => {
                if (!user.id || user.active === false) {
                    return []
                }
                return [{ id: user.id, name: getUserDisplayName(user), user }]
            })
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [users])
}
