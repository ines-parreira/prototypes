import {useMemo} from 'react'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {IntegrationType, ShopifyIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'

const useShopifyIntegrations = () => {
    const getShopifyIntegrations = useMemo(
        () =>
            getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify),
        []
    )

    return useAppSelector(getShopifyIntegrations)
}

export default useShopifyIntegrations
