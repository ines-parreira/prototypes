import React, {ComponentProps} from 'react'

import {Campaign} from 'models/integration/types'

import {Value} from 'pages/common/forms/SelectField/types'

import SelectFilter from '../../../common/SelectFilter'

type Props = {
    campaigns: Campaign[]
    selected: Value[]
    onChangeItem: ComponentProps<typeof SelectFilter>['onChange']
}

export const CampaignMultiSelect = ({
    campaigns,
    selected,
    onChangeItem,
}: Props) => {
    return (
        <SelectFilter
            plural="campaigns"
            singular="campaign"
            onChange={onChangeItem}
            value={selected}
        >
            {campaigns.map((campaign) => {
                return (
                    <SelectFilter.Item
                        key={campaign.id}
                        label={campaign.name}
                        value={campaign.id}
                    />
                )
            })}
        </SelectFilter>
    )
}
