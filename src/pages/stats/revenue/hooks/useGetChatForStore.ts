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
        return chatIntegrations.find((integration) => {
            return integration.meta?.shop_integration_id === shopIntegrationId
        })
    }, [chatIntegrations, shopIntegrationId])
}
