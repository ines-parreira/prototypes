import React, {ComponentProps} from 'react'

import {Campaign} from 'models/integration/types'

import {Value} from 'pages/common/forms/SelectField/types'

import SelectStatsFilter from 'pages/stats/common/SelectStatsFilter'

type Props = {
    campaigns: Campaign[]
    selected: Value[]
    onChangeItem: ComponentProps<typeof SelectStatsFilter>['onChange']
}

export const CampaignMultiSelect = ({
    campaigns,
    selected,
    onChangeItem,
}: Props) => {
    return (
        <SelectStatsFilter
            plural="campaigns"
            singular="campaign"
            onChange={onChangeItem}
            value={selected}
        >
            {campaigns.map((campaign) => {
                return (
                    <SelectStatsFilter.Item
                        key={campaign.id}
                        label={campaign.name}
                        value={campaign.id}
                    />
                )
            })}
        </SelectStatsFilter>
    )
}
