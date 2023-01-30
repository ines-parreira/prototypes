import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType, GorgiasChatIntegration} from 'models/integration/types'
import {getIntegrationsByType} from 'state/integrations/selectors'

import useSelfServiceStoreIntegration from './useSelfServiceStoreIntegration'

const useSelfServiceChatIntegrations = (shopType: string, shopName: string) => {
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

    return useMemo(
        () =>
            chatIntegrations.filter(
                (chatIntegration) =>
                    chatIntegration.meta.shop_integration_id ===
                    storeIntegrationId
            ),
        [chatIntegrations, storeIntegrationId]
    )
}

export default useSelfServiceChatIntegrations
