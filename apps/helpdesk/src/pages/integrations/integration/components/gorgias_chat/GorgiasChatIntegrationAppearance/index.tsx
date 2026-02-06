import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/hooks/useShouldShowChatSettingsRevamp'

import GorgiasChatIntegrationAppearanceLegacy from './GorgiasChatIntegrationAppearance'
import GorgiasChatIntegrationAppearanceRevamp from './revamp/GorgiasChatIntegrationAppearance'

type Props = React.ComponentProps<typeof GorgiasChatIntegrationAppearanceLegacy>

function GorgiasChatIntegrationAppearance(props: Props) {
    const { shouldShowRevamp } = useShouldShowChatSettingsRevamp(undefined)

    if (shouldShowRevamp) {
        return <GorgiasChatIntegrationAppearanceRevamp {...props} />
    }
    return <GorgiasChatIntegrationAppearanceLegacy {...props} />
}

export default GorgiasChatIntegrationAppearance
