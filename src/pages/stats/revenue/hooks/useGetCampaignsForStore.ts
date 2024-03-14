import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {getIntegrationsByType} from 'state/integrations/selectors'

import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import {getSortByName} from 'utils/getSortByName'
import {CampaignListOptions as CampaignListOptionsParams} from 'models/convert/campaign/types'
import {useIsConvertUiDecouplingEnabled} from 'pages/convert/common/hooks/useIsConvertUiDecouplingEnabled'
import {useListCampaigns} from 'models/convert/campaign/queries'

export function useGetCampaignsForStore(selectedIntegrations: number[]) {
    const getChatIntegrations = useMemo(
        () =>
            getIntegrationsByType<GorgiasChatIntegration>(
                IntegrationType.GorgiasChat
            ),
        []
    )
    const chatIntegrations = useAppSelector(getChatIntegrations)

    const isConvertUiDecouplingEnabled = useIsConvertUiDecouplingEnabled()

    const campaignListOptions = useMemo(() => {
        const chatAppIds = chatIntegrations
            .filter(
                (integration) =>
                    selectedIntegrations.includes(
                        integration.meta?.shop_integration_id || 0
                    ) && !!integration.meta?.app_id
            )
            .map((integration) => integration.meta?.app_id)

        return {
            channelConnectionExternalIds: chatAppIds,
        } as CampaignListOptionsParams
    }, [chatIntegrations, selectedIntegrations])

    const {data: convertCampaigns} = useListCampaigns(campaignListOptions, {
        enabled:
            !!campaignListOptions.channelConnectionExternalIds &&
            campaignListOptions.channelConnectionExternalIds?.length > 0 &&
            isConvertUiDecouplingEnabled,
    })

    return useMemo(() => {
        if (isConvertUiDecouplingEnabled) {
            return !!campaignListOptions && !!convertCampaigns
                ? convertCampaigns
                : []
        }

        return chatIntegrations
            .filter((integration) => {
                const selected = selectedIntegrations || []
                const linked = integration.meta?.shop_integration_id
                return selected.some(
                    (selected_value) => selected_value === linked
                )
            })
            .map((integration) => integration.meta?.campaigns || [])
            .reduce(
                (acc, currentIntegration) => acc.concat(currentIntegration),
                []
            )
            .sort(getSortByName)
    }, [
        isConvertUiDecouplingEnabled,
        chatIntegrations,
        campaignListOptions,
        convertCampaigns,
        selectedIntegrations,
    ])
}
