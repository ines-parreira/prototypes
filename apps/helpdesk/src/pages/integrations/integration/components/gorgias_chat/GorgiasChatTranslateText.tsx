import type { Map } from 'immutable'

import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { ChatSettingsTranslateTextSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Language/TranslateText/components/ChatSettingsTranslateTextSkeleton'
import { GorgiasChatIntegrationTranslateTextRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Language/TranslateText/GorgiasChatIntegrationTranslateText'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import GorgiasTranslateText from './legacy/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText'

type Props = {
    integration: Map<string, unknown>
}

export const GorgiasChatTranslateText = ({ integration }: Props) => {
    const { storeIntegration } = useStoreIntegration(integration)
    const chatId = integration.get('id') as number | undefined
    const { shouldShowChatSettingsRevamp, isLoading } =
        useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    if (isLoading || !chatId) {
        return <ChatSettingsTranslateTextSkeleton />
    }

    if (shouldShowChatSettingsRevamp) {
        return (
            <GorgiasChatIntegrationTranslateTextRevamp
                integration={integration}
            />
        )
    }

    return <GorgiasTranslateText integration={integration} />
}
