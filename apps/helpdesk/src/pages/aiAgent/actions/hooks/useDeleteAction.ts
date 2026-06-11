import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'

import {
    storeWorkflowsConfigurationDefinitionKeys,
    useDeleteWorkflowsConfiguration,
} from 'models/workflows/queries'

import type { StoresWorkflowConfiguration } from '../types'
import { handleError } from './errorHandler'

export function useDeleteAction(
    name: string,
    storeName: string,
    storeType: string,
) {
    const queryClient = useQueryClient()

    const queryKey = storeWorkflowsConfigurationDefinitionKeys.list({
        storeName,
        storeType,
    })

    return useDeleteWorkflowsConfiguration<{
        previousActionsConfiguration: StoresWorkflowConfiguration | undefined
    }>({
        onMutate: ([params]) => {
            if (
                params &&
                typeof params === 'object' &&
                !Array.isArray(params)
            ) {
                const internalId = params['internal_id']

                const previousActionsConfiguration =
                    queryClient.getQueryData<StoresWorkflowConfiguration>(
                        queryKey,
                    )

                // Optimistically update the cache
                queryClient.setQueryData(
                    queryKey,
                    previousActionsConfiguration?.filter
                        ? previousActionsConfiguration.filter(
                              (action) => action.internal_id !== internalId,
                          )
                        : [],
                )

                return {
                    previousActionsConfiguration,
                }
            }
        },
        onSuccess: () => {
            toast.success(`Successfully deleted Action ${name}`)
        },
        onSettled: () =>
            void queryClient.invalidateQueries({
                queryKey,
            }),
        onError: (error, _, context) => {
            handleError(error, `Failed to delete Action ${name}`)
            queryClient.setQueryData(
                queryKey,
                context?.previousActionsConfiguration,
            )
        },
    })
}
