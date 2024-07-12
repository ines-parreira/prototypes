import {useQuery, useMutation, UseQueryOptions} from '@tanstack/react-query'
import _mapValues from 'lodash/mapValues'
import {getGorgiasWfApiClient} from 'rest_api/workflows_api/client'
import {OperationMethods, Paths} from 'rest_api/workflows_api/client.generated'
import {MutationOverrides} from 'types/query'

export const STALE_TIME_MS = 10 * 60 * 1000 // 10 minutes
export const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

const STORE_WORKFLOWS_CONFIGURATION_QUERY_KEY = 'store-workflow-configuration'
const WORKFLOWS_CONFIGURATION_QUERY_KEY = 'workflow-configuration'
const WORKFLOWS_ENTRYPOINTS_QUERY_KEY = 'workflow-entrypoints'
const WORKFLOWS_CONFIGURATION_TEMPLATE_QUERY_KEY =
    'workflow-configuration-template'

const STORE_WORKFLOWS_APP_QUERY_KEY = 'store-workflow-app'

const ACTIONS_APP_QUERY_KEY = 'actions-app'

export const storeWorkflowsConfigurationDefinitionKeys = {
    all: () => [STORE_WORKFLOWS_CONFIGURATION_QUERY_KEY] as const,
    list: (params: {storeName: string; storeType: string}) => [
        ...storeWorkflowsConfigurationDefinitionKeys.all(),
        params,
    ],
}

export const workflowsConfigurationDefinitionKeys = {
    all: () => [WORKFLOWS_CONFIGURATION_QUERY_KEY] as const,
    lists: () =>
        [...workflowsConfigurationDefinitionKeys.all(), 'list'] as const,
    list: (params: Paths.WfConfigurationControllerList.QueryParameters) =>
        [...workflowsConfigurationDefinitionKeys.lists(), params] as const,
    get: (id: string) => [...workflowsConfigurationDefinitionKeys.all(), id],
}

export const workflowsConfigurationTemplateDefinitionKeys = {
    all: () => [WORKFLOWS_CONFIGURATION_TEMPLATE_QUERY_KEY] as const,
}

export const storeWorkflowsAppDefinitionKeys = {
    all: () => [STORE_WORKFLOWS_APP_QUERY_KEY] as const,
    list: (params: {storeName: string; storeType: string}) => [
        ...storeWorkflowsAppDefinitionKeys.all(),
        params,
    ],
}

export const storeWorkflowsEntrypointsDefinitionKeys = {
    all: () => [WORKFLOWS_ENTRYPOINTS_QUERY_KEY] as const,
    list: (params: {ids: string[]; language: string}) => [
        ...storeWorkflowsEntrypointsDefinitionKeys.all(),
        params,
    ],
}

export const actionsAppDefinitionKeys = {
    all: () => [ACTIONS_APP_QUERY_KEY] as const,
    get: (id?: string) => [...actionsAppDefinitionKeys.all(), id],
}

export const useGetWorkflowConfigurationTemplates = (
    triggers: string[],
    overrides?: UseQueryOptions<
        Awaited<Paths.WfConfigurationTemplateControllerList.Responses.$200>
    >
) => {
    return useQuery({
        queryKey: workflowsConfigurationTemplateDefinitionKeys.all(),
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            const response =
                await client.WfConfigurationTemplateController_list(
                    {
                        triggers,
                    },
                    {},
                    {
                        paramsSerializer: {
                            indexes: true,
                        },
                    }
                )
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useGetWorkflowConfiguration = (
    params: {id: string},
    overrides?: UseQueryOptions<
        Awaited<Paths.WfConfigurationControllerGet.Responses.$200>
    >
) => {
    const {id} = params
    return useQuery({
        queryKey: workflowsConfigurationDefinitionKeys.get(id),
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            const response = await client.WfConfigurationController_get({
                id,
            })
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useFetchWorkflowConfiguration = (
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationController_get']
    >
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationController_get(...params)
        },
        ...overrides,
    })
}

export const useUpsertWorkflowConfiguration = <TContext = unknown>(
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationController_upsert'],
        false,
        TContext
    >
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationController_upsert(...params)
        },
        ...overrides,
    })
}
export const useDeleteWorkflowConfiguration = (
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationController_delete']
    >
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationController_delete(...params)
        },
        ...overrides,
    })
}

