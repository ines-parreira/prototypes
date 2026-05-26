import { useMemo } from 'react'

import type { User } from '@gorgias/helpdesk-queries'

import { useAllUsers } from './useAllUsers'

export function useAccountOwner(): User | undefined {
    const users = useAllUsers()
    const accountOwnerId = window.GORGIAS_STATE?.currentAccount?.user_id

    return useMemo(() => {
        if (!accountOwnerId) return undefined
        return users.find((user) => user.id === accountOwnerId)
    }, [users, accountOwnerId])
}
