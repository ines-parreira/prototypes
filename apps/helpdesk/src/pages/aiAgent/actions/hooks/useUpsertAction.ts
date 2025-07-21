import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    storeWorkflowsConfigurationDefinitionKeys,
    useUpsertStoreWorkflowsConfiguration,
    workflowsConfigurationDefinitionKeys,
} from 'models/workflows/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    StoresWorkflowConfiguration,
    StoreWorkflowsConfiguration,
} from '../types'
import { handleError } from './errorHandler'

export default function useUpsertAction(
    actionType: 'create' | 'update',
    storeName: string,
    storeType: string,
) {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const storeWorkflowsConfigurationQueryKey =
        storeWorkflowsConfigurationDefinitionKeys.list({
            storeName,
            storeType,
        })

    return useUpsertStoreWorkflowsConfiguration<{
        previousStoreWorkflowConfiguration?: StoresWorkflowConfiguration
        previousWorkflowConfiguration?: StoreWorkflowsConfiguration
    }>({
        onMutate: async ([, data]) => {
            await queryClient.cancelQueries({
                queryKey: storeWorkflowsConfigurationQueryKey,
            })

            const previousStoreWorkflowConfiguration =
                queryClient.getQueryData<StoresWorkflowConfiguration>(
                    storeWorkflowsConfigurationQueryKey,
                ) ?? []

            // Optimistically update the cache
            if (actionType === 'update') {
                queryClient.setQueryData(
                    storeWorkflowsConfigurationQueryKey,
                    previousStoreWorkflowConfiguration.map((action) => {
                        if (action.id === data?.id) {
                            return data
                        }
                        return action
                    }),
                )
            }

            return {
                previousStoreWorkflowConfiguration,
            }
        },
        onSuccess: ({ data }) => {
            const previousStoreWorkflowConfiguration =
                queryClient.getQueryData<StoresWorkflowConfiguration>(
                    storeWorkflowsConfigurationQueryKey,
                ) ?? []

            const workflowConfigurationQueryKey =
                workflowsConfigurationDefinitionKeys.get(data.id)
            queryClient.setQueryData(workflowConfigurationQueryKey, data)

            if (actionType === 'create') {
                queryClient.setQueryData(storeWorkflowsConfigurationQueryKey, [
                    ...previousStoreWorkflowConfiguration,
                    data,
                ])
            }

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message:
                        actionType === 'create'
                            ? 'Successfully created Action'
                            : 'Successfully updated Action',
                }),
            )
        },
        onError: (error, _, context) => {
            const errorMessage =
                actionType === 'create'
                    ? `Fail to create Action. Please try again later.`
                    : `Fail to update Action. Please try again later.`
            handleError(error, errorMessage, dispatch)
            queryClient.setQueryData(
                storeWorkflowsConfigurationQueryKey,
                context?.previousStoreWorkflowConfiguration,
            )
        },
    })
}
