import type { Map } from 'immutable'

import { ChatSettingsTranslateTextSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationTranslateText/components/ChatSettingsTranslateTextSkeleton'
import { GorgiasChatIntegrationTranslateTextRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationTranslateText/GorgiasChatIntegrationTranslateText'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import GorgiasTranslateText from './legacy/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText'

type Props = {
    integration: Map<string, unknown>
}

export const GorgiasChatTranslateText = ({ integration }: Props) => {
    const { storeIntegration } = useStoreIntegration(integration)
    const chatId = integration.get('id') as number | undefined
    const { shouldShowRevampWhenAiAgentEnabled, isLoading } =
        useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    if (isLoading || !chatId) {
        return <ChatSettingsTranslateTextSkeleton />
    }

    if (shouldShowRevampWhenAiAgentEnabled) {
        return (
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={integration}
            />
        )
    }

    return <GorgiasTranslateText integration={integration} />
}
