import type { ComponentProps } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasAutomateChatIntegration as GorgiasAutomateChatIntegrationLegacy } from './legacy/GorgiasAutomateChatIntegration'
import { ChatSettingsAutomationSkeleton } from './revamp/ChatSettingsAutomationSkeleton'
import { GorgiasAutomateChatIntegrationRevamp } from './revamp/GorgiasAutomateChatIntegration'

type Props = ComponentProps<typeof GorgiasAutomateChatIntegrationLegacy>

export function GorgiasAutomateChatIntegration(props: Props) {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id')

    const {
        shouldShowRevampWhenAiAgentEnabled,
        isLoading: isStoreConfigLoading,
    } = useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    const { value: isScreensRevampEnabled, isLoading: isFlagLoading } =
        useFlagWithLoading(FeatureFlagKey.ChatSettingsScreensRevamp)

    if (isFlagLoading || isStoreConfigLoading || !chatId) {
        return <ChatSettingsAutomationSkeleton />
    }

    if (isScreensRevampEnabled && shouldShowRevampWhenAiAgentEnabled) {
        return <GorgiasAutomateChatIntegrationRevamp {...props} />
    }

    // For now, both cases without screen revamp show Legacy
    // Eventually shouldShowRevampWhenAiAgentEnabled case will show Revamp stable version
    if (shouldShowRevampWhenAiAgentEnabled) {
        return <GorgiasAutomateChatIntegrationLegacy {...props} />
    }

    return <GorgiasAutomateChatIntegrationLegacy {...props} />
}
