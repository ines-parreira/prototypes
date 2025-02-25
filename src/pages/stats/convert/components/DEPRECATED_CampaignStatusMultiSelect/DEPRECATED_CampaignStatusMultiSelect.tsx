import React, { ComponentProps } from 'react'

import _upperFirst from 'lodash/upperFirst'

import { InferredCampaignStatus } from 'models/convert/campaign/types'
import { Value } from 'pages/common/forms/SelectField/types'
import SelectStatsFilter from 'pages/stats/common/SelectStatsFilter'

type Props = {
    selected: Value[]
    onChangeItem: ComponentProps<typeof SelectStatsFilter>['onChange']
}
/**
 * @deprecated
 * @date 2023-08-08
 * @type feature-component
 */
export const DEPRECATED_CampaignStatusMultiSelect = ({
    selected,
    onChangeItem,
}: Props) => {
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
