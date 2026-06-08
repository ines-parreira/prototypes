import { useCallback, useMemo } from 'react'
import { Duration } from '@gorgias/toolkit'

import { hasRole, isAdmin } from '@repo/permissions'
import type { UserRole } from '@repo/permissions'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

export function useCurrentUserRole() {
    const { data: currentUser } = useGetCurrentUser({
        query: {
            select: (data) => data.data,
            staleTime: Duration.minutes(5),
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
        currentUser,
    }
}
