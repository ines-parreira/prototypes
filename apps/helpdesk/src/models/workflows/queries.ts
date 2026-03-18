import type { UseQueryOptions } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import _mapValues from 'lodash/mapValues'

import { appQueryClient } from 'api/queryClient'
import { getGorgiasWfApiClient } from 'rest_api/workflows_api/client'
import type {
    OperationMethods,
    Paths,
} from 'rest_api/workflows_api/client.generated'
import type { MutationOverrides } from 'types/query'

export const STALE_TIME_MS = 10 * 60 * 1000 // 10 minutes
export const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

const STORE_WORKFLOWS_CONFIGURATION_QUERY_KEY = 'store-workflow-configuration'
const WORKFLOWS_CONFIGURATION_QUERY_KEY = 'workflow-configuration'
const WORKFLOWS_ENTRYPOINTS_QUERY_KEY = 'workflow-entrypoints'
const WORKFLOWS_CONFIGURATION_TEMPLATE_QUERY_KEY =
    'workflow-configuration-template'

const STORE_WORKFLOWS_APP_QUERY_KEY = 'store-workflow-app'

const ACTIONS_APP_QUERY_KEY = 'actions-app'

const EXECUTIONS_QUERY_KEY = 'executions-query-key'

const EXECUTION_QUERY_KEY = 'execution-query-key'

const EXECUTION_LOGS_QUERY_KEY = 'execution-logs-query-key'

const TRACKSTAR_QUERY_KEY = 'trackstar-query-key'

export const storeWorkflowsConfigurationDefinitionKeys = {
    all: () => [STORE_WORKFLOWS_CONFIGURATION_QUERY_KEY] as const,
    list: (params: {
        storeName: string
        storeType: string
        ids?: string[]
    }) => [...storeWorkflowsConfigurationDefinitionKeys.all(), params],
}

export const workflowsConfigurationDefinitionKeys = {
    all: () => [WORKFLOWS_CONFIGURATION_QUERY_KEY] as const,
    lists: () =>
        [...workflowsConfigurationDefinitionKeys.all(), 'list'] as const,
    list: (params: Paths.WfConfigurationControllerList.QueryParameters) =>
        [...workflowsConfigurationDefinitionKeys.lists(), params] as const,
    get: (id?: string) => [...workflowsConfigurationDefinitionKeys.all(), id],
}

export const workflowsConfigurationTemplateDefinitionKeys = {
    all: () => [WORKFLOWS_CONFIGURATION_TEMPLATE_QUERY_KEY] as const,
    lists: () =>
        [
            ...workflowsConfigurationTemplateDefinitionKeys.all(),
            'list',
        ] as const,
    list: (
        params: Paths.WfConfigurationTemplateControllerList.QueryParameters,
    ) =>
        [
            ...workflowsConfigurationTemplateDefinitionKeys.lists(),
            params,
        ] as const,
    get: (id: string) =>
        [WORKFLOWS_CONFIGURATION_TEMPLATE_QUERY_KEY, id] as const,
}

export const storeWorkflowsAppDefinitionKeys = {
    all: () => [STORE_WORKFLOWS_APP_QUERY_KEY] as const,
    list: (params: { storeName: string; storeType: string }) => [
        ...storeWorkflowsAppDefinitionKeys.all(),
        params,
    ],
}

export const storeWorkflowsEntrypointsDefinitionKeys = {
    all: () => [WORKFLOWS_ENTRYPOINTS_QUERY_KEY] as const,
    list: (params: { ids: string[]; language: string }) => [
        ...storeWorkflowsEntrypointsDefinitionKeys.all(),
        params,
    ],
}

export const actionsAppDefinitionKeys = {
    all: () => [ACTIONS_APP_QUERY_KEY] as const,
    lists: () => [...actionsAppDefinitionKeys.all(), 'list'] as const,
    list: () => [...actionsAppDefinitionKeys.lists()] as const,
    get: (id?: string) => [...actionsAppDefinitionKeys.all(), id],
}

export const executionsDefinitionKeys = {
    all: () => [EXECUTIONS_QUERY_KEY] as const,
    get: (params: {
        page: number
        configurationInternalId: string
        from: string
        to: string
        orderBy: string
        status?: string[]
        userJourneyId?: number
    }) => [...executionsDefinitionKeys.all(), params] as const,
}

export const executionDefinitionKeys = {
    all: () => [EXECUTION_QUERY_KEY] as const,
    get: (params: { configurationInternalId: string; executionId: string }) =>
        [...executionDefinitionKeys.all(), params] as const,
}

export const executionLogsDefinitionKeys = {
    all: () => [EXECUTION_LOGS_QUERY_KEY] as const,
    get: (params: { configurationInternalId: string; executionId: string }) =>
        [...executionLogsDefinitionKeys.all(), params] as const,
}

