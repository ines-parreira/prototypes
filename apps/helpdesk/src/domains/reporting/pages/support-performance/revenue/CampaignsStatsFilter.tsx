import type { ComponentProps } from 'react'
import { useCallback } from 'react'

import type { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import SelectFilter from 'domains/reporting/pages/common/SelectFilter'
import { useGetCampaignsForStore } from 'domains/reporting/pages/convert/hooks/useGetCampaignsForStore'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'

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

    const { campaigns } = useGetCampaignsForStore(selectedIntegrations || [])

    const handleFilterChange: ComponentProps<typeof SelectFilter>['onChange'] =
        useCallback(
            (values) => {
                dispatch(mergeStatsFilters({ campaigns: values as string[] }))
            },
            [dispatch],
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
