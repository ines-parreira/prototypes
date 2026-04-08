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
    ticketsView: {
        canRead: false,
        canCreateInternalNote: false,
        canWrite: false,
    },
}

const STANDALONE_AI_ACCESS_BY_ROLE = {
    [UserRole.Admin]: {
        statistics: { canRead: true, canWrite: true },
        userManagement: { canRead: true, canWrite: true },
        ticketsView: {
            canRead: true,
            canCreateInternalNote: true,
            canWrite: false,
        },
    },
    [UserRole.Agent]: {
        statistics: { canRead: true, canWrite: true },
        userManagement: { canRead: false, canWrite: false },
        ticketsView: {
            canRead: true,
            canCreateInternalNote: true,
            canWrite: false,
        },
    },
    [UserRole.ObserverAgent]: {
        statistics: { canRead: true, canWrite: false },
        userManagement: { canRead: false, canWrite: false },
        ticketsView: {
            canRead: true,
            canCreateInternalNote: true,
            canWrite: false,
        },
    },
} as const

type Props = {
    children: ReactNode
}

export const StandaloneAiProvider = ({ children }: Props) => {
    const STANDALONE_AI_HELPDESK_ID = '69b020cb62b0f057d64d0307'
    const APP_CLIENT_ID = window.APP_CLIENT_ID as unknown as string

    const isStandaloneAiAgentEnabled = useFlag(
        FeatureFlagKey.AiStandaloneAgent,
        false,
    )
    const isStandaloneAiAgent =
        isStandaloneAiAgentEnabled &&
        APP_CLIENT_ID === STANDALONE_AI_HELPDESK_ID

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
