import { useMemo } from 'react'

import { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import { makeHasIntegrationOfTypes } from 'state/integrations/selectors'

export function useShouldShowProfileSync(
    shopifyCustomerProfileCreationFeatureEnabled: boolean,
    isEditing: boolean,
    customerIntegrationsData: Map<string, Map<string, string>>,
) {
    const hasIntegrationsOfTypes = useAppSelector(makeHasIntegrationOfTypes)
    const hasShopifyIntegration = hasIntegrationsOfTypes(
        IntegrationType.Shopify,
    )

    const hasShopifyIntegrationData = useMemo(() => {
        return customerIntegrationsData?.some(
            (value) => value?.get('__integration_type__') === 'shopify',
        )
    }, [customerIntegrationsData])

    return useMemo(() => {
        return (
            shopifyCustomerProfileCreationFeatureEnabled &&
            hasShopifyIntegration &&
            !hasShopifyIntegrationData &&
            !isEditing
        )
    }, [
        shopifyCustomerProfileCreationFeatureEnabled,
        isEditing,
        hasShopifyIntegration,
        hasShopifyIntegrationData,
    ])
}

export function getPhoneNumberFromActiveCustomer(
    activeCustomer?: Map<any, any>,
) {
    const phoneIntegration = activeCustomer
        ?.get('channels')
        ?.find(
            (channel: Map<any, any>) =>
                channel?.get('type') === IntegrationType.Phone,
        )
    return phoneIntegration?.get('address') || ''
}
