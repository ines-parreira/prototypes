import type { ComponentProps } from 'react'
import React from 'react'

import shopifyIcon from 'assets/img/integrations/shopify.png'
import SelectStatsFilter from 'domains/reporting/pages/common/SelectStatsFilter'
import css from 'domains/reporting/pages/convert/components/IntegrationMultiSelect/IntegrationMultiSelect.less'
import type { Integration } from 'models/integration/types'
import type { Value } from 'pages/common/forms/SelectField/types'

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
