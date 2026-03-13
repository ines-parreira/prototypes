import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import type { StoreIntegration } from 'models/integration/types'

import { useIsAiAgentEnabled } from './useIsAiAgentEnabled'

export const useShouldShowChatSettingsRevamp = (
    storeIntegration?: StoreIntegration,
    chatId?: number,
) => {
    const {
        value: isChatSettingsRevampEnabled,
        isLoading: isRevampFlagLoading,
    } = useFlagWithLoading(FeatureFlagKey.ChatSettingsRevamp)

    const {
        value: isChatSettingsScreensRevampEnabled,
        isLoading: isScreensRevampFlagLoading,
    } = useFlagWithLoading(FeatureFlagKey.ChatSettingsScreensRevamp)

    const { isAiAgentEnabled, isLoading: isAiAgentLoading } =
        useIsAiAgentEnabled(storeIntegration, chatId)

    // ChatSettingsRevamp flag only — used for features that don't require the screens revamp
    const shouldShowRevampWhenAiAgentEnabled =
        isChatSettingsRevampEnabled && isAiAgentEnabled

    // Both flags required — used for features that belong to the full screens revamp
    const shouldShowScreensRevampWhenAiAgentEnabled =
        isChatSettingsRevampEnabled &&
        isChatSettingsScreensRevampEnabled &&
        isAiAgentEnabled

    return {
        shouldShowRevampWhenAiAgentEnabled,
        shouldShowScreensRevampWhenAiAgentEnabled,
        isLoading:
            isRevampFlagLoading ||
            isScreensRevampFlagLoading ||
            isAiAgentLoading,
    }
}
