import type { ComponentProps } from 'react'

import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { ChatSettingsLanguagesSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Language/ChatSettingsLanguagesSkeleton'
import { GorgiasChatIntegrationLanguagesRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Language/GorgiasChatIntegrationLanguages'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import GorgiasChatIntegrationLanguagesLegacy from './legacy/GorgiasChatIntegrationLanguages/GorgiasChatIntegrationLanguages'

type Props = ComponentProps<typeof GorgiasChatIntegrationLanguagesLegacy>

export const GorgiasChatIntegrationLanguages = (props: Props) => {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id') as number | undefined

    const { shouldShowChatSettingsRevamp, isLoading } =
        useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    if (isLoading || !chatId) {
        return <ChatSettingsLanguagesSkeleton />
    }

    if (shouldShowChatSettingsRevamp) {
        return <GorgiasChatIntegrationLanguagesRevamp {...props} />
    }

    return <GorgiasChatIntegrationLanguagesLegacy {...props} />
}
