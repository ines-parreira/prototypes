import type { ComponentProps } from 'react'

import { useAppSelector } from 'hooks/useAppSelector'
import { useIsAiAgentEnabled } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useIsAiAgentEnabled'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { ChatSettingsPreferencesSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Preferences/ChatSettingsPreferencesSkeleton'
import { GorgiasChatIntegrationPreferencesRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Preferences/GorgiasChatIntegrationPreferences'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import { GorgiasChatIntegrationPreferencesWrapper as GorgiasChatIntegrationPreferencesLegacy } from './legacy/GorgiasChatIntegrationPreferences/GorgiasChatIntegrationPreferences'

type Props = ComponentProps<typeof GorgiasChatIntegrationPreferencesLegacy>

export const GorgiasChatIntegrationPreferences = (props: Props) => {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id') as number | undefined

    const {
        shouldShowChatSettingsRevamp,
        shouldShowLegacyChatCustomization,
        isLoading: isRevampLoading,
    } = useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    const { isAiAgentEnabled } = useIsAiAgentEnabled(storeIntegration, chatId)

    const integrationsLoading = useAppSelector((state) =>
        state.integrations.getIn(['state', 'loading']),
    )

    if (isRevampLoading || !chatId) {
        return <ChatSettingsPreferencesSkeleton />
    }

    if (shouldShowChatSettingsRevamp) {
        return (
            <GorgiasChatIntegrationPreferencesRevamp
                {...props}
                loading={integrationsLoading}
                isAiAgentEnabled={isAiAgentEnabled}
                shouldShowLegacyChatCustomization={
                    shouldShowLegacyChatCustomization
                }
            />
        )
    }

    return <GorgiasChatIntegrationPreferencesLegacy {...props} />
}
