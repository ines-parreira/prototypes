import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { UserRole } from '@repo/utils'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { StandaloneAiContext } from 'providers/standalone-ai/StandaloneAiContext'

const ACTIONS = {
    canRead: false,
    canWrite: false,
}

const FEATURE_ACCESS_LIST = {
    statistics: ACTIONS,
    userManagement: ACTIONS,
}

const STANDALONE_AI_ACCESS_BY_ROLE = {
    [UserRole.Admin]: {
        statistics: { canRead: true, canWrite: true },
        userManagement: { canRead: true, canWrite: true },
    },
    [UserRole.Agent]: {
        statistics: { canRead: true, canWrite: true },
        userManagement: { canRead: false, canWrite: false },
    },
    [UserRole.ObserverAgent]: {
        statistics: { canRead: true, canWrite: false },
        userManagement: { canRead: false, canWrite: false },
    },
} as const

type Props = {
    children: ReactNode
}

export const StandaloneAiProvider = ({ children }: Props) => {
    const isStandaloneAiAgent = useFlag(FeatureFlagKey.AiStandaloneAgent, false)

    const { data: currentUser } = useGetCurrentUser()

    const roleName = currentUser?.data?.role?.name

    const accessFeaturesMapped = useMemo(() => {
        if (!isStandaloneAiAgent) return FEATURE_ACCESS_LIST

        if (!roleName) return FEATURE_ACCESS_LIST

        const access =
            STANDALONE_AI_ACCESS_BY_ROLE[
                roleName as keyof typeof STANDALONE_AI_ACCESS_BY_ROLE
            ]

        if (!access) {
            console.error('Unsupported role name', roleName)
            return FEATURE_ACCESS_LIST
        }

        return access
    }, [isStandaloneAiAgent, roleName])

    const value = useMemo(
        () => ({
            accessFeaturesMapped,
            isStandaloneAiAgent,
        }),
        [accessFeaturesMapped, isStandaloneAiAgent],
    )

    return (
        <StandaloneAiContext.Provider value={value}>
            {children}
        </StandaloneAiContext.Provider>
    )
}
