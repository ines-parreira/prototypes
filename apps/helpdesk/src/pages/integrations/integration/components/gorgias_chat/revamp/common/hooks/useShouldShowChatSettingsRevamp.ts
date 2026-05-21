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
        value: isChatSettingsScreensRevampFlowsEnabled,
        isLoading: isChatSettingsScreensRevampFlowsLoading,
    } = useFlagWithLoading(FeatureFlagKey.ChatSettingsScreensRevampFlows)

    const {
        value: isChatSettingsScreensRevampOrderManagementEnabled,
        isLoading: isChatSettingsScreensRevampOrderManagementLoading,
    } = useFlagWithLoading(
        FeatureFlagKey.ChatSettingsScreensRevampOrderManagement,
    )

    const {
        value: isNonAiAgentChat2RevampEnabled,
        isLoading: isNonAiAgentChat2RevampLoading,
    } = useFlagWithLoading(FeatureFlagKey.NonAiAgentChat2Revamp)

    const { isAiAgentEnabled, isLoading: isAiAgentLoading } =
        useIsAiAgentEnabled(storeIntegration, chatId)

    const shouldShowRevampWhenAiAgentEnabled =
        isChatSettingsRevampEnabled && isAiAgentEnabled

    // Gates the Chat 2.0 revamp for non-AI agent customers, independent of the AI agent rollout
    const shouldShowRevampForNonAiAgent =
        isChatSettingsRevampEnabled &&
        isNonAiAgentChat2RevampEnabled &&
        !isAiAgentEnabled

    // Section-specific flags — each adds an independent rollout gate on top of the base flag
    const shouldShowFlowsScreensRevamp =
        shouldShowRevampWhenAiAgentEnabled &&
        isChatSettingsScreensRevampFlowsEnabled

    const shouldShowOrderManagementScreensRevamp =
        shouldShowRevampWhenAiAgentEnabled &&
        isChatSettingsScreensRevampOrderManagementEnabled

    return {
        isChatSettingsRevampEnabled,
        isChatSettingsScreensRevampFlowsEnabled,
        isChatSettingsScreensRevampOrderManagementEnabled,
        isNonAiAgentChat2RevampEnabled,
        shouldShowRevampWhenAiAgentEnabled,
        shouldShowRevampForNonAiAgent,
        shouldShowFlowsScreensRevamp,
        shouldShowOrderManagementScreensRevamp,
        isLoading:
            isRevampFlagLoading ||
            isChatSettingsScreensRevampFlowsLoading ||
            isChatSettingsScreensRevampOrderManagementLoading ||
            isNonAiAgentChat2RevampLoading ||
            isAiAgentLoading,
    }
}