export const trackstarDefinitionKeys = {
    all: () => [TRACKSTAR_QUERY_KEY] as const,
    list: (params: { storeName: string; storeType: string }) => [
        ...trackstarDefinitionKeys.all(),
        params,
    ],
}

export const useGetWorkflowConfigurationTemplates = (
    params: Paths.WfConfigurationTemplateControllerList.QueryParameters,
    overrides?: UseQueryOptions<
        Awaited<Paths.WfConfigurationTemplateControllerList.Responses.$200>
    >,
) => {
    return useQuery({
        queryKey: workflowsConfigurationTemplateDefinitionKeys.list(params),
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            const response =
                await client.WfConfigurationTemplateController_list(
                    params,
                    {},
                    {
                        paramsSerializer: {
                            indexes: false,
                        },
                    },
                )
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useGetWorkflowConfigurationTemplate = (
    id: string,
    overrides?: UseQueryOptions<
        Awaited<Paths.WfConfigurationTemplateControllerGet.Responses.$200>
    >,
) => {
    return useQuery({
        queryKey: workflowsConfigurationTemplateDefinitionKeys.get(id),
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            const response = await client.WfConfigurationTemplateController_get(
                {
                    id,
                },
                {},
                {
                    paramsSerializer: {
                        indexes: false,
                    },
                },
            )
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useUpsertWorkflowConfigurationTemplate = (
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationTemplateController_upsert']
    >,
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationTemplateController_upsert(
                ...params,
            )
        },
        ...overrides,
    })
}

export const useDeleteWorkflowConfigurationTemplate = (
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationTemplateController_delete']
    >,
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationTemplateController_delete(
                ...params,
            )
        },
        ...overrides,
    })
}

export const useGetWorkflowConfiguration = (
    id: string,
    overrides?: UseQueryOptions<
        Awaited<Paths.WfConfigurationControllerGet.Responses.$200>
    >,
) => {
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

export const useUpsertWorkflowConfiguration = <TContext = unknown>(
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationController_upsert'],
        false,
        TContext
    >,
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
    >,
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
    >,
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
    >,
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationTranslationsController_get(
                ...params,
            )
        },
        ...overrides,
    })
}

export const useUpsertWorkflowConfigurationTranslations = (
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationTranslationsController_upsert']
    >,
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationTranslationsController_upsert(
                ...params,
            )
        },
        ...overrides,
    })
}

export const useDeleteWorkflowConfigurationTranslations = (
    overrides?: MutationOverrides<
        OperationMethods['WfConfigurationTranslationsController_delete']
    >,
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationTranslationsController_delete(
                ...params,
            )
        },
        ...overrides,
    })
}

export const useGetWorkflowConfigurations = (
    includeDrafts: boolean = false,
    overrides?: UseQueryOptions<
        Awaited<Paths.WfConfigurationControllerList.Responses.$200>
    >,
) => {
    const params = includeDrafts
        ? {
              is_draft: [
                  '0',
                  '1',
              ] as Paths.WfConfigurationControllerList.QueryParameters['is_draft'],
          }
        : {}
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

export const fetchWorkflowConfigurations = (includeDrafts: boolean = false) => {
    const params = includeDrafts
        ? {
              is_draft: [
                  '0',
                  '1',
              ] as Paths.WfConfigurationControllerList.QueryParameters['is_draft'],
          }
        : {}
    return appQueryClient.fetchQuery({
        queryKey: workflowsConfigurationDefinitionKeys.list(params),
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            const response = await client.WfConfigurationController_list(params)
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
    })
}

export const useGetStoreWorkflowsConfigurations = (
    {
        storeName,
        storeType,
        triggers,
        enabled,
    }: {
        storeName: string
        storeType: string
        triggers: ['llm-prompt'] | ['reusable-llm-prompt']
        enabled?: boolean
    },
    overrides: UseQueryOptions<
        Awaited<Paths.StoreWfConfigurationControllerList.Responses.$200>
    > = {},
    ids?: string[],
) => {
    return useQuery({
        queryKey: storeWorkflowsConfigurationDefinitionKeys.list({
            storeName,
            storeType,
            ids,
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
                    ...(enabled !== undefined
                        ? { enabled: enabled ? 'true' : 'false' }
                        : {}),
                },
                {},
                {
                    paramsSerializer: {
                        indexes: false,
                    },
                },
            )
            return response.data.filter((action) =>
                ids ? ids.includes(action.id) : true,
            )
        },
        refetchOnMount: 'always',
        keepPreviousData: true,
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useUpsertStoreWorkflowsConfiguration = <TContext = unknown>(
    overrides?: MutationOverrides<
        OperationMethods['StoreWfConfigurationController_upsert'],
        false,
        TContext
    >,
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
    >,
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
    overrides?: MutationOverrides<
        OperationMethods['StoreAppController_upsert']
    >,
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
            const response = await client.AppController_get(
                {
                    id: id!,
                },
                {},
                {
                    paramsSerializer: {
                        indexes: false,
                    },
                },
            )
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
    })
}

export const useListActionsApps = () => {
    return useQuery({
        queryKey: actionsAppDefinitionKeys.list(),
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            const response = await client.AppController_list(
                {},
                {},
                {
                    paramsSerializer: {
                        indexes: false,
                    },
                },
            )
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
    })
}

export const useUpsertActionsApp = (
    overrides?: MutationOverrides<OperationMethods['AppController_upsert']>,
) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.AppController_upsert(...params)
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: actionsAppDefinitionKeys.all(),
            })
        },
        ...overrides,
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
                    ids: ids as Paths.WfEntrypointControllerList.QueryParameters['ids'],
                    language,
                },
                {},
                {
                    paramsSerializer: {
                        indexes: false,
                    },
                },
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
    >,
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.WfConfigurationController_exportStepLogs(
                ...params,
            )
        },
        ...overrides,
    })
}

