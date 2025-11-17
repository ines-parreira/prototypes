import { useMemo } from 'react'

import type { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import { makeHasIntegrationOfTypes } from 'state/integrations/selectors'

export function useShouldShowProfileSync(
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
        return hasShopifyIntegration && !hasShopifyIntegrationData && !isEditing
    }, [isEditing, hasShopifyIntegration, hasShopifyIntegrationData])
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

export function getDefaultAddressInfoFromActiveCustomer(
    activeCustomer: Map<any, any>,
    storeIntegration: number,
) {
    const normalizedCustomer = activeCustomer.toJS()

    const defaultAddress =
        normalizedCustomer?.integrations?.[storeIntegration]?.customer
            ?.default_address
    return {
        country: defaultAddress?.country ?? 'United States',
        countryCode: defaultAddress?.country_code || 'US',
        company: defaultAddress?.company || '',
        address: defaultAddress?.address1 || '',
        apartment: defaultAddress?.address2 || '',
        city: defaultAddress?.city || '',
        stateOrProvince: defaultAddress?.province || '',
        postalCode: defaultAddress?.zip || '',
        defaultAddressPhone: defaultAddress?.phone || '',
    }
}
