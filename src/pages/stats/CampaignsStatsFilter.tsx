import React, {ComponentProps, useCallback} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {LegacyStatsFilters} from 'models/stat/types'

import {useGetCampaignsForStore} from 'pages/stats/convert/hooks/useGetCampaignsForStore'
import {mergeStatsFilters} from 'state/stats/statsSlice'

import SelectFilter from './common/SelectFilter'

type Props = {
    value: LegacyStatsFilters['campaigns']
    selectedIntegrations: LegacyStatsFilters['integrations']
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

    const {campaigns} = useGetCampaignsForStore(selectedIntegrations || [])

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
            {campaigns.map((campaign) => (
                <SelectFilter.Item
                    key={campaign.id}
                    label={campaign.name}
                    value={campaign.id}
                />
            ))}
        </SelectFilter>
    )
}
