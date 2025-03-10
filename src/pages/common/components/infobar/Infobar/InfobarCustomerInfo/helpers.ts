import { useMemo } from 'react'

import { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import { makeHasIntegrationOfTypes } from 'state/integrations/selectors'

export function useShouldShowProfileSync(
    shopifyCustomerProfileCreationFeatureEnabled: boolean,
    isEditing: boolean,
    customerIntegrationsData: Map<any, any>,
) {
    const hasIntegrationsOfTypes = useAppSelector(makeHasIntegrationOfTypes)
    const hasShopifyIntegration = hasIntegrationsOfTypes(
        IntegrationType.Shopify,
    )

    return useMemo(() => {
        if (
            !shopifyCustomerProfileCreationFeatureEnabled ||
            !hasShopifyIntegration ||
            isEditing
        ) {
            return false
        }

        return customerIntegrationsData?.size === 0
    }, [
        shopifyCustomerProfileCreationFeatureEnabled,
        isEditing,
        customerIntegrationsData,
        hasShopifyIntegration,
    ])
}
