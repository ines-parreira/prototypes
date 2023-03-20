import {useMemo} from 'react'

import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {
    IntegrationType,
    ShopifyIntegration,
    Magento2Integration,
    BigCommerceIntegration,
} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'

type StoreIntegration =
    | ShopifyIntegration
    | Magento2Integration
    | BigCommerceIntegration

const useStoreIntegrations = () => {
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const getStoreIntegrations = useMemo(
        () =>
            getIntegrationsByTypes(
                hasAutomationAddOn
                    ? [
                          IntegrationType.Shopify,
                          IntegrationType.BigCommerce,
                          IntegrationType.Magento2,
                      ]
                    : [IntegrationType.Shopify]
            ),
        [hasAutomationAddOn]
    )

    return useAppSelector(getStoreIntegrations) as StoreIntegration[]
}

export default useStoreIntegrations
