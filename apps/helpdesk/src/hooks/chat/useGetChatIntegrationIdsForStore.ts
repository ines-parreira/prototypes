import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatIntegration,
    IntegrationType,
} from 'models/integration/types'
import { getIntegrationsByType } from 'state/integrations/selectors'

const CHAT_CHANNEL = 'chat'
export const useGetChatIntegrationIdsForStore = ({
    shopName,
}: {
    shopName: string
}) => {
    const chatIntegrations = useAppSelector(
        getIntegrationsByType<GorgiasChatIntegration>(
            IntegrationType.GorgiasChat,
        ),
    )

    const chats = useMemo(
        () =>
            chatIntegrations
                .filter(
                    (integration) =>
                        integration.meta?.shop_name === shopName &&
                        integration.meta?.shop_type === IntegrationType.Shopify,
                )
                .filter(Boolean)
                .map((integration) => {
                    return {
                        id: integration?.id,
                        channel: CHAT_CHANNEL,
                    }
                }),
        [shopName, chatIntegrations],
    )

    return chats
}
