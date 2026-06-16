import { isSessionImpersonated } from '@repo/activity-tracker/utils'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

export const useSkillReportingEnabled = () =>
    useFlag(FeatureFlagKey.IntentBasedKnowledgeMilestone3NewReportingLayer) ||
    isSessionImpersonated()
