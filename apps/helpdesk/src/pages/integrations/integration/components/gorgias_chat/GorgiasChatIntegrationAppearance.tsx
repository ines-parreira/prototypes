import GorgiasChatIntegrationAppearanceLegacy from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance'
import GorgiasChatIntegrationAppearanceRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/revamp/GorgiasChatIntegrationAppearance'
import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'
import { ChatSettingsAppearanceSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/ChatSettingsAppearanceSkeleton'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

type Props = React.ComponentProps<typeof GorgiasChatIntegrationAppearanceLegacy>

export const GorgiasChatIntegrationAppearance = (props: Props) => {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id')
    const { shouldShowRevampWhenAiAgentEnabled, isLoading } =
        useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    if (isLoading || !chatId) {
        return <ChatSettingsAppearanceSkeleton />
    }

    if (shouldShowRevampWhenAiAgentEnabled) {
        return <GorgiasChatIntegrationAppearanceRevamp {...props} />
    }
    return <GorgiasChatIntegrationAppearanceLegacy {...props} />
}
