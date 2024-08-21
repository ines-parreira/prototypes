import React, {ComponentProps} from 'react'

import {Value} from 'pages/common/forms/SelectField/types'

import SelectStatsFilter from 'pages/stats/common/SelectStatsFilter'
import {CampaignPreview} from 'models/convert/campaign/types'

type Props = {
    campaigns: CampaignPreview[]
    selected: Value[]
    onChangeItem: ComponentProps<typeof SelectStatsFilter>['onChange']
}

export const DEPRECATED_CampaignMultiSelect = ({
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
