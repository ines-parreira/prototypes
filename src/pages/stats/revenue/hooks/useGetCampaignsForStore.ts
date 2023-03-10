import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {getIntegrationsByType} from 'state/integrations/selectors'

import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'

export function useGetCampaignsForStore(selectedIntegrations: number[]) {
    const chatIntegrations = useAppSelector(
        getIntegrationsByType<GorgiasChatIntegration>(
            IntegrationType.GorgiasChat
        )
    )

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
    }, [selectedIntegrations, chatIntegrations])

    return campaigns
}
