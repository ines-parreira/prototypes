import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { IntegrationDataItem } from 'models/integration/types/misc'

import { fetchEcommerceItemByExternalId } from './resources'

export const ecommerceKeys = {
    all: () => ['ecommerce'] as const,
    details: () => ['ecommerce'] as const,
    detail: (
        objectType: string,
        sourceType: string,
        integrationId: number,
        externalId: string,
    ) =>
        [
            ...ecommerceKeys.details(),
            objectType,
            sourceType,
            integrationId,
            externalId,
        ] as const,
}

/**
 * Hook for fetching any ecommerce item by externalId
 * @param objectType - The type of object to fetch (e.g., 'product', 'order')
 * @param sourceType - The source type (e.g., 'shopify')
 * @param integrationId - The integration ID
 * @param externalId - The external ID of the item
 * @param overrides
 * @returns The requested item data and query state
 */
export const useGetEcommerceItemByExternalId = <
    T,
    TData = IntegrationDataItem<T>,
>(
    objectType: string,
    sourceType: string,
    integrationId: number,
    externalId: string,
    overrides?: UseQueryOptions<IntegrationDataItem<T>, AxiosError, TData>,
) => {
    return useQuery({
        queryKey: ecommerceKeys.detail(
            objectType,
            sourceType,
            integrationId,
            externalId,
        ),
        queryFn: async () => {
            const response = await fetchEcommerceItemByExternalId<T>(
                objectType,
                sourceType,
                integrationId,
                externalId,
            )
            return response.data
        },
        ...overrides,
    })
}
