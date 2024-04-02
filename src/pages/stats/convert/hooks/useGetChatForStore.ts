import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {getIntegrationsByType} from 'state/integrations/selectors'

import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'

export function useGetChatForStore(shopIntegrationId: number) {
    const chatIntegrations = useAppSelector(
        getIntegrationsByType<GorgiasChatIntegration>(
            IntegrationType.GorgiasChat
        )
    )

    return useMemo(() => {
        // Find installed chat integration by shop integration id
        const chatIntegration = chatIntegrations.find((integration) =>
            (integration.meta?.shopify_integration_ids || []).includes(
                shopIntegrationId
            )
        )

        if (!chatIntegration) {
            // Return first chat integration linked to store
            return chatIntegrations.find(
                (integration) =>
                    integration.meta?.shop_integration_id === shopIntegrationId
            )
        }

        return chatIntegration
    }, [chatIntegrations, shopIntegrationId])
}
