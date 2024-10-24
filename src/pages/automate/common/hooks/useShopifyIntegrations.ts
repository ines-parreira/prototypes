import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType, ShopifyIntegration} from 'models/integration/types'
import {getIntegrationsByType} from 'state/integrations/selectors'

const useShopifyIntegrations = () => {
    const getShopifyIntegrations = useMemo(
        () =>
            getIntegrationsByType<ShopifyIntegration>(IntegrationType.Shopify),
        []
    )

    return useAppSelector(getShopifyIntegrations)
}

export default useShopifyIntegrations
