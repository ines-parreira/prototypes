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

export const campaignsStatsFilterLabels = {
    plural: 'campaigns',
    singular: 'campaign',
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
                (accumulator, currentIntegration) =>
                    accumulator.concat(currentIntegration),
                []
            )
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
            {...campaignsStatsFilterLabels}
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
