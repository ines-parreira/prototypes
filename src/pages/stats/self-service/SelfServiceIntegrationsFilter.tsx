import React from 'react'

import {Value} from 'pages/common/forms/SelectField/types'
import {StatsFilters} from 'models/stat/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import {getIconFromType} from 'state/integrations/helpers'

import SelectFilter from '../common/SelectFilter'

import css from './SelfServiceIntegrationsFilter.less'

type Props = {
    value: StatsFilters['integrations']
    onChange: (value: StatsFilters['integrations']) => void
}

const SelfServiceIntegrationsFilter = ({value = [], onChange}: Props) => {
    const storeIntegrations = useStoreIntegrations()

    return (
        <SelectFilter
            plural="stores"
            singular="store"
            onChange={onChange as (value: Value[]) => void}
            value={value}
        >
            {storeIntegrations.map((storeIntegration) => (
                <SelectFilter.Item
                    key={storeIntegration.id}
                    label={storeIntegration.name}
                    value={storeIntegration.id}
                    icon={
                        <img
                            src={getIconFromType(storeIntegration.type)}
                            alt="logo"
                            className={css.integrationIcon}
                        />
                    }
                />
            ))}
        </SelectFilter>
    )
}

export default SelfServiceIntegrationsFilter
