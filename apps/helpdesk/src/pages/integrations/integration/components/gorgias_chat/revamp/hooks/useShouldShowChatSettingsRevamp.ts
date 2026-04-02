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

    const {
        value: isChatSettingsScreensRevampChatSettingsEnabled,
        isLoading: isChatSettingsScreensRevampChatSettingsLoading,
    } = useFlagWithLoading(FeatureFlagKey.ChatSettingsScreensRevampChatSettings)

    const {
        value: isChatSettingsScreensRevampFlowsEnabled,
        isLoading: isChatSettingsScreensRevampFlowsLoading,
    } = useFlagWithLoading(FeatureFlagKey.ChatSettingsScreensRevampFlows)

    const {
        value: isChatSettingsScreensRevampOrderManagementEnabled,
        isLoading: isChatSettingsScreensRevampOrderManagementLoading,
    } = useFlagWithLoading(
        FeatureFlagKey.ChatSettingsScreensRevampOrderManagement,
    )

    const { isAiAgentEnabled, isLoading: isAiAgentLoading } =
        useIsAiAgentEnabled(storeIntegration, chatId)

    // ChatSettingsRevamp flag only — used for features that don't require the screens revamp
    const shouldShowRevampWhenAiAgentEnabled =
        isChatSettingsRevampEnabled && isAiAgentEnabled

    // Both base flags required — used for features that belong to the full screens revamp
    const shouldShowScreensRevampWhenAiAgentEnabled =
        isChatSettingsRevampEnabled &&
        isChatSettingsScreensRevampEnabled &&
        isAiAgentEnabled

    // Section-specific flags — each adds an independent rollout gate on top of the base flags
    const shouldShowChatSettingsScreensRevamp =
        shouldShowScreensRevampWhenAiAgentEnabled &&
        isChatSettingsScreensRevampChatSettingsEnabled

    const shouldShowFlowsScreensRevamp =
        shouldShowScreensRevampWhenAiAgentEnabled &&
        isChatSettingsScreensRevampFlowsEnabled

    const shouldShowOrderManagementScreensRevamp =
        shouldShowScreensRevampWhenAiAgentEnabled &&
        isChatSettingsScreensRevampOrderManagementEnabled

    return {
        isChatSettingsRevampEnabled,
        isChatSettingsScreensRevampEnabled,
        isChatSettingsScreensRevampChatSettingsEnabled,
        isChatSettingsScreensRevampFlowsEnabled,
        isChatSettingsScreensRevampOrderManagementEnabled,
        shouldShowRevampWhenAiAgentEnabled,
        shouldShowScreensRevampWhenAiAgentEnabled,
        shouldShowChatSettingsScreensRevamp,
        shouldShowFlowsScreensRevamp,
        shouldShowOrderManagementScreensRevamp,
        isLoading:
            isRevampFlagLoading ||
            isScreensRevampFlagLoading ||
            isChatSettingsScreensRevampChatSettingsLoading ||
            isChatSettingsScreensRevampFlowsLoading ||
            isChatSettingsScreensRevampOrderManagementLoading ||
            isAiAgentLoading,
    }
}
