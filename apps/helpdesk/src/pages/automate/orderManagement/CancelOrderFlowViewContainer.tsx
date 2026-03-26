import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'
import { getGorgiasChatIntegrationsByStoreName } from 'state/integrations/selectors'

import LegacyCancelOrderFlowViewContainer from './legacy/cancelOrder/CancelOrderFlowViewContainer'
import { CancelOrderFlowViewContainerRevamp } from './revamp/cancelOrder/CancelOrderFlowViewContainer'

export const CancelOrderFlowViewContainer = () => {
    const { shopName } = useParams<{ shopName: string }>()

    const storeIntegrations = useStoreIntegrations()
    const storeIntegration = storeIntegrations.find(
        (integration) =>
            getShopNameFromStoreIntegration(integration) === shopName,
    )

    const chatIntegration = useAppSelector(
        getGorgiasChatIntegrationsByStoreName(shopName ?? ''),
    )
    const chatId = chatIntegration?.id

    const { shouldShowScreensRevampWhenAiAgentEnabled } =
        useShouldShowChatSettingsRevamp(storeIntegration, chatId)

    if (shouldShowScreensRevampWhenAiAgentEnabled) {
        return <CancelOrderFlowViewContainerRevamp />
    }

    return <LegacyCancelOrderFlowViewContainer />
}
