import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'

import {
    storeWorkflowsConfigurationDefinitionKeys,
    useUpsertStoreWorkflowsConfiguration,
    workflowsConfigurationDefinitionKeys,
} from 'models/workflows/queries'

import type {
    StoresWorkflowConfiguration,
    StoreWorkflowsConfiguration,
} from '../types'
import { handleError } from './errorHandler'

export default function useUpsertAction(
    actionType: 'create' | 'update',
    storeName: string,
    storeType: string,
) {
    const queryClient = useQueryClient()

    const storeWorkflowsConfigurationsListPrefix =
        storeWorkflowsConfigurationDefinitionKeys.list({
            storeName,
            storeType,
        })

    return useUpsertStoreWorkflowsConfiguration<{
        previousStoreWorkflowConfigurations: Array<
            [readonly unknown[], StoresWorkflowConfiguration | undefined]
        >
    }>({
        onMutate: async ([, data]) => {
            await queryClient.cancelQueries({
                queryKey: storeWorkflowsConfigurationsListPrefix,
            })

            const previousStoreWorkflowConfigurations =
                queryClient.getQueriesData<StoresWorkflowConfiguration>({
                    queryKey: storeWorkflowsConfigurationsListPrefix,
                })

            if (actionType === 'update' && data) {
                const requestAsListItem = data as StoreWorkflowsConfiguration
                queryClient.setQueriesData<StoresWorkflowConfiguration>(
                    { queryKey: storeWorkflowsConfigurationsListPrefix },
                    (prev) =>
                        prev?.map((action) =>
                            action.id === data.id ? requestAsListItem : action,
                        ),
                )
            }

            return { previousStoreWorkflowConfigurations }
        },
        onSuccess: ({ data }) => {
            const workflowConfigurationQueryKey =
                workflowsConfigurationDefinitionKeys.get(data.id)
            queryClient.setQueryData(workflowConfigurationQueryKey, data)

            const responseAsListItem = data as StoreWorkflowsConfiguration

            if (actionType === 'create') {
                queryClient.setQueriesData<StoresWorkflowConfiguration>(
                    { queryKey: storeWorkflowsConfigurationsListPrefix },
                    (prev) => (prev ? [...prev, responseAsListItem] : prev),
                )
            } else {
                queryClient.setQueriesData<StoresWorkflowConfiguration>(
                    { queryKey: storeWorkflowsConfigurationsListPrefix },
                    (prev) =>
                        prev?.map((action) =>
                            action.id === data.id ? responseAsListItem : action,
                        ),
                )
            }

            toast.success(
                actionType === 'create'
                    ? 'Successfully created Action'
                    : 'Successfully updated Action',
            )
        },
        onError: (error, _, context) => {
            const errorMessage =
                actionType === 'create'
                    ? `Fail to create Action. Please try again later.`
                    : `Fail to update Action. Please try again later.`
            handleError(error, errorMessage)
            if (context?.previousStoreWorkflowConfigurations) {
                for (const [
                    key,
                    previous,
                ] of context.previousStoreWorkflowConfigurations) {
                    queryClient.setQueryData(key, previous)
                }
            }
        },
    })
}
