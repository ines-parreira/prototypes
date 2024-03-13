import {useMemo} from 'react'

import _first from 'lodash/first'
import useAppSelector from 'hooks/useAppSelector'

import {getIntegrationsByType} from 'state/integrations/selectors'

import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import {getSortByName} from 'utils/getSortByName'
import {CampaignListOptions as CampaignListOptionsParams} from 'models/convert/campaign/types'
import {useIsConvertUiDecouplingEnabled} from 'pages/convert/common/hooks/useIsConvertUiDecouplingEnabled'
import {useListCampaigns} from 'models/convert/campaign/queries'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {useGetChatForStore} from './useGetChatForStore'

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
    const chatIntegration = useGetChatForStore(
        _first(selectedIntegrations) || 0
    )
    const {channelConnection} = useGetOrCreateChannelConnection(chatIntegration)
    const campaignListOptions = useMemo(() => {
        return (
            !!channelConnection?.id
                ? {
                      channelConnectionId: channelConnection?.id,
                  }
                : {}
        ) as CampaignListOptionsParams
    }, [channelConnection])

    const {data: convertCampaigns} = useListCampaigns(campaignListOptions, {
        enabled: !!campaignListOptions && isConvertUiDecouplingEnabled,
    })

    return useMemo(() => {
        if (isConvertUiDecouplingEnabled) {
            return convertCampaigns || []
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
        convertCampaigns,
        selectedIntegrations,
    ])
}
