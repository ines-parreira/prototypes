import { useMemo } from 'react'

import { hasRole, UserRole } from '@repo/utils'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

export function useBulkActionMenuState() {
    const { data: currentUser } = useGetCurrentUser()

    const canUseRestrictedBulkActions = useMemo(
        () => !!currentUser && hasRole(currentUser.data, UserRole.Agent),
        [currentUser],
    )

    return {
        canUseRestrictedBulkActions,
    }
}
