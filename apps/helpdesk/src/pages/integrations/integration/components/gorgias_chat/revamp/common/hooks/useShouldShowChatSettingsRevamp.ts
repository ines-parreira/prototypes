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

    // Shows the chat settings revamp UI for non-AI-agent customers
    // gated behind the NonAiAgentChat2Revamp flag (Chat 2.0 migration).
    const shouldShowNonAiAgentChatSettingsRevamp =
        !isAiAgentEnabled && isNonAiAgentChat2RevampEnabled

    // Shows the chat settings revamp UI for AI-agent customers, or for non-AI-agent
    // customers gated behind the NonAiAgentChat2Revamp flag (Chat 2.0 migration).
    const shouldShowChatSettingsRevamp =
        isChatSettingsRevampEnabled &&
        (isAiAgentEnabled || shouldShowNonAiAgentChatSettingsRevamp)

    const shouldShowNonAiAgentRevamp =
        isChatSettingsRevampEnabled &&
        isNonAiAgentChat2RevampEnabled &&
        !isAiAgentEnabled

    // Section-specific flags — each adds an independent rollout gate on top of the base flag
    const shouldShowFlowsScreensRevamp =
        shouldShowChatSettingsRevamp && isChatSettingsScreensRevampFlowsEnabled

    const shouldShowOrderManagementScreensRevamp =
        shouldShowChatSettingsRevamp &&
        isChatSettingsScreensRevampOrderManagementEnabled

    return {
        isChatSettingsRevampEnabled,
        isChatSettingsScreensRevampFlowsEnabled,
        isChatSettingsScreensRevampOrderManagementEnabled,
        isNonAiAgentChat2RevampEnabled,
        shouldShowChatSettingsRevamp,
        shouldShowNonAiAgentChatSettingsRevamp,
        shouldShowFlowsScreensRevamp,
        shouldShowOrderManagementScreensRevamp,
        shouldShowNonAiAgentRevamp,
        isLoading:
            isRevampFlagLoading ||
            isChatSettingsScreensRevampFlowsLoading ||
            isChatSettingsScreensRevampOrderManagementLoading ||
            isNonAiAgentChat2RevampLoading ||
            isAiAgentLoading,
    }
}
