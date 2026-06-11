import { useParams } from 'react-router-dom'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useStoreIntegrations } from 'pages/automate/common/hooks/useStoreIntegrations'
import { useConnectedChannelsContext } from 'pages/automate/connectedChannels/ConnectedChannelsContext'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'

import { ConnectedChannelsViewContainer as LegacyConnectedChannelsViewContainer } from './legacy/ConnectedChannelsViewContainer'
import { ConnectedChannelsViewContainerRevamp } from './revamp/ConnectedChannelsViewContainer'

export const ConnectedChannelsViewContainer = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const { channel } = useConnectedChannelsContext()

    const storeIntegrations = useStoreIntegrations()
    const storeIntegration = storeIntegrations.find(
        (integration) =>
            getShopNameFromStoreIntegration(integration) === shopName,
    )

    const { shouldShowFlowsScreensRevamp } = useShouldShowChatSettingsRevamp(
        storeIntegration,
        channel?.value.id,
    )

    if (shouldShowFlowsScreensRevamp) {
        return <ConnectedChannelsViewContainerRevamp />
    }

    return <LegacyConnectedChannelsViewContainer />
}
