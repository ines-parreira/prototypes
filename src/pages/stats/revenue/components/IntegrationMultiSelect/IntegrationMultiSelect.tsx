import React, {ComponentProps} from 'react'

import {Integration} from 'models/integration/types'

import {Value} from 'pages/common/forms/SelectField/types'
import shopifyIcon from 'assets/img/integrations/shopify.png'

import SelectFilter from '../../../common/SelectFilter'

import css from './IntegrationMultiSelect.less'

type Props = {
    integrations: Integration[]
    selected: Value[]
    onChangeItem: ComponentProps<typeof SelectFilter>['onChange']
}

export const IntegrationMultiSelect = ({
    integrations,
    selected,
    onChangeItem,
}: Props) => {
    return (
        <SelectFilter
            plural="integrations"
            singular="integration"
            onChange={onChangeItem}
            value={selected}
        >
            {integrations.map((integration) => {
                return (
                    <SelectFilter.Item
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
        </SelectFilter>
    )
}
