import { useMemo } from 'react'

import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { get, memoize, throttle } from 'lodash'

import { queryKeys, useGetCustomer } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
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

export type UseWidgetDataValue = List<Map<string, unknown>>
export type UseWidgetDataParams = {
    source: Map<string, unknown>
    path: string[]
}

//
//   Hook used for switching the widget data source from redux to RQ,
//   when rendering `customer.integrations` widget path
//
//   This allows us to gradually move off of the redux store for these states, but more importantly:
//   it allows us to not need `customer.integrations` inside of socket.io `customer-updated` events
//   which is causing issues due to payload size and frequency
//

export const CUSTOMER_DATA_STALE_TIME_MS = 60 * 60 * 1000 // 60 minutes
export const CUSTOMER_DATA_CACHE_TIME_MS = 61 * 60 * 1000 // 61 minutes

export function useWidgetData({
    source,
    path,
}: UseWidgetDataParams): UseWidgetDataValue {
    const customerId =
        source.getIn(['customer', 'id']) ??
        source.getIn(['ticket', 'customer', 'id']) ??
        0
    const { data } = useGetCustomer(
        customerId,
        {},
        {
            query: {
                enabled: customerId !== 0,
                staleTime: CUSTOMER_DATA_STALE_TIME_MS,
                cacheTime: CUSTOMER_DATA_CACHE_TIME_MS,
            },
        },
    )

    if (
        path.join('.').endsWith('customer.integrations') &&
        customerId &&
        data?.data
    ) {
        return fromJS(get(data?.data, 'integrations'))
    }

    return source.getIn(path, fromJS([]))
}

//
//   throttled trigger for cache invalidation on GET /customer/{id} endpoint;
//   only used in the socket.io event handler,
//   and should probably be removed once we refactor the widget data source

export function throttledUpdateCustomerCache(id: number) {
    getThrottledUpdateForCustomer(id)()
}

export const getThrottledUpdateForCustomer = memoize((id: number) =>
    throttle(
        () => {
            void appQueryClient.invalidateQueries({
                queryKey: queryKeys.customers.getCustomer(id),
            })
        },
        5_000,
        { leading: true },
    ),
)
