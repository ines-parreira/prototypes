import { useEffect } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useAiAgentOverviewModeEnabled } from 'pages/aiAgent/Overview/hooks/useAiAgentOverviewModeEnabled'

import { PendingTasksSectionConnected } from '../PendingTasksSection/PendingTasksSectionConnected'
import { PostOnboardingTasksSection } from '../PostOnboardingTasksSection/PostOnboardingTasksSection'
import { SetupTaskSection } from '../SetupTasksSection/SetupTaskSection'

interface AiAgentTaskSectionProps {
    shopName: string
    shopType: string
    setIsAiAgentPostLive: (isAiAgentPostLive: boolean) => void
}

export const AiAgentTaskSection = ({
    shopName,
    shopType,
    setIsAiAgentPostLive,
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

    useEffect(() => {
        if (isLoading) return
        if (aiAgentPostOnboardingStepsEnabled && !isAiAgentLiveModeEnabled) {
            setIsAiAgentPostLive(false)
        } else {
            setIsAiAgentPostLive(true)
        }
    }, [
        isLoading,
        aiAgentPostOnboardingStepsEnabled,
        isAiAgentLiveModeEnabled,
        setIsAiAgentPostLive,
    ])

    if (isLoading) {
        return null
    }

    if (aiAgentPostOnboardingStepsEnabled && !isAiAgentLiveModeEnabled) {
        return <PostOnboardingTasksSection />
    }

    if (aiAgentPostStoreInstallationStepsEnabled) {
        return <SetupTaskSection shopName={shopName} shopType={shopType} />
    }
    // default to existing Task section for backward compatibility - it'll be removed when the new mode is fully enabled
    return <PendingTasksSectionConnected shopName={shopName} />
}
