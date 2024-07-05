import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {getIntegrationsByType} from 'state/integrations/selectors'

import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import {CampaignListOptions as CampaignListOptionsParams} from 'models/convert/campaign/types'
import {useListCampaigns} from 'models/convert/campaign/queries'

export function useGetCampaignsForStore(
    selectedIntegrations: number[],
    chatAppId?: string,
    includeDeleted = false
) {
    const getChatIntegrations = useMemo(
        () =>
            getIntegrationsByType<GorgiasChatIntegration>(
                IntegrationType.GorgiasChat
            ),
        []
    )
    const chatIntegrations = useAppSelector(getChatIntegrations)

    const campaignListOptions = useMemo(() => {
        let chatAppIds: string[]
        if (chatAppId) {
            chatAppIds = [chatAppId]
        } else {
            chatAppIds = chatIntegrations
                .filter(
                    (integration) =>
                        selectedIntegrations.includes(
                            integration.meta?.shop_integration_id || 0
                        ) && !!integration.meta?.app_id
                )
                .map((integration) => integration.meta?.app_id) as string[]
        }

        return {
            channelConnectionExternalIds: chatAppIds,
            deleted: includeDeleted,
        } as CampaignListOptionsParams
    }, [chatAppId, includeDeleted, chatIntegrations, selectedIntegrations])

    const {data: convertCampaigns} = useListCampaigns(campaignListOptions, {
        enabled:
            !!campaignListOptions.channelConnectionExternalIds &&
            campaignListOptions.channelConnectionExternalIds?.length > 0,
    })

    return useMemo(() => {
        return !!campaignListOptions && !!convertCampaigns
            ? convertCampaigns
            : []
    }, [campaignListOptions, convertCampaigns])
}
