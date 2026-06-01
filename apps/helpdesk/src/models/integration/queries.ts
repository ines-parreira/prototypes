import client from '@repo/api-resources'
import { reportError } from '@repo/logging'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'
import {
    useInfiniteQuery,
    useMutation,
    useQueries,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'

import { INTEGRATION_DATA_ITEM_TYPE_PRODUCT } from 'constants/integration'
import type { Product } from 'constants/integrations/types/shopify'
import { handleError } from 'hooks/agents/errorHandler'
import useAppDispatch from 'hooks/useAppDispatch'
import type { ApiListResponse } from 'models/api/types'
import type { FetchIntegrationProductsParams } from 'models/integration/resources'
import { fetchIntegrationProducts } from 'models/integration/resources'
import GorgiasApi from 'services/gorgiasApi'
import {
    getApplications,
    getInstallationSnippet,
    getPreviewInstallationSnippet,
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
import type {
    CreateServiceConnectionRequest,
    ServiceConnectionApiDTO,
    ServiceConnectionAuthApiDTO,
    ServiceConnectionStatus,
    StoreForServiceConnectionApiDTO,
    UpdateServiceConnectionRequest,
} from './types/serviceConnection'

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

export const useGetPreviewInstallationSnippet = () =>
    useQuery({
        queryKey: [
            'integration',
            'gorgias-chat',
            'getPreviewInstallationSnippet',
        ],
        queryFn: getPreviewInstallationSnippet,
        onError: () => {
            reportError(
                new Error('Failed to fetch chat preview installation snippet'),
            )
        },
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
    params?: FetchIntegrationProductsParams,
    queryParams?: {},
) => {
    const dispatch = useAppDispatch()
    const response = useInfiniteQuery({
        queryKey: [
            'integration',
            'shopify',
            integrationId,
            'products',
            'list',
            ...(params ? [params] : []),
        ],
        queryFn: async ({ pageParam }) =>
            fetchIntegrationProducts(integrationId, {
                cursor: pageParam,
                ...params,
            }),
        getNextPageParam: (lastPage) => {
            return lastPage.data.meta.next_cursor
        },
        enabled,
        onError: (error) =>
            handleError(error, 'Failed to fetch products', dispatch),
        ...queryParams,
    })

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

// TODO(ORCSUP-358): migrate to `@gorgias/helpdesk-queries` once the SDK
// publishes service-connection hooks and `@gorgias/helpdesk-mocks` ships
// matching MSW handlers.

export const serviceConnectionsQueryKey = (applicationId: string) =>
    [
        'integration',
        'service-connections',
        { application_id: applicationId },
    ] as const

export const serviceConnectionQueryKey = (connectionId: string) =>
    ['integration', 'service-connections', connectionId] as const

export const serviceConnectionAuthQueryKey = (connectionId: string) =>
    ['integration', 'service-connections', connectionId, 'auth'] as const

export const serviceConnectionStoresQueryKey = (connectionId: string) =>
    ['integration', 'service-connections', connectionId, 'stores'] as const

export const useListServiceConnectionsByAppId = (
    applicationId: string,
    overrides?: { enabled?: boolean },
) =>
    useQuery({
        queryKey: serviceConnectionsQueryKey(applicationId),
        queryFn: async () => {
            const response = await client.get<
                ApiListResponse<ServiceConnectionApiDTO[], unknown>
            >('/api/service-connections/', {
                params: { application_id: applicationId },
            })
            return response.data.data.filter(
                (connection) => connection.trashed_datetime === null,
            )
        },
        enabled: !!applicationId && overrides?.enabled !== false,
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
    })

export const useListServiceConnectionsByAppIds = (applicationIds: string[]) =>
    useQueries({
        queries: applicationIds.map((applicationId) => ({
            queryKey: serviceConnectionsQueryKey(applicationId),
            queryFn: async () => {
                const response = await client.get<
                    ApiListResponse<ServiceConnectionApiDTO[], unknown>
                >('/api/service-connections/', {
                    params: { application_id: applicationId },
                })
                return response.data.data.filter(
                    (connection) => connection.trashed_datetime === null,
                )
            },
            staleTime: STALE_TIME_MS,
            cacheTime: CACHE_TIME_MS,
        })),
    })

export const useGetServiceConnection = (
    connectionId: string,
    overrides?: { enabled?: boolean },
) =>
    useQuery({
        queryKey: serviceConnectionQueryKey(connectionId),
        queryFn: async () => {
            const response = await client.get<ServiceConnectionApiDTO>(
                `/api/service-connections/${connectionId}`,
            )
            return response.data
        },
        enabled: !!connectionId && overrides?.enabled !== false,
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
    })

export const useGetServiceConnectionAuth = (
    connectionId: string,
    overrides?: { enabled?: boolean },
) =>
    useQuery({
        queryKey: serviceConnectionAuthQueryKey(connectionId),
        queryFn: async () => {
            const response = await client.get<ServiceConnectionAuthApiDTO>(
                `/api/service-connections/${connectionId}/auth/`,
            )
            return response.data
        },
        enabled: !!connectionId && overrides?.enabled !== false,
    })

export const useListServiceConnectionStores = (
    connectionId: string,
    overrides?: { enabled?: boolean },
) =>
    useQuery({
        queryKey: serviceConnectionStoresQueryKey(connectionId),
        queryFn: async () => {
            const response = await client.get<
                ApiListResponse<StoreForServiceConnectionApiDTO[], unknown>
            >(`/api/service-connections/${connectionId}/stores/`)
            return response.data.data
        },
        enabled: !!connectionId && overrides?.enabled !== false,
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
    })

export const useListServiceConnectionStoresByConnectionIds = (
    connectionIds: string[],
) =>
    useQueries({
        queries: connectionIds.map((connectionId) => ({
            queryKey: serviceConnectionStoresQueryKey(connectionId),
            queryFn: async () => {
                const response = await client.get<
                    ApiListResponse<StoreForServiceConnectionApiDTO[], unknown>
                >(`/api/service-connections/${connectionId}/stores/`)
                return response.data.data
            },
            staleTime: STALE_TIME_MS,
            cacheTime: CACHE_TIME_MS,
        })),
    })

export const useCreateServiceConnection = (
    applicationId: string,
    options?: UseMutationOptions<
        ServiceConnectionApiDTO,
        unknown,
        CreateServiceConnectionRequest
    >,
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (payload) => {
            const response = await client.post<ServiceConnectionApiDTO>(
                '/api/service-connections/',
                payload,
            )
            return response.data
        },
        onSuccess: (data, vars, ctx) => {
            void queryClient.invalidateQueries({
                queryKey: serviceConnectionsQueryKey(applicationId),
            })
            options?.onSuccess?.(data, vars, ctx)
        },
        ...options,
    })
}

export const useAssignServiceConnectionStore = (
    options?: UseMutationOptions<
        StoreForServiceConnectionApiDTO,
        unknown,
        { connectionId: string; storeId: number }
    >,
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ connectionId, storeId }) => {
            const response = await client.post<StoreForServiceConnectionApiDTO>(
                `/api/service-connections/${connectionId}/stores/`,
                { store_id: storeId },
            )
            return response.data
        },
        onSuccess: (_data, vars, ctx) => {
            void queryClient.invalidateQueries({
                queryKey: serviceConnectionStoresQueryKey(vars.connectionId),
            })
            options?.onSuccess?.(_data, vars, ctx)
        },
        ...options,
    })
}

