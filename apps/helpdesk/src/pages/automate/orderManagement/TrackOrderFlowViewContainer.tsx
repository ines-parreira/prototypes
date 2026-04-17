import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useChatPreviewChannelsContext } from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import LegacyTrackOrderFlowViewContainer from './legacy/trackOrder/TrackOrderFlowViewContainer'
import { TrackOrderFlowViewContainerRevamp } from './revamp/trackOrder/TrackOrderFlowViewContainer'

export const TrackOrderFlowViewContainer = () => {
    const { shopName, selectedChannelId } = useChatPreviewChannelsContext()

    const storeIntegrations = useStoreIntegrations()
    const storeIntegration = storeIntegrations.find(
        (integration) =>
            getShopNameFromStoreIntegration(integration) === shopName,
    )

    const { shouldShowOrderManagementScreensRevamp } =
        useShouldShowChatSettingsRevamp(storeIntegration, selectedChannelId)

    if (shouldShowOrderManagementScreensRevamp) {
        return <TrackOrderFlowViewContainerRevamp />
    }

    return <LegacyTrackOrderFlowViewContainer />
}
