import { isSessionImpersonated } from '@repo/activity-tracker/utils'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

type SkillsAccessFlag = boolean | { impersonation?: boolean }

export const useSkillsAccess = (): boolean => {
    const value = useFlag<SkillsAccessFlag>(
        FeatureFlagKey.KnowledgeIntentManagementSystem,
        false,
    )

    if (value === true) return true
    if (typeof value === 'object' && value?.impersonation === true) {
        return isSessionImpersonated()
    }
    return false
}
