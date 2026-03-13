import type { ComponentProps } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { ChatSettingsPreferencesSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationPreferences/ChatSettingsPreferencesSkeleton'
import { GorgiasChatIntegrationPreferencesRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationPreferences'
import { useIsAiAgentEnabled } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useIsAiAgentEnabled'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import GorgiasChatIntegrationPreferencesLegacy from './legacy/GorgiasChatIntegrationPreferences/GorgiasChatIntegrationPreferences'

type Props = ComponentProps<typeof GorgiasChatIntegrationPreferencesLegacy>

export const GorgiasChatIntegrationPreferences = (props: Props) => {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id') as number | undefined

    const {
        shouldShowScreensRevampWhenAiAgentEnabled,
        isLoading: isRevampLoading,
    } = useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    const { isAiAgentEnabled } = useIsAiAgentEnabled(storeIntegration, chatId)

    const integrationsLoading = useAppSelector((state) =>
        state.integrations.getIn(['state', 'loading']),
    )

    if (isRevampLoading) {
        return <ChatSettingsPreferencesSkeleton />
    }

    if (shouldShowScreensRevampWhenAiAgentEnabled) {
        return (
            <GorgiasChatIntegrationPreferencesRevamp
                {...props}
                loading={integrationsLoading}
                isAiAgentEnabled={isAiAgentEnabled}
            />
        )
    }

    return <GorgiasChatIntegrationPreferencesLegacy {...props} />
}
