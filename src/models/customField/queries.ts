import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import moment from 'moment'

import {CustomFieldQueryKeys} from 'models/customField/constants'
import {
    createCustomField,
    getCustomField,
    getCustomFields,
    ListParams,
    updateCustomField,
    updatePartialCustomField,
} from 'models/customField/resources'

import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {GorgiasApiError} from 'models/api/types'
import {errorToChildren} from 'utils'
import {CustomFieldInput} from 'models/customField/types'

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
export const useCreateCustomField = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (field: CustomFieldInput) => createCustomField(field),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: [CustomFieldQueryKeys.customFieldDefinition],
            })
            void dispatch(
                notify({
                    message: 'Ticket field created successfully.',
                    status: NotificationStatus.Success,
                })
            )
        },
        onError: (error) => {
            const err = error as GorgiasApiError
            void dispatch(
                notify({
                    title: err.response.data.error.msg,
                    message: errorToChildren(err)!,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                })
            )
        },
    })
}

export const useUpdateCustomField = (id: number) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (field: CustomFieldInput) => updateCustomField(id, field),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: [CustomFieldQueryKeys.customFieldDefinition],
            })
            void dispatch(
                notify({
                    message: 'Ticket field updated successfully.',
                    status: NotificationStatus.Success,
                })
            )
        },
        onError: (error) => {
            const err = error as GorgiasApiError
            void dispatch(
                notify({
                    title: err.response.data.error.msg,
                    message: errorToChildren(err)!,
                    allowHTML: true,
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
        onError: (error, {archived}) => {
            const err = error as GorgiasApiError
            void dispatch(
                notify({
                    title: `Failed to ${
                        archived ? 'archive' : 'unarchive'
                    } ticket field.`,
                    message: errorToChildren(err)!,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                })
            )
        },
    })
}
