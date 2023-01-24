import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import moment from 'moment'

import {CustomFieldQueryKeys} from 'models/customField/constants'
import {
    getCustomField,
    getCustomFields,
    ListParams,
    updatePartialCustomField,
} from 'models/customField/resources'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const useGetCustomFieldDefinitions = (params: ListParams) => {
    const dispatch = useAppDispatch()
    return useQuery({
        staleTime: 60 * 60 * 1000, // 1 hour
        queryKey: [
            CustomFieldQueryKeys.customFieldDefinition,
            CustomFieldQueryKeys.customFieldDefinitionList,
            params,
        ],
        queryFn: () => getCustomFields(params),
        onError: () => {
            void dispatch(
                notify({
                    message: 'Failed to fetch ticket custom fields list',
                    status: NotificationStatus.Error,
                })
            )
        },
    })
}

export const useGetCustomFieldDefinition = (id: number) => {
    const dispatch = useAppDispatch()
    return useQuery({
        queryKey: [
            CustomFieldQueryKeys.customFieldDefinition,
            CustomFieldQueryKeys.customFieldDefinitionEdit,
            id,
        ],
        queryFn: () => getCustomField(id),
        onError: () => {
            void dispatch(
                notify({
                    message: 'Failed to fetch custom field',
                    status: NotificationStatus.Error,
                })
            )
        },
    })
}

export const useUpdateCustomFieldStatus = (id: number) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({archived}: {archived: boolean}) =>
            updatePartialCustomField(id, {
                deactivated_datetime: archived
                    ? moment.utc().toISOString()
                    : null,
            }),
        onSuccess: (_, {archived}) => {
            void queryClient.invalidateQueries({
                queryKey: [CustomFieldQueryKeys.customFieldDefinition],
            })
            void dispatch(
                notify({
                    message: `Ticket field successfully ${
                        archived ? 'archived' : 'unarchived'
                    }.`,
                    status: NotificationStatus.Success,
                })
            )
        },
        onError: (_, {archived}) => {
            void dispatch(
                notify({
                    message: `Failed to ${
                        archived ? 'archive' : 'unarchive'
                    } ticket field.`,
                    status: NotificationStatus.Error,
                })
            )
        },
    })
}
