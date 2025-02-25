import { useQueryClient } from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    storeWorkflowsConfigurationDefinitionKeys,
    useDeleteWorkflowsConfiguration,
} from 'models/workflows/queries'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { StoresWorkflowConfiguration } from '../types'
import { handleError } from './errorHandler'

export default function useDeleteAction(
    name: string,
    storeName: string,
    storeType: string,
) {
    const dispatch = useAppDispatch()
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
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: `Successfully deleted Action ${name}`,
                }),
            )
        },
        onSettled: () =>
            void queryClient.invalidateQueries({
                queryKey,
            }),
        onError: (error, _, context) => {
            handleError(error, `Failed to delete Action ${name}`, dispatch)
            queryClient.setQueryData(
                queryKey,
                context?.previousActionsConfiguration,
            )
        },
    })
}
