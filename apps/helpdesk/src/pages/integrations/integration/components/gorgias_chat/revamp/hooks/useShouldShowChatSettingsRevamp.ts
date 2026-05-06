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

    const shouldShowRevampWhenAiAgentEnabled =
        isChatSettingsRevampEnabled && isAiAgentEnabled

    // Section-specific flags — each adds an independent rollout gate on top of the base flag
    const shouldShowChatSettingsScreensRevamp =
        shouldShowRevampWhenAiAgentEnabled &&
        isChatSettingsScreensRevampChatSettingsEnabled

    const shouldShowFlowsScreensRevamp =
        shouldShowRevampWhenAiAgentEnabled &&
        isChatSettingsScreensRevampFlowsEnabled

    const shouldShowOrderManagementScreensRevamp =
        shouldShowRevampWhenAiAgentEnabled &&
        isChatSettingsScreensRevampOrderManagementEnabled

    return {
        isChatSettingsRevampEnabled,
        isChatSettingsScreensRevampChatSettingsEnabled,
        isChatSettingsScreensRevampFlowsEnabled,
        isChatSettingsScreensRevampOrderManagementEnabled,
        shouldShowRevampWhenAiAgentEnabled,
        shouldShowChatSettingsScreensRevamp,
        shouldShowFlowsScreensRevamp,
        shouldShowOrderManagementScreensRevamp,
        isLoading:
            isRevampFlagLoading ||
            isChatSettingsScreensRevampChatSettingsLoading ||
            isChatSettingsScreensRevampFlowsLoading ||
            isChatSettingsScreensRevampOrderManagementLoading ||
            isAiAgentLoading,
    }
}
