import { useCallback, useMemo } from 'react'

import { hasRole, isAdmin } from '@repo/permissions'
import type { UserRole } from '@repo/permissions'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

export function useCurrentUserRole() {
    const { data: currentUser } = useGetCurrentUser({
        query: {
            select: (data) => data.data,
        },
    })

    const isAdminValue = useMemo(
        () => (currentUser ? isAdmin(currentUser) : false),
        [currentUser],
    )

    const hasRoleCallback = useCallback(
        (requiredRole: UserRole): boolean => {
            if (!currentUser) return false
            return hasRole(currentUser, requiredRole)
        },
        [currentUser],
    )

    return {
        isAdmin: isAdminValue,
        hasRole: hasRoleCallback,
    }
}
