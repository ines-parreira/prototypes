import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/constants'
import {getIntegrationsByTypes} from 'state/integrations/selectors'

export const useStoreIntegrationByShopName = (shopName: string) => {
    const storeIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ])
    )

    return useMemo(() => {
        return storeIntegrations.find(
            (storeIntegration) => storeIntegration.name === shopName
        )
    }, [storeIntegrations, shopName])
}
