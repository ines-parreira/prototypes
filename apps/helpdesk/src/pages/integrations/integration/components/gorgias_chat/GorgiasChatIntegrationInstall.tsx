import GorgiasChatIntegrationInstallLegacy from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/GorgiasChatIntegrationInstall'
import { GorgiasChatIntegrationInstallRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall'
import { ChatSettingsInstallationSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/ChatSettingsInstallationSkeleton'
import GorgiasChatIntegrationInstallOldRevamp from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/GorgiasChatIntegrationInstall'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

type Props = React.ComponentProps<typeof GorgiasChatIntegrationInstallLegacy>

export const GorgiasChatIntegrationInstall = (props: Props) => {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id') as number | undefined

    const {
        shouldShowRevampWhenAiAgentEnabled,
        shouldShowScreensRevampWhenAiAgentEnabled,
        isLoading,
    } = useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    if (isLoading || !chatId) {
        return <ChatSettingsInstallationSkeleton />
    }

    if (shouldShowScreensRevampWhenAiAgentEnabled) {
        return <GorgiasChatIntegrationInstallRevamp {...props} />
    }
    if (shouldShowRevampWhenAiAgentEnabled) {
        return <GorgiasChatIntegrationInstallOldRevamp {...props} />
    }
    return <GorgiasChatIntegrationInstallLegacy {...props} />
}
