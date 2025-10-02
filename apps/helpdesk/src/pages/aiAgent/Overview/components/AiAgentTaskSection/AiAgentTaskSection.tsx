import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { useAiAgentOverviewModeEnabled } from 'pages/aiAgent/Overview/hooks/useAiAgentOverviewModeEnabled'

import { PendingTasksSectionConnected } from '../PendingTasksSection/PendingTasksSectionConnected'

interface AiAgentTaskSectionProps {
    shopName: string
    shopType: string
}

export const AiAgentTaskSection = ({
    shopName,
    shopType,
}: AiAgentTaskSectionProps) => {
    const aiAgentPostOnboardingStepsEnabled = useFlag(
        FeatureFlagKey.AiAgentPostOnboardingSteps,
        false,
    )

    const aiAgentPostStoreInstallationStepsEnabled = useFlag(
        FeatureFlagKey.AiAgentPostStoreInstallationSteps,
        false,
    )

    const isNewModeEnabledViaFeatureFlag =
        aiAgentPostOnboardingStepsEnabled ||
        aiAgentPostStoreInstallationStepsEnabled

    const { isAiAgentLiveModeEnabled, isLoading } =
        useAiAgentOverviewModeEnabled(
            shopName,
            shopType,
            isNewModeEnabledViaFeatureFlag,
        )

    if (isLoading) {
        return null
    }

    if (aiAgentPostOnboardingStepsEnabled && !isAiAgentLiveModeEnabled) {
        return <>Skeleton for AI Agent Post Onboarding Steps</>
    }

    if (aiAgentPostStoreInstallationStepsEnabled) {
        return <>Skeleton for AI Agent Post Store Installation Steps</>
    }

    // default to existing Task section for backward compatibility - it'll be removed when the new mode is fully enabled
    return <PendingTasksSectionConnected shopName={shopName} />
}
