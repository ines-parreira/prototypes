import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import GorgiasChatIntegrationAppearanceLegacy from './GorgiasChatIntegrationAppearance'
import GorgiasChatIntegrationAppearanceRevamp from './revamp/GorgiasChatIntegrationAppearance'

type Props = React.ComponentProps<typeof GorgiasChatIntegrationAppearanceLegacy>

function GorgiasChatIntegrationAppearance(props: Props) {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const { shouldShowRevampWhenAiAgentEnabled } =
        useShouldShowChatSettingsRevamp(
            storeIntegration,
            props.integration.get('id'),
        )

    if (shouldShowRevampWhenAiAgentEnabled) {
        return <GorgiasChatIntegrationAppearanceRevamp {...props} />
    }
    return <GorgiasChatIntegrationAppearanceLegacy {...props} />
}

export default GorgiasChatIntegrationAppearance
