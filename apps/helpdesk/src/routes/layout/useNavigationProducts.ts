import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { UserRole } from '@repo/permissions'
import { useCurrentUserRole } from '@repo/users'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

export type NavigationProductVisibility = {
    canAccessAiAgent: boolean
    aiAgentRequiresUpgrade: boolean
    isAiJourneyVisible: boolean
    isConvertVisible: boolean
}

export function useNavigationProducts(): NavigationProductVisibility {
    const { value: isAiJourneyEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiJourneyEnabled,
    )
    const { hasAccess } = useAiAgentAccess()
    const { isAdmin, hasRole } = useCurrentUserRole()

    return {
        canAccessAiAgent: hasRole(UserRole.Agent),
        aiAgentRequiresUpgrade: !hasAccess,
        isAiJourneyVisible: isAiJourneyEnabled,
        isConvertVisible: isAdmin,
    }
}
