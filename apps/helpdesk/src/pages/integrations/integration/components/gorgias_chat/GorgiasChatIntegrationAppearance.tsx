import useAppSelector from 'hooks/useAppSelector'
import GorgiasChatIntegrationAppearanceLegacy from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { ChatSettingsAppearanceSkeleton } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/ChatSettingsAppearanceSkeleton'
import { GorgiasChatIntegrationAppearanceRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Appearance/GorgiasChatIntegrationAppearance'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

type Props = React.ComponentProps<typeof GorgiasChatIntegrationAppearanceLegacy>

export const GorgiasChatIntegrationAppearance = (props: Props) => {
    const { storeIntegration } = useStoreIntegration(props.integration)
    const chatId = props.integration.get('id') as number | undefined

    const { shouldShowRevampWhenAiAgentEnabled, isLoading: isRevampLoading } =
        useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    const integrationsLoading = useAppSelector((state) =>
        state.integrations.getIn(['state', 'loading']),
    )

    if (isRevampLoading || !chatId) {
        return <ChatSettingsAppearanceSkeleton />
    }

    if (shouldShowRevampWhenAiAgentEnabled) {
        return (
            <GorgiasChatIntegrationAppearanceRevamp
                {...props}
                loading={integrationsLoading}
            />
        )
    }
    return <GorgiasChatIntegrationAppearanceLegacy {...props} />
}
