import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import GorgiasChatIntegrationInstallLegacy from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/GorgiasChatIntegrationInstall'
import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'
import { GorgiasChatIntegrationInstallRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall'
import GorgiasChatIntegrationInstallOldRevamp from 'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/GorgiasChatIntegrationInstall'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

type Props = React.ComponentProps<typeof GorgiasChatIntegrationInstallLegacy>

export const GorgiasChatIntegrationInstall = (props: Props) => {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const { shouldShowRevampWhenAiAgentEnabled } =
        useShouldShowChatSettingsRevamp(
            storeIntegration,
            props.integration.get('id'),
        )
    const isScreensRevampEnabled = useFlag(
        FeatureFlagKey.ChatSettingsScreensRevamp,
    )

    if (isScreensRevampEnabled && shouldShowRevampWhenAiAgentEnabled) {
        return <GorgiasChatIntegrationInstallRevamp {...props} />
    }
    if (shouldShowRevampWhenAiAgentEnabled) {
        return <GorgiasChatIntegrationInstallOldRevamp {...props} />
    }
    return <GorgiasChatIntegrationInstallLegacy {...props} />
}
