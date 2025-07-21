import React, { ComponentProps } from 'react'

import SelectStatsFilter from 'domains/reporting/pages/common/SelectStatsFilter'
import { CampaignPreview } from 'models/convert/campaign/types'
import { Value } from 'pages/common/forms/SelectField/types'

type Props = {
    campaigns: CampaignPreview[]
    selected: Value[]
    onChangeItem: ComponentProps<typeof SelectStatsFilter>['onChange']
}
/**
 * @deprecated
 * @date 2023-08-21
 * @type feature-component
 */
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
