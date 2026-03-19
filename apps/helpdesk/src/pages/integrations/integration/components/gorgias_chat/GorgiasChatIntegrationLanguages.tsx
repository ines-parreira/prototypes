import type { ComponentProps } from 'react'

import { ChatSettingsLanguagesSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationLanguages/ChatSettingsLanguagesSkeleton'
import { GorgiasChatIntegrationLanguagesRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationLanguages'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import GorgiasChatIntegrationLanguagesLegacy from './legacy/GorgiasChatIntegrationLanguages/GorgiasChatIntegrationLanguages'

type Props = ComponentProps<typeof GorgiasChatIntegrationLanguagesLegacy>

export const GorgiasChatIntegrationLanguages = (props: Props) => {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id') as number | undefined

    const { shouldShowScreensRevampWhenAiAgentEnabled, isLoading } =
        useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    if (isLoading || !chatId) {
        return <ChatSettingsLanguagesSkeleton />
    }

    if (shouldShowScreensRevampWhenAiAgentEnabled) {
        return <GorgiasChatIntegrationLanguagesRevamp {...props} />
    }

    return <GorgiasChatIntegrationLanguagesLegacy {...props} />
}
