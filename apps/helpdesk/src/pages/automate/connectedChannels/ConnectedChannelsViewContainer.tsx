import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import {
    ChatSettingsRevampConnectedChannelsContext,
    useChatSettingsRevampConnectedChannels,
} from 'pages/automate/connectedChannels/revamp/hooks/useChatSettingsRevampConnectedChannels'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import LegacyConnectedChannelsViewContainer from './legacy/ConnectedChannelsViewContainer'
import { ConnectedChannelsViewContainerRevamp } from './revamp/ConnectedChannelsViewContainer'

export const ConnectedChannelsViewContainer = () => {
    const { selectedChannelId, setSelectedChannelId, shopName } =
        useChatSettingsRevampConnectedChannels()

    const storeIntegrations = useStoreIntegrations()
    const storeIntegration = storeIntegrations.find(
        (integration) =>
            getShopNameFromStoreIntegration(integration) === shopName,
    )

    const { shouldShowFlowsScreensRevamp } = useShouldShowChatSettingsRevamp(
        storeIntegration,
        selectedChannelId,
    )

    return (
        <ChatSettingsRevampConnectedChannelsContext.Provider
            value={{ selectedChannelId, setSelectedChannelId }}
        >
            {shouldShowFlowsScreensRevamp ? (
                <ConnectedChannelsViewContainerRevamp />
            ) : (
                <LegacyConnectedChannelsViewContainer />
            )}
        </ChatSettingsRevampConnectedChannelsContext.Provider>
    )
}
