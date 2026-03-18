import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { UserRole } from '@repo/utils'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

const ACTIONS = {
    canRead: false,
    canWrite: false,
}

const FEATURE_ACCESS_LIST = {
    statistics: ACTIONS,
}

export const useStandaloneAiAccess = () => {
    const isStandaloneAiAgent = useFlag(FeatureFlagKey.AiStandaloneAgent, false)

    const { data: currentUser } = useGetCurrentUser()

    const roleName = currentUser?.data?.role?.name

    const accessFeaturesMapped = useMemo(() => {
        if (!isStandaloneAiAgent) return FEATURE_ACCESS_LIST

        switch (roleName) {
            case UserRole.Admin:
            case UserRole.Agent:
                return { statistics: { canRead: true, canWrite: true } }
            case UserRole.ObserverAgent:
                return { statistics: { canRead: true, canWrite: false } }
            default:
                console.error('Unsupported role name', roleName)
                return FEATURE_ACCESS_LIST
        }
    }, [isStandaloneAiAgent, roleName])

    return {
        accessFeaturesMapped,
        isStandaloneAiAgent,
    }
}
