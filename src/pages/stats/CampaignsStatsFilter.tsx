import React, {ComponentProps, useCallback, useMemo} from 'react'

import {mergeStatsFilters} from 'state/stats/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {StatsFilters} from 'models/stat/types'

import {getIntegrationsByType} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import {GorgiasChatIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import SelectFilter from './common/SelectFilter'

type Props = {
    value: StatsFilters['campaigns']
    selectedIntegrations: StatsFilters['integrations']
}

export default function CampaignsStatsFilter({
    value = [],
    selectedIntegrations,
}: Props) {
    const dispatch = useAppDispatch()

    const chatIntegrations = useAppSelector(
        getIntegrationsByType<GorgiasChatIntegration>(
            IntegrationType.GorgiasChat
        )
    )

    const campaigns = useMemo(() => {
        const chatIntegration = chatIntegrations.find((integration) => {
            const selected = selectedIntegrations || []
            const linked = integration.meta?.shopify_integration_ids || []

            return selected.some(function (selected_value) {
                return linked.some(function (linked_value) {
                    return selected_value === parseInt(linked_value)
                })
            })
        })

        return chatIntegration ? chatIntegration.meta?.campaigns : []
    }, [selectedIntegrations, chatIntegrations])

    const handleFilterChange: ComponentProps<typeof SelectFilter>['onChange'] =
        useCallback(
            (values) => {
                dispatch(mergeStatsFilters({campaigns: values as string[]}))
            },
            [dispatch]
        )

    return (
        <SelectFilter
            plural="campaigns"
            singular="campaign"
            onChange={handleFilterChange}
            value={value}
        >
            {(campaigns || []).map((campaign) => (
                <SelectFilter.Item
                    key={campaign.id}
                    label={campaign.name}
                    value={campaign.id}
                />
            ))}
        </SelectFilter>
    )
}
