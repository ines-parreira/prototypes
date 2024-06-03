import {useQuery, useMutation, UseQueryOptions} from '@tanstack/react-query'
import {getGorgiasWfApiClient} from 'rest_api/workflows_api/client'
import {OperationMethods, Paths} from 'rest_api/workflows_api/client.generated'
import {MutationOverrides} from 'types/query'

export const STALE_TIME_MS = 10 * 60 * 1000 // 10 minutes
export const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

const STORE_WORKFLOWS_CONFIGURATION_QUERY_KEY = 'store-workflow-configuration'
const WORKFLOWS_CONFIGURATION_QUERY_KEY = 'workflow-configuration'
const WORKFLOWS_CONFIGURATION_TEMPLATE_QUERY_KEY =
    'workflow-configuration-template'

export const storeWorkflowsConfigurationDefinitionKeys = {
    all: () => [STORE_WORKFLOWS_CONFIGURATION_QUERY_KEY] as const,
    list: (params: {storeName: string; storeType: string}) => [
        ...storeWorkflowsConfigurationDefinitionKeys.all(),
        params,
    ],
}

export const workflowsConfigurationDefinitionKeys = {
    all: () => [WORKFLOWS_CONFIGURATION_QUERY_KEY] as const,
    get: (id: string) => [...workflowsConfigurationDefinitionKeys.all(), id],
}

export const workflowsConfigurationTemplateDefinitionKeys = {
    all: () => [WORKFLOWS_CONFIGURATION_TEMPLATE_QUERY_KEY] as const,
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
