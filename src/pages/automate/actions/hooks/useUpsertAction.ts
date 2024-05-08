import {useQueryClient} from '@tanstack/react-query'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    useUpsertStoreWorkflowsConfiguration,
    storeWorkflowsConfigurationDefinitionKeys,
} from 'models/workflows/queries'

import {Actions} from '../types'
import {handleError} from './errorHandler'

export default function useUpsertAction(
    actionType: 'create' | 'update',
    storeName: string,
    storeType: string
) {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const queryKey = storeWorkflowsConfigurationDefinitionKeys.list({
        storeName,
        storeType,
    })

    return useUpsertStoreWorkflowsConfiguration<{
        previousActionsConfiguration: Actions | undefined
    }>({
        onMutate: async ([, data]) => {
            await queryClient.cancelQueries({
                queryKey,
            })

            const previousActionsConfiguration =
                queryClient.getQueryData<Actions>(queryKey)

            // Optimistically update the cache
            queryClient.setQueryData(
                queryKey,
                actionType === 'update'
                    ? previousActionsConfiguration?.map((action) => {
                          if (action.id === data?.id) {
                              return data
                          }
                          return action
                      })
                    : [...(previousActionsConfiguration ?? []), data]
            )
            return {
                previousActionsConfiguration,
            }
        },
        onSuccess: () => {
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message:
                        actionType === 'create'
                            ? 'Successfully created Action'
                            : 'Successfully updated Action',
                })
            )
        },
        onError: (error, _, context) => {
            const errorMessage =
                actionType === 'create'
                    ? `Fail to create action. Please try again later.`
                    : `Fail to update action. Please try again later.`
            handleError(error, errorMessage, dispatch)
            queryClient.setQueryData(
                queryKey,
                context?.previousActionsConfiguration
            )
        },
    })
}
