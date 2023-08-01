import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {getIntegrationsByType} from 'state/integrations/selectors'

import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import {getSortByName} from 'utils/getSortByName'

export function useGetCampaignsForStore(selectedIntegrations: number[]) {
    const getChatIntegrations = useMemo(
        () =>
            getIntegrationsByType<GorgiasChatIntegration>(
                IntegrationType.GorgiasChat
            ),
        []
    )
    const chatIntegrations = useAppSelector(getChatIntegrations)

    const campaigns = useMemo(() => {
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
    }, [selectedIntegrations, chatIntegrations])

    return campaigns
}
