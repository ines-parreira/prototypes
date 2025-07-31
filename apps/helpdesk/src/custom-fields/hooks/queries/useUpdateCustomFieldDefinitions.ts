import { useQueryClient } from '@tanstack/react-query'

import {
    ListCustomFieldsParams,
    ListCustomFieldsResult,
    queryKeys,
    useUpdateCustomFields,
} from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { errorToChildren } from 'utils'

export const useUpdateCustomFieldDefinitions = (
    params: ListCustomFieldsParams,
) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const queryKey = queryKeys.customFields.listCustomFields(params)

    return useUpdateCustomFields({
        mutation: {
            onMutate: async ({ data }) => {
                // Cancel any outgoing re-fetches
                // (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries({ queryKey })

                // Optimistically update to the new value
                queryClient.setQueryData<ListCustomFieldsResult>(
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
                                        customField.id,
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
                                    customFieldB.priority -
                                    customFieldA.priority,
                            )

                        return {
                            ...oldQueryResponse,
                            data: {
                                ...oldQueryResponse?.data,
                                data: newData,
                            },
                        }
                    },
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
                    }),
                )
            },
            onSettled: () => {
                void queryClient.invalidateQueries({
                    queryKey,
                })
            },
        },
    })
}
