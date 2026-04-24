import { useContext } from 'react'

import { useParams } from 'react-router-dom'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { ChatPreviewChannelsContext } from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import LegacyConnectedChannelsViewContainer from './legacy/ConnectedChannelsViewContainer'
import { ConnectedChannelsViewContainerRevamp } from './revamp/ConnectedChannelsViewContainer'

export const ConnectedChannelsViewContainer = () => {
    const chatPreviewContext = useContext(ChatPreviewChannelsContext)
    const { shopName: shopNameFromParams } = useParams<{ shopName: string }>()
    const shopName = chatPreviewContext?.shopName ?? shopNameFromParams
    const selectedChannelId = chatPreviewContext?.selectedChannelId

    const storeIntegrations = useStoreIntegrations()
    const storeIntegration = storeIntegrations.find(
        (integration) =>
            getShopNameFromStoreIntegration(integration) === shopName,
    )

    const { shouldShowFlowsScreensRevamp } = useShouldShowChatSettingsRevamp(
        storeIntegration,
        selectedChannelId,
    )

    if (shouldShowFlowsScreensRevamp) {
        return <ConnectedChannelsViewContainerRevamp />
    }

    return <LegacyConnectedChannelsViewContainer />
}
