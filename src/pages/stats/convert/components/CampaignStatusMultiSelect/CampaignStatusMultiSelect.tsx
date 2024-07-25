import React, {ComponentProps} from 'react'

import _upperFirst from 'lodash/upperFirst'
import {Value} from 'pages/common/forms/SelectField/types'

import SelectStatsFilter from 'pages/stats/common/SelectStatsFilter'
import {InferredCampaignStatus} from 'models/convert/campaign/types'

type Props = {
    selected: Value[]
    onChangeItem: ComponentProps<typeof SelectStatsFilter>['onChange']
}

export const CampaignStatusMultiSelect = ({selected, onChangeItem}: Props) => {
    return (
        <SelectStatsFilter
            plural="statuses"
            singular="status"
            onChange={onChangeItem}
            value={selected}
        >
            {Object.values(InferredCampaignStatus).map((status) => {
                return (
                    <SelectStatsFilter.Item
                        key={status}
                        label={_upperFirst(status)}
                        value={status}
                    />
                )
            })}
        </SelectStatsFilter>
    )
}
