import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import shopify from 'assets/img/integrations/shopify.png'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import {getSelfServiceConfigurations} from 'state/entities/selfServiceConfigurations/selectors'
import {Value} from 'pages/common/forms/SelectField/types'
import {StatsFilters} from 'models/stat/types'

import SelectFilter from '../common/SelectFilter'

import {ShopifyIntegration} from '../../../models/integration/types'
import css from './SelfServiceIntegrationsFilter.less'
import {hasShopifyIntegrationSSPEnabled} from './self-service-stats.utils'

type Props = {
    value: StatsFilters['integrations']
    onChange: (value: StatsFilters['integrations']) => void
}

const SelfServiceIntegrationsFilter = ({value = [], onChange}: Props) => {
    const shopifyIntegrations = useAppSelector(
        getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify)
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
            {shopifyIntegrations.map((shopifyIntegration) => {
                const selfServiceDeactivated = !hasShopifyIntegrationSSPEnabled(
                    shopifyIntegration,
                    selfServiceConfigurations
                )
                return (
                    <SelectFilter.Item
                        key={shopifyIntegration.id}
                        label={
                            selfServiceDeactivated
                                ? `${shopifyIntegration.name} (deactivated)`
                                : shopifyIntegration.name
                        }
                        value={shopifyIntegration.id}
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
