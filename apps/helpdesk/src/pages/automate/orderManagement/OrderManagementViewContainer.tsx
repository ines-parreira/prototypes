import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { useChatPreviewChannelsContext } from 'pages/automate/connectedChannels/revamp/hooks/useChatPreviewChannels'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useShouldShowChatSettingsRevamp'

import LegacyOrderManagementView from './legacy/OrderManagementView'
import { OrderManagementViewRevamp } from './revamp/OrderManagementView'

export const OrderManagementViewContainer = () => {
    const { shopName, selectedChannelId } = useChatPreviewChannelsContext()

    const storeIntegrations = useStoreIntegrations()
    const storeIntegration = storeIntegrations.find(
        (integration) =>
            getShopNameFromStoreIntegration(integration) === shopName,
    )

    const { shouldShowOrderManagementScreensRevamp } =
        useShouldShowChatSettingsRevamp(storeIntegration, selectedChannelId)

    if (shouldShowOrderManagementScreensRevamp) {
        return <OrderManagementViewRevamp />
    }

    return <LegacyOrderManagementView />
}
