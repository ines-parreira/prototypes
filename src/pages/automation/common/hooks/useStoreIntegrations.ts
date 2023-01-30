import {useMemo} from 'react'

import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {
    IntegrationType,
    ShopifyIntegration,
    Magento2Integration,
    BigCommerceIntegration,
} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'

const useStoreIntegrations = () => {
    const getStoreIntegrations = useMemo(
        () =>
            getIntegrationsByTypes([
                IntegrationType.Shopify,
                IntegrationType.BigCommerce,
                IntegrationType.Magento2,
            ]),
        []
    )

    return useAppSelector(getStoreIntegrations) as (
        | ShopifyIntegration
        | Magento2Integration
        | BigCommerceIntegration
    )[]
}

export default useStoreIntegrations
