import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

export const useStoreIntegrationById = (storeIntegrationId: number) => {
    const storeIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
    )

    return useMemo(() => {
        return storeIntegrations.find(({ id }) => id === storeIntegrationId)
    }, [storeIntegrations, storeIntegrationId])
}
