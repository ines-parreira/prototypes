import { useEffect } from 'react'

import { reportError } from '@repo/logging'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query'

import { INTEGRATION_DATA_ITEM_TYPE_PRODUCT } from 'constants/integration'
import type { Product } from 'constants/integrations/types/shopify'
import { handleError } from 'hooks/agents/errorHandler'
import useAppDispatch from 'hooks/useAppDispatch'
import client from 'models/api/resources'
import type { ApiListResponse } from 'models/api/types'
import { fetchIntegrationProducts } from 'models/integration/resources'
import GorgiasApi from 'services/gorgiasApi'
import {
    getApplications,
    getInstallationSnippet,
} from 'state/integrations/actions/gorgias-chat.actions'
import { fetchIntegrationProducts as fetchIntegrationProductsByIds } from 'state/integrations/helpers'

import {
    fetchCustomerSegments,
    fetchShopifyCollections,
    fetchShopTags,
} from './resources/shopify'
import type {
    GetInstallationSnippetParams,
    IntegrationDataItem,
    ShopifyTags,
} from './types'
import type { AppData, AppListData } from './types/app'

export const STALE_TIME_MS = 10 * 60 * 1000 // 10 minutes
export const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

export const getInstallationSnippetQueryKey = (
    params: GetInstallationSnippetParams,
) => ['integration', 'gorgias-chat', 'getInstallationSnippet', params]

export const useGetInstallationSnippet = (
    params: GetInstallationSnippetParams,
    overrides?: { enabled?: boolean; retry?: number },
) =>
    useQuery({
        queryKey: getInstallationSnippetQueryKey(params),
        queryFn: () => getInstallationSnippet(params),
        onError: () => {
            reportError(
                new Error('Failed to fetch chat installation snippet'),
                {
                    extra: params,
                },
            )
        },
        ...overrides,
    })

export const useApplications = () =>
    useQuery({
        queryKey: ['integration', 'gorgias-chat', 'getApplications'],
        queryFn: getApplications,
        onError: () => {
            reportError(new Error('Failed to fetch chat applications'))
        },
    })

export const useProductsFromShopifyIntegration = (
    integrationId: number,
    filter = '',
    enabled = true,
) => {
    return useQuery({
        queryKey: ['integration', 'shopify', integrationId, 'products', filter],
        queryFn: async () => {
            const gorgiasApi = new GorgiasApi()
            const results = await gorgiasApi.search(
                `/api/integrations/${integrationId}/${INTEGRATION_DATA_ITEM_TYPE_PRODUCT}/`,
                filter ?? '',
            )
            return results as IntegrationDataItem<Product>[]
        },
        keepPreviousData: true,
        onError: () => {
            reportError(
                new Error(
                    `Failed to fetch products for Shopify integration ${integrationId}`,
                ),
            )
        },
        enabled,
    })
}

export const useGetProductsByIdsFromIntegration = (
    integrationId: number,
    productsIds: number[],
    enabled = true,
    keepPreviousData = true,
) => {
    return useQuery({
        queryKey: [
            'integration',
            'shopify',
            integrationId,
            'products',
            productsIds,
        ],
        queryFn: async () => {
            const results = await fetchIntegrationProductsByIds(
                integrationId,
                productsIds,
            )

            return results.map((r) => r.toJS()) as Product[]
        },
        keepPreviousData,
        staleTime: Infinity,
        onError: () => {
            reportError(
                new Error(
                    `Failed to fetch products for integration ${integrationId}`,
                ),
            )
        },
        enabled,
    })
}

export const useListProducts = (
    integrationId: number,
    enabled = true,
    params?: {},
    queryParams?: {},
) => {
    const dispatch = useAppDispatch()
    const response = useInfiniteQuery({
        queryKey: ['integration', 'shopify', integrationId, 'products', 'list'],
        queryFn: async ({ pageParam }) =>
            fetchIntegrationProducts(integrationId, {
                cursor: pageParam,
                ...params,
            }),
        getNextPageParam: (lastPage) => {
            return lastPage.data.meta.next_cursor
        },
        enabled,
        ...queryParams,
    })

    useEffect(() => {
        if (response.error) {
            handleError(response.error, 'Failed to fetch products', dispatch)
        }
    }, [dispatch, response])

    return response
}

export const useShopifyTags = (
    integrationId: number,
    tagsType: ShopifyTags,
) => {
    return useQuery({
        queryKey: ['integration', 'shopify', integrationId, 'tags', tagsType],
        queryFn: async () => {
            const response = await fetchShopTags(integrationId, tagsType)
            return response
        },
        onError: () => {
            reportError(
                new Error(
                    `Failed to fetch ${tagsType} tags for Shopify integration ${integrationId}`,
                ),
            )
        },
    })
}

export const useListShopifyCustomerSegments = (
    integrationId: number,
    overrides?: { enabled: boolean },
) => {
    return useQuery({
        queryKey: [
            'integration',
            'shopify',
            integrationId,
            'customer',
            'segments',
        ],
        queryFn: async () => {
            const response = await fetchCustomerSegments(integrationId)
            return response
        },
        onError: () => {
            reportError(
                new Error(
                    `Failed to fetch customer segments for Shopify integration ${integrationId}`,
                ),
            )
        },
        ...overrides,
    })
}

export const useCollectionsFromShopifyIntegration = (
    integrationId: number,
    filter?: Record<string, string>,
) => {
    return useQuery({
        queryKey: [
            'integration',
            'shopify',
            integrationId,
            'collections',
            filter,
        ],
        queryFn: async () => {
            return await fetchShopifyCollections(integrationId, filter)
        },
        keepPreviousData: true,
        onError: () => {
            reportError(
                new Error(
                    `Failed to fetch collections for Shopify integration ${integrationId}`,
                ),
            )
        },
    })
}

export const useGetApps = (
    overrides?: UseQueryOptions<Awaited<AppListData[]>>,
) => {
    return useQuery({
        queryKey: ['apps', 'list'],
        queryFn: async () => {
            const response =
                await client.get<ApiListResponse<AppListData[], never>>(
                    '/api/apps/',
                )
            return response.data.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useGetAppsByIds = (appIds: string[]) => {
    return useQueries({
        queries: appIds.map((appId) => ({
            queryKey: ['apps', appId],
            queryFn: async () => {
                const response = await client.get<AppData>(`/api/apps/${appId}`)

                return response.data
            },
            staleTime: STALE_TIME_MS,
            cacheTime: CACHE_TIME_MS,
        })),
    })
}
