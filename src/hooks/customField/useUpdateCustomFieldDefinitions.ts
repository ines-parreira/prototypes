import {useQueryClient} from '@tanstack/react-query'

import {errorToChildren} from 'utils'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {isGorgiasApiError} from 'models/api/types'
import {ListParams} from 'models/customField/types'
import {
    customFieldDefinitionKeys,
    UseGetCustomFieldDefinitions,
    useUpdateCustomFields,
} from 'models/customField/queries'

export const useUpdateCustomFieldDefinitions = (params: ListParams) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const queryKey = customFieldDefinitionKeys.list(params)

    return useUpdateCustomFields({
        onMutate: async ([data]) => {
            // Cancel any outgoing re-fetches
            // (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({queryKey})

            // Optimistically update to the new value
            queryClient.setQueryData<UseGetCustomFieldDefinitions>(
                queryKey,
                (oldQueryResponse) => {
                    // if there is no data in cache then we don't need to update anything
                    if (!oldQueryResponse) {
                        return undefined
                    }
                    const newData = oldQueryResponse?.data?.data
                        ?.map((customField) => {
                            const updatedCustomField = data.find(
                                (partialCustomFieldWithId) =>
                                    partialCustomFieldWithId.id ===
                                    customField.id
                            )

                            if (updatedCustomField) {
                                return {
                                    ...customField,
                                    ...updatedCustomField,
                                }
                            }

                            return customField
                        })
                        // in case we update priorities of custom fields then they won't be sorted anymore,
                        // so we need to sort them back
                        .sort(
                            (customFieldA, customFieldB) =>
                                customFieldB.priority - customFieldA.priority
                        )

                    return {
                        ...oldQueryResponse,
                        data: {
                            ...oldQueryResponse?.data,
                            data: newData,
                        },
                    }
                }
            )
        },
        onError: (error) => {
            void dispatch(
                notify({
                    title: isGorgiasApiError(error)
                        ? error.response?.data.error.msg
                        : 'Oups something went wrong',
                    message: errorToChildren(error) || undefined,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                })
            )
        },
        onSettled: () => {
            void queryClient.invalidateQueries({
                queryKey,
            })
        },
    })
}
