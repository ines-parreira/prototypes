import React from 'react'

import { LegacyStatsFilters } from 'models/stat/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { Value } from 'pages/common/forms/SelectField/types'
import SelectFilter from 'pages/stats/common/SelectFilter'
import css from 'pages/stats/self-service/DEPRECATED_SelfServiceIntegrationsFilter.less'
import { getIconFromType } from 'state/integrations/helpers'

type Props = {
    value: LegacyStatsFilters['integrations']
    onChange: (value: LegacyStatsFilters['integrations']) => void
}
/**
 * @deprecated
 * @date 2023-08-28
 * @type feature-component
 */
const DEPRECATED_SelfServiceIntegrationsFilter = ({
    value = [],
    onChange,
}: Props) => {
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

export default DEPRECATED_SelfServiceIntegrationsFilter
