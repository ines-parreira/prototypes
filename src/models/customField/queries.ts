import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import moment from 'moment'

import {
    createCustomField,
    deleteCustomFieldValue,
    getCustomField,
    getCustomFields,
    ListParams,
    updateCustomField,
    updateCustomFieldValue,
    updatePartialCustomField,
} from 'models/customField/resources'

import {isCustomFieldValueEmpty} from 'business/customFields'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {updateCustomFieldState} from 'state/ticket/actions'
import {NotificationStatus} from 'state/notifications/types'
import {GorgiasApiError} from 'models/api/types'
import {CustomFieldInput, CustomFieldState} from 'models/customField/types'
import {errorToChildren} from 'utils'

export const customFieldDefinitionKeys = {
    all: ['customFieldDefinition'] as const,
    lists: () => [...customFieldDefinitionKeys.all, 'list'] as const,
    list: (params: ListParams) => [
        ...customFieldDefinitionKeys.lists(),
        params,
    ],
    details: () => [...customFieldDefinitionKeys.all, 'detail'] as const,
    detail: (id: number) =>
        [...customFieldDefinitionKeys.details(), id] as const,
}

export const useGetCustomFieldDefinitions = (params: ListParams) => {
    const dispatch = useAppDispatch()
    return useQuery({
        staleTime: 60 * 60 * 1000, // 1 hour
        queryKey: customFieldDefinitionKeys.list(params),
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
        queryKey: customFieldDefinitionKeys.detail(id),
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
                queryKey: customFieldDefinitionKeys.all,
            })
            void dispatch(
                notify({
                    message: 'Ticket field created successfully.',
                    status: NotificationStatus.Success,
                })
            )
        },
        onError: (error: GorgiasApiError) => {
            void dispatch(
                notify({
                    title: error.response.data.error.msg,
                    message: errorToChildren(error) || undefined,
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
                queryKey: customFieldDefinitionKeys.all,
            })
            void dispatch(
                notify({
                    message: 'Ticket field updated successfully.',
                    status: NotificationStatus.Success,
                })
            )
        },
        onError: (error: GorgiasApiError) => {
            void dispatch(
                notify({
                    title: error.response.data.error.msg,
                    message: errorToChildren(error) || undefined,
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
                queryKey: customFieldDefinitionKeys.all,
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
        onError: (error: GorgiasApiError, {archived}) => {
            void dispatch(
                notify({
                    title: `Failed to ${
                        archived ? 'archive' : 'unarchive'
                    } ticket field.`,
                    message: errorToChildren(error) || undefined,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                })
            )
        },
    })
}

export type OnMutateSettings = {
    previousState?: CustomFieldState
    onError?: () => void
}

export const useUpdateOrDeleteTicketFieldValue = (ticketId: number) => {
    const dispatch = useAppDispatch()
    // there is no simple way to cancel a mutation yet
    // to avoid race conditions
    return useMutation({
        mutationFn: ({
            id,
            value,
        }: CustomFieldState & {settings?: OnMutateSettings}) => {
            const params = {
                fieldType: 'Ticket',
                holderId: ticketId,
                fieldId: id,
                value,
            } as const

            if (isCustomFieldValueEmpty(value)) {
                return deleteCustomFieldValue(params)
            }
            return updateCustomFieldValue(params)
        },
        onError: (error: GorgiasApiError, {settings}) => {
            void dispatch(
                notify({
                    title: `Failed to update ticket field value. Please try again in a few seconds.`,
                    message: errorToChildren(error) || undefined,
                    allowHTML: true,
                    status: NotificationStatus.Error,
                })
            )
            const previousState = settings?.previousState
            if (previousState) {
                dispatch(updateCustomFieldState(previousState))
            }
            settings?.onError?.()
        },
    })
}
