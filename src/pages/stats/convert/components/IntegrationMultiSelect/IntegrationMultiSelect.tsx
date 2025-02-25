import React, { ComponentProps } from 'react'

import shopifyIcon from 'assets/img/integrations/shopify.png'
import { Integration } from 'models/integration/types'
import { Value } from 'pages/common/forms/SelectField/types'
import SelectStatsFilter from 'pages/stats/common/SelectStatsFilter'

import css from './IntegrationMultiSelect.less'

type Props = {
    integrations: Integration[]
    selected: Value[]
    isMultiple?: boolean
    isRequired?: boolean
    onChangeItem: ComponentProps<typeof SelectStatsFilter>['onChange']
}

export const IntegrationMultiSelect = ({
    integrations,
    selected,
    isMultiple = false,
    isRequired = false,
    onChangeItem,
}: Props) => {
    return (
        <SelectStatsFilter
            plural="integrations"
            singular="integration"
            isMultiple={isMultiple}
            isRequired={isRequired}
            onChange={onChangeItem}
            value={selected}
        >
            {integrations.map((integration) => {
                return (
                    <SelectStatsFilter.Item
                        key={integration.id}
                        icon={
                            <img
                                src={shopifyIcon}
                                alt={`logo-${integration.type}`}
                                className={css.integrationIcon}
                            />
                        }
                        label={integration.name}
                        value={integration.id}
                    />
                )
            })}
        </SelectStatsFilter>
    )
}
