import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useChatPreviewChannelsContext } from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import LegacyConnectedChannelsViewContainer from './legacy/ConnectedChannelsViewContainer'
import { ConnectedChannelsViewContainerRevamp } from './revamp/ConnectedChannelsViewContainer'

export const ConnectedChannelsViewContainer = () => {
    const { shopName, selectedChannelId } = useChatPreviewChannelsContext()

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
