import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType, StoreIntegration } from 'models/integration/types'
import { getHasAutomate } from 'state/billing/selectors'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

const useStoreIntegrations = (types?: IntegrationType[]) => {
    const hasAutomate = useAppSelector(getHasAutomate)

    const getStoreIntegrations = useMemo(
        () =>
            getIntegrationsByTypes(
                types
                    ? types
                    : hasAutomate
                      ? [
                            IntegrationType.Shopify,
                            IntegrationType.BigCommerce,
                            IntegrationType.Magento2,
                        ]
                      : [IntegrationType.Shopify],
            ),
        [types, hasAutomate],
    )

    return useAppSelector(getStoreIntegrations) as StoreIntegration[]
}

export default useStoreIntegrations
