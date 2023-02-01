import {useMemo} from 'react'

import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {
    IntegrationType,
    ShopifyIntegration,
    Magento2Integration,
    BigCommerceIntegration,
} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'

type StoreIntegration =
    | ShopifyIntegration
    | Magento2Integration
    | BigCommerceIntegration

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

    return useAppSelector(getStoreIntegrations) as StoreIntegration[]
}

export default useStoreIntegrations
