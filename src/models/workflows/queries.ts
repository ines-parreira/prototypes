import {useQuery, useMutation} from '@tanstack/react-query'
import {getGorgiasWfApiClient} from 'rest_api/workflows_api/client'
import {OperationMethods} from 'rest_api/workflows_api/client.generated'
import {MutationOverrides} from 'types/query'

export const STALE_TIME_MS = 10 * 60 * 1000 // 10 minutes
export const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

const STORE_WORKFLOWS_CONFIGURATION_QUERY_KEY = 'store-workflow-configuration'

export const storeWorkflowsConfigurationDefinitionKeys = {
    all: () => [STORE_WORKFLOWS_CONFIGURATION_QUERY_KEY] as const,
    list: (params: {storeName: string; storeType: string}) => [
        ...storeWorkflowsConfigurationDefinitionKeys.all(),
        params,
    ],
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