export const useGetConfigurationExecutions = (
    {
        configurationInternalId,
        from,
        orderBy,
        page,
        to,
        status,
        userJourneyId,
    }: {
        configurationInternalId: string
        from: Date
        to: Date
        orderBy: 'ASC' | 'DESC'
        page: number
        status?: ('error' | 'success' | 'partial_success')[]
        userJourneyId?: number
    },
    overrides?: UseQueryOptions<
        Awaited<Paths.WfConfigurationControllerGetExecutions.Responses.$200>
    >,
) => {
    return useQuery({
        queryKey: executionsDefinitionKeys.get({
            page,
            configurationInternalId,
            from: from.toString(),
            to: to.toString(),
            orderBy,
            status,
            userJourneyId,
        }),
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            const response =
                await client.WfConfigurationController_getExecutions(
                    {
                        internal_id: configurationInternalId,
                        end_date: to.toISOString(),
                        start_date: from.toISOString(),
                        order_by: orderBy,
                        page,
                        status,
                        user_journey_id: userJourneyId,
                    },
                    {},
                    {
                        paramsSerializer: {
                            indexes: false,
                        },
                    },
                )
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useGetConfigurationExecution = (
    configurationInternalId: string,
    executionId: string,
    overrides?: UseQueryOptions<
        Awaited<Paths.WfConfigurationControllerGetExecution.Responses.$200>
    >,
) => {
    return useQuery({
        queryKey: executionDefinitionKeys.get({
            configurationInternalId: configurationInternalId,
            executionId,
        }),
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            const response =
                await client.WfConfigurationController_getExecution({
                    execution_id: executionId,
                    internal_id: configurationInternalId,
                })
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useGetConfigurationExecutionLogs = (
    configurationInternalId: string,
    executionId: string,
    overrides?: UseQueryOptions<
        Awaited<Paths.WfConfigurationControllerExportExecutionLogs.Responses.$200>
    >,
) => {
    return useQuery({
        queryKey: executionLogsDefinitionKeys.get({
            configurationInternalId: configurationInternalId,
            executionId,
        }),
        queryFn: async () => {
            const client = await getGorgiasWfApiClient()
            try {
                const response =
                    await client.WfConfigurationController_exportExecutionLogs({
                        execution_id: executionId,
                        internal_id: configurationInternalId,
                    })
                return response.data
            } catch (e) {
                if (isAxiosError(e) && e.response?.status === 404) {
                    return []
                }
                throw e
            }
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useCreateTrackstarLink = (
    overrides?: MutationOverrides<OperationMethods['TrackstarController_link']>,
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return client.TrackstarController_link(...params)
        },
        ...overrides,
    })
}

export const useCreateTrackstarToken = (
    overrides?: MutationOverrides<
        OperationMethods['TrackstarController_token']
    >,
) => {
    return useMutation({
        mutationFn: async (params) => {
            const client = await getGorgiasWfApiClient()
            return await client.TrackstarController_token(...params)
        },
        ...overrides,
    })
}

export const useListTrackstarConnections = <T>(
    {
        storeName,
        storeType,
    }: {
        storeName: string
        storeType: string
    },
    overrides?: UseQueryOptions<
        Awaited<Paths.TrackstarControllerList.Responses.$200>,
        unknown,
        T
    >,
) => {
    return useQuery({
        queryKey: trackstarDefinitionKeys.list({
            storeName,
            storeType,
        }),
        queryFn: async () => {
            if (storeType !== 'shopify') {
                throw new Error('Unsupported store type')
            }
            const client = await getGorgiasWfApiClient()
            const response = await client.TrackstarController_list({
                store_name: storeName,
                store_type: storeType,
            })
            return response.data
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}
