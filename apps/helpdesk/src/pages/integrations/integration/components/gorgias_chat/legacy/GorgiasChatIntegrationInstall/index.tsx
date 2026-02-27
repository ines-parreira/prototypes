import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import GorgiasChatIntegrationInstallRevamp from '../../revamp/GorgiasChatIntegrationInstall/GorgiasChatIntegrationInstall'
import GorgiasChatIntegrationInstallLegacy from './GorgiasChatIntegrationInstall'

type Props = React.ComponentProps<typeof GorgiasChatIntegrationInstallLegacy>

function GorgiasChatIntegrationInstall(props: Props) {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const { shouldShowRevampWhenAiAgentEnabled } =
        useShouldShowChatSettingsRevamp(
            storeIntegration,
            props.integration.get('id'),
        )

    if (shouldShowRevampWhenAiAgentEnabled) {
        return <GorgiasChatIntegrationInstallRevamp {...props} />
    }
    return <GorgiasChatIntegrationInstallLegacy {...props} />
}

export default GorgiasChatIntegrationInstall