export const useDuplicateWorkflowConfiguration = (
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationController_duplicate']
    >
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationController_duplicate(...params)
        },
        ...overrides,
    })
}

export const useFetchWorkflowConfigurationTranslations = (
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationTranslationsController_get']
    >
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationTranslationsController_get(
                ...params
            )
        },
        ...overrides,
    })
}

export const useUpsertWorkflowConfigurationTranslations = (
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationTranslationsController_upsert']
    >
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationTranslationsController_upsert(
                ...params
            )
        },
        ...overrides,
    })
}

export const useDeleteWorkflowConfigurationTranslations = (
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationTranslationsController_delete']
    >
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationTranslationsController_delete(
                ...params
            )
        },
        ...overrides,
    })
}

export const useGetWorkflowConfigurations = (
    includeDrafts: boolean = false,
    overrides?: UseQueryOptions<
        Awaited<Paths.WfConfigurationControllerList.Responses.$200>
    >
) => {
    const params = includeDrafts ? {is_draft: [0, 1]} : {}
    return useQuery({
        queryKey: workflowsConfigurationDefinitionKeys.list(params),
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            const response = await client.WfConfigurationController_list(params)
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useGetStoreWorkflowsConfigurations = ({
    storeName,
    storeType,
    triggers,
}: {
    storeName: string
    storeType: string
    triggers: ['llm-prompt']
}) => {
    return useQuery({
        queryKey: storeWorkflowsConfigurationDefinitionKeys.list({
            storeName,
            storeType,
        }),
        queryFn: async () => {
            if (storeType !== 'shopify') {
                throw new Error('Unsupported store type')
            }
            const client = await getGorgiasWfApiClient()
            const response = await client.StoreWfConfigurationController_list(
                {
                    store_name: storeName,
                    store_type: storeType,
                    triggers,
                },
                {},
                {
                    paramsSerializer: {
                        indexes: true,
                    },
                }
            )
            return response.data
        },
        refetchOnMount: 'always',
        keepPreviousData: true,
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
    })
}

export const useUpsertStoreWorkflowsConfiguration = <TContext = unknown>(
    overrides?: MutationOverrides<
        OperationMethods['StoreWfConfigurationController_upsert'],
        false,
        TContext
    >
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.StoreWfConfigurationController_upsert(...params)
        },
        ...overrides,
    })
}

export const useDeleteWorkflowsConfiguration = <TContext = unknown>(
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationController_delete'],
        false,
        TContext
    >
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationController_delete(...params)
        },
        ...overrides,
    })
}

export const useUpsertStoreApps = (
    overrides?: MutationOverrides<OperationMethods['StoreAppController_upsert']>
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.StoreAppController_upsert(...params)
        },
        ...overrides,
    })
}

export const useGetStoreApps = ({
    storeName,
    storeType,
}: {
    storeName: string
    storeType: string
}) => {
    return useQuery({
        queryKey: storeWorkflowsAppDefinitionKeys.list({
            storeName,
            storeType,
        }),
        queryFn: async () => {
            if (storeType !== 'shopify') {
                throw new Error('Unsupported store type')
            }
            const client = await getGorgiasWfApiClient()
            const response = await client.StoreAppController_list({
                store_name: storeName,
                store_type: storeType,
            })
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
    })
}

export const useGetActionsApp = (id?: string) => {
    return useQuery({
        queryKey: actionsAppDefinitionKeys.get(id),
        enabled: !!id,
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            const response = await client.AppController_list(
                {
                    ids: [id],
                },
                {},
                {
                    paramsSerializer: {
                        indexes: true,
                    },
                }
            )
            return response.data
        },
        select: (data) => data.find((app) => app.id === id),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
    })
}

export const useListWorkflowEntryPoints = ({
    ids,
    language,
}: {
    ids: string[]
    language: any
}) => {
    return useQuery({
        queryKey: storeWorkflowsEntrypointsDefinitionKeys.list({
            ids,
            language,
        }),
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            const response = await client.WfEntrypointController_list(
                {
                    ids,
                    language,
                },
                {},
                {
                    paramsSerializer: {
                        indexes: true,
                    },
                }
            )
            return response.data
        },
        select: (data) => _mapValues(data, 'label'),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        enabled: ids?.length > 0 && !!language,
    })
}

export const useDownloadWorkflowConfigurationStepLogs = (
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationController_exportStepLogs']
    >
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationController_exportStepLogs(
                ...params
            )
        },
        ...overrides,
    })
}
