import {Map} from 'immutable'

import {SelfServiceConfiguration} from '../../../models/selfServiceConfiguration/types'

export const hasShopifyIntegrationSSPEnabled = (
    shopifyIntegration: Map<any, any>,
    selfServiceConfigurations: SelfServiceConfiguration[]
): boolean => {
    const shopifyIntegationhasSSP = selfServiceConfigurations.find(
        (configuration) => {
            return (
                configuration.shop_name ===
                    shopifyIntegration.getIn(['meta', 'shop_name']) &&
                configuration.deactivated_datetime === null
            )
        }
    )

    return !!shopifyIntegationhasSSP
}
