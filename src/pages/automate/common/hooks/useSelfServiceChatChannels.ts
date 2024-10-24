import {useMemo} from 'react'

import {TicketChannel} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType, GorgiasChatIntegration} from 'models/integration/types'
import {getIntegrationsByType} from 'state/integrations/selectors'

import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'

export type SelfServiceChatChannel = {
    type: TicketChannel.Chat
    value: GorgiasChatIntegration
}

const useSelfServiceChatChannels = (shopType: string, shopName: string) => {
    const getChatIntegrations = useMemo(
        () =>
            getIntegrationsByType<GorgiasChatIntegration>(
                IntegrationType.GorgiasChat
            ),
        []
    )
    const chatIntegrations = useAppSelector(getChatIntegrations)
    const storeIntegration = useSelfServiceStoreIntegration(shopType, shopName)
    const storeIntegrationId = storeIntegration?.id

    return useMemo<SelfServiceChatChannel[]>(
        () =>
            chatIntegrations
                .filter(
                    (integration) =>
                        integration.meta.shop_integration_id ===
                        storeIntegrationId
                )
                .map((integration) => ({
                    type: TicketChannel.Chat,
                    value: integration,
                })),
        [chatIntegrations, storeIntegrationId]
    )
}

export default useSelfServiceChatChannels
