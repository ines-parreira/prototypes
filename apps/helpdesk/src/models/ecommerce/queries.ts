import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { ApiPaginationParams } from 'models/api/types'
import { IntegrationDataItem } from 'models/integration/types/misc'

import {
    fetchEcommerceItemByExternalId,
    fetchEcommerceLookupValues,
    fetchEcommerceProducts,
} from './resources'

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
    lookupValues: (
        type: string,
        integrationId: number,
        params: EcommerceLookupValuesParams,
    ) => [...ecommerceKeys.all(), type, integrationId, params] as const,
    products: (integrationId: number, params: EcommerceProductsParams) =>
        [...ecommerceKeys.all(), integrationId, params] as const,
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

type EcommerceLookupValuesParams = ApiPaginationParams & { value?: string }

export const useGetEcommerceLookupValues = (
    type: 'product_tag' | 'vendor',
    integrationId: number,
    params: EcommerceLookupValuesParams = {},
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof fetchEcommerceLookupValues>>['data']
    >,
) => {
    return useQuery({
        queryKey: ecommerceKeys.lookupValues(type, integrationId, params),
        queryFn: async () => {
            const response = await fetchEcommerceLookupValues(
                type,
                integrationId,
                params,
            )
            return response.data
        },
        ...overrides,
    })
}

type EcommerceProductsParams = ApiPaginationParams & {
    data_tags?: string
    data_vendor?: string
    data_product_type?: string
}

export const useGetEcommerceProducts = (
    integrationId: number,
    params: EcommerceProductsParams = {},
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof fetchEcommerceProducts>>['data']
    >,
) => {
    return useQuery({
        queryKey: ecommerceKeys.products(integrationId, params),
        queryFn: async () => {
            const response = await fetchEcommerceProducts(integrationId, params)
            return response.data
        },
        ...overrides,
    })
}
