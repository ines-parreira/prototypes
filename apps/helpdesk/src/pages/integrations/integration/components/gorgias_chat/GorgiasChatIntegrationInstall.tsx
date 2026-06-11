import { GorgiasChatIntegrationInstall as GorgiasChatIntegrationInstallLegacy } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/GorgiasChatIntegrationInstall'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { ChatSettingsInstallationSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Installation/ChatSettingsInstallationSkeleton'
import { GorgiasChatIntegrationInstallRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Installation/GorgiasChatIntegrationInstall'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

type Props = React.ComponentProps<typeof GorgiasChatIntegrationInstallLegacy>

export const GorgiasChatIntegrationInstall = (props: Props) => {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id') as number | undefined

    const { shouldShowChatSettingsRevamp, isLoading } =
        useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    if (isLoading || !chatId) {
        return <ChatSettingsInstallationSkeleton />
    }

    if (shouldShowChatSettingsRevamp) {
        return <GorgiasChatIntegrationInstallRevamp {...props} />
    }
    return <GorgiasChatIntegrationInstallLegacy {...props} />
}
