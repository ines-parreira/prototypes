import React from 'react'
import {Map} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import shopify from 'assets/img/integrations/shopify.png'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import {getSelfServiceConfigurations} from 'state/entities/selfServiceConfigurations/selectors'
import {Value} from 'pages/common/forms/SelectField/types'
import {StatsFilters} from 'models/stat/types'

import SelectFilter from '../common/SelectFilter'

import css from './SelfServiceIntegrationsFilter.less'
import {hasShopifyIntegrationSSPEnabled} from './self-service-stats.utils'

type Props = {
    value: StatsFilters['integrations']
    onChange: (value: StatsFilters['integrations']) => void
}

const SelfServiceIntegrationsFilter = ({value = [], onChange}: Props) => {
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.Shopify)
    )
    const selfServiceConfigurations = useAppSelector(
        getSelfServiceConfigurations
    )

    return (
        <SelectFilter
            plural="stores"
            singular="store"
            onChange={onChange as (value: Value[]) => void}
            value={value}
        >
            {shopifyIntegrations.map((shopifyIntegration: Map<any, any>) => {
                const selfServiceDeactivated = !hasShopifyIntegrationSSPEnabled(
                    shopifyIntegration,
                    selfServiceConfigurations
                )
                return (
                    <SelectFilter.Item
                        key={shopifyIntegration.get('id')}
                        label={
                            selfServiceDeactivated
                                ? `${
                                      shopifyIntegration.get('name') as string
                                  } (deactivated)`
                                : shopifyIntegration.get('name')
                        }
                        value={shopifyIntegration.get('id')}
                        icon={
                            <img
                                src={shopify}
                                alt="logo-shopify"
                                className={css.integrationIcon}
                            />
                        }
                    />
                )
            })}
        </SelectFilter>
    )
}

export default SelfServiceIntegrationsFilter
