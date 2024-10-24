import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {useListCampaigns} from 'models/convert/campaign/queries'
import {
    CampaignListOptions as CampaignListOptionsParams,
    CampaignPreview,
} from 'models/convert/campaign/types'
import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import {getCampaignStatus} from 'pages/stats/convert/utils/getCampaignStatus'
import {getBusinessHoursSettings} from 'state/currentAccount/selectors'
import {getIntegrationsByType} from 'state/integrations/selectors'

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
    const businessHoursSettings = useAppSelector(getBusinessHoursSettings)
    const timezone = businessHoursSettings?.data?.timezone ?? DEFAULT_TIMEZONE

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

    const campaigns: CampaignPreview[] = useMemo(() => {
        return (convertCampaigns || []).map((campaign) => {
            return {
                ...campaign,
                status: getCampaignStatus(campaign, timezone),
            } as CampaignPreview
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [convertCampaigns])

    return {
        campaigns,
        channelConnectionExternalIds:
            campaignListOptions.channelConnectionExternalIds,
    }
}
