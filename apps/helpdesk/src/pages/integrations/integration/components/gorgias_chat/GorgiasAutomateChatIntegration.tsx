import type { ComponentProps } from 'react'

import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasAutomateChatIntegration as GorgiasAutomateChatIntegrationLegacy } from './legacy/GorgiasAutomateChatIntegration'
import { ChatSettingsAutomationSkeleton } from './revamp/ChatSettingsAutomationSkeleton'
import { GorgiasAutomateChatIntegrationRevamp } from './revamp/GorgiasAutomateChatIntegration'

type Props = ComponentProps<typeof GorgiasAutomateChatIntegrationLegacy>

export function GorgiasAutomateChatIntegration(props: Props) {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id') as number | undefined

    const {
        shouldShowScreensRevampWhenAiAgentEnabled,
        isLoading: isRevampLoading,
    } = useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    if (isRevampLoading || !chatId) {
        return <ChatSettingsAutomationSkeleton />
    }

    if (shouldShowScreensRevampWhenAiAgentEnabled) {
        return <GorgiasAutomateChatIntegrationRevamp {...props} />
    }

    return <GorgiasAutomateChatIntegrationLegacy {...props} />
}
