import React from 'react'
import {useSelector} from 'react-redux'
import {Map} from 'immutable'

import shopify from 'assets/img/integrations/shopify.png'

import {getIntegrationsByTypes} from '../../../state/integrations/selectors'
import {IntegrationType} from '../../../models/integration/constants'
import {getSelfServiceConfigurations} from '../../../state/entities/selfServiceConfigurations/selectors'
import {Value} from '../../common/forms/SelectField/types'
import SelectFilter from '../common/SelectFilter'

import css from './SelfServiceIntegrationsFilter.less'
import {hasShopifyIntegrationSSPEnabled} from './self-service-stats.utils'

type Props = {
    value: Value[]
    onChange: (value: Value[]) => void
}

const SelfServiceIntegrationsFilter = ({value, onChange}: Props) => {
    const shopifyIntegrations = useSelector(
        getIntegrationsByTypes(IntegrationType.Shopify)
    )
    const selfServiceConfigurations = useSelector(getSelfServiceConfigurations)

    return (
        <SelectFilter
            plural="stores"
            singular="store"
            onChange={onChange}
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
