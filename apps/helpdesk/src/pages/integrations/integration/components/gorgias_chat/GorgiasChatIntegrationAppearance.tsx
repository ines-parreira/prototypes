import useAppSelector from 'hooks/useAppSelector'
import GorgiasChatIntegrationAppearanceLegacy from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance'
import GorgiasChatIntegrationAppearanceLegacyRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/revamp/GorgiasChatIntegrationAppearance'
import { ChatSettingsAppearanceSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/ChatSettingsAppearanceSkeleton'
import { GorgiasChatIntegrationAppearanceRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationAppearance'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

type Props = React.ComponentProps<typeof GorgiasChatIntegrationAppearanceLegacy>

export const GorgiasChatIntegrationAppearance = (props: Props) => {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id') as number | undefined

    const {
        shouldShowRevampWhenAiAgentEnabled,
        shouldShowScreensRevampWhenAiAgentEnabled,
        isLoading: isRevampLoading,
    } = useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    const integrationsLoading = useAppSelector((state) =>
        state.integrations.getIn(['state', 'loading']),
    )

    if (isRevampLoading || !chatId) {
        return <ChatSettingsAppearanceSkeleton />
    }

    if (shouldShowScreensRevampWhenAiAgentEnabled) {
        return (
            <GorgiasChatIntegrationAppearanceRevamp
                {...props}
                loading={integrationsLoading}
            />
        )
    }
    if (shouldShowRevampWhenAiAgentEnabled) {
        return <GorgiasChatIntegrationAppearanceLegacyRevamp {...props} />
    }
    return <GorgiasChatIntegrationAppearanceLegacy {...props} />
}