export const useUnassignServiceConnectionStore = (
    options?: UseMutationOptions<
        void,
        unknown,
        { connectionId: string; storeId: number }
    >,
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ connectionId, storeId }) => {
            await client.delete(
                `/api/service-connections/${connectionId}/stores/${storeId}/`,
            )
        },
        onSuccess: (_data, vars, ctx) => {
            void queryClient.invalidateQueries({
                queryKey: serviceConnectionStoresQueryKey(vars.connectionId),
            })
            options?.onSuccess?.(_data, vars, ctx)
        },
        ...options,
    })
}

export const useTrashServiceConnection = (
    applicationId: string,
    options?: UseMutationOptions<
        ServiceConnectionApiDTO,
        unknown,
        { connectionId: string }
    >,
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ connectionId }) => {
            const response = await client.put<ServiceConnectionApiDTO>(
                `/api/service-connections/${connectionId}/trash/`,
                {},
            )
            return response.data
        },
        onSuccess: (data, vars, ctx) => {
            void queryClient.invalidateQueries({
                queryKey: serviceConnectionsQueryKey(applicationId),
            })
            options?.onSuccess?.(data, vars, ctx)
        },
        ...options,
    })
}

export const useUpdateServiceConnection = (
    applicationId: string,
    options?: UseMutationOptions<
        ServiceConnectionApiDTO,
        unknown,
        { connectionId: string; payload: UpdateServiceConnectionRequest }
    >,
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ connectionId, payload }) => {
            const response = await client.put<ServiceConnectionApiDTO>(
                `/api/service-connections/${connectionId}`,
                payload,
            )
            return response.data
        },
        onSuccess: (data, vars, ctx) => {
            void queryClient.invalidateQueries({
                queryKey: serviceConnectionsQueryKey(applicationId),
            })
            void queryClient.invalidateQueries({
                queryKey: serviceConnectionQueryKey(vars.connectionId),
            })
            void queryClient.invalidateQueries({
                queryKey: serviceConnectionAuthQueryKey(vars.connectionId),
            })
            options?.onSuccess?.(data, vars, ctx)
        },
        ...options,
    })
}

export const isServiceConnectionHealthy = (
    status: ServiceConnectionStatus | undefined,
) => status === 'active'
