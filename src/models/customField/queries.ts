import {
    useQuery,
    useMutation,
    useQueryClient,
    UseMutationOptions,
    UseQueryOptions,
} from '@tanstack/react-query'
import moment from 'moment'

import {errorToChildren} from 'utils'
import {isCustomFieldValueEmpty} from 'utils/customFields'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {StoreDispatch} from 'state/types'
import {NotificationStatus} from 'state/notifications/types'
import {GorgiasApiError} from 'models/api/types'
import {
    CustomFieldInput,
    ListParams,
    PartialCustomFieldWithId,
} from 'models/customField/types'
import {
    createCustomField,
    deleteCustomFieldValue,
    getCustomField,
    getCustomFields,
    updateCustomField,
    updateCustomFields,
    updateCustomFieldValue,
    updatePartialCustomField,
} from 'models/customField/resources'

export const customFieldDefinitionKeys = {
    all: () => ['customFieldDefinition'] as const,
    lists: () => [...customFieldDefinitionKeys.all(), 'list'] as const,
    list: (params: ListParams) => [
        ...customFieldDefinitionKeys.lists(),
        params,
    ],
    details: () => [...customFieldDefinitionKeys.all(), 'detail'] as const,
    detail: (id: number) =>
        [...customFieldDefinitionKeys.details(), id] as const,
}

export const customFieldValueKeys = {
    all: () => ['customFieldValues'] as const,
    value: (id: number) => [...customFieldValueKeys.all(), id] as const,
}

export type UseGetCustomFieldDefinitions = Awaited<
    ReturnType<typeof getCustomFields>
>

export const useGetCustomFieldDefinitions = <TData>(
    params: ListParams,
    overrides?: UseQueryOptions<UseGetCustomFieldDefinitions, unknown, TData>
) => {
    return useQuery({
        queryKey: customFieldDefinitionKeys.list(params),
        queryFn: () => getCustomFields(params),
        ...overrides,
    })
}

export const useGetCustomFieldDefinition = <TData>(
    id: number,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getCustomField>>,
        unknown,
        TData
    >
) => {
    return useQuery({
        queryKey: customFieldDefinitionKeys.detail(id),
        queryFn: () => getCustomField(id),
        ...overrides,
    })
}

export const useCreateCustomField = () => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (field: CustomFieldInput) => createCustomField(field),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: customFieldDefinitionKeys.all(),
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
                queryKey: customFieldDefinitionKeys.all(),
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

export const useUpdateCustomFields = (params: ListParams) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const queryKey = customFieldDefinitionKeys.list(params)

    return useMutation({
        mutationFn: (data: PartialCustomFieldWithId[]) =>
            updateCustomFields(data),
        onMutate: async (data: PartialCustomFieldWithId[]) => {
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
        onSettled: () => {
            void queryClient.invalidateQueries({
                queryKey,
            })
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
                queryKey: customFieldDefinitionKeys.all(),
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

export type MutationOverrides<
    Action extends (...args: any) => unknown,
    SkipReturnType extends boolean = false
> = Omit<
    SkipReturnType extends true
        ? UseMutationOptions<
              unknown,
              Record<string, unknown>,
              Parameters<Action>
          >
        : UseMutationOptions<
              Awaited<ReturnType<Action>>,
              Record<string, unknown>,
              Parameters<Action>
          >,
    'mutationFn'
>

export const useUpdateCustomFieldValue = (
    overrides?: MutationOverrides<typeof updateCustomFieldValue>
) => {
    return useMutation({
        mutationFn: (params) => updateCustomFieldValue(...params),
        ...overrides,
    })
}

export const useDeleteCustomFieldValue = (
    overrides?: MutationOverrides<typeof deleteCustomFieldValue>
) => {
    return useMutation({
        mutationFn: (params) => deleteCustomFieldValue(...params),
        ...overrides,
    })
}

// Service layer - To be tested
const onErrorCreator =
    (dispatch: StoreDispatch) => (error: Record<string, unknown>) => {
        void dispatch(
            notify({
                title: `Failed to update ticket field value. Please try again in a few seconds.`,
                message: errorToChildren(error) || undefined,
                allowHTML: true,
                status: NotificationStatus.Error,
            })
        )
    }

// This is only doable because we know that delete extends update params
// And we don’t need to type the return value because we don’t use it
export const useUpdateOrDeleteTicketFieldValue = (
    providedOverrides: MutationOverrides<
        typeof updateCustomFieldValue & typeof deleteCustomFieldValue,
        true
    >,
    {isDisabled = false}
) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const internalErrorHandler = onErrorCreator(dispatch)
    const overrides = {
        onSuccess: (data: unknown, params: {fieldId: number}[]) => {
            // queryClient.setQueryData(customFieldValueKeys.value(params[0].id), {...})
            // or the following if we ever fetch value with react query
            void queryClient.invalidateQueries(
                customFieldValueKeys.value(params[0].fieldId)
            )
        },
        ...providedOverrides,
        // this onError should not be overridden because it has custom logic
        onError: (
            ...args: Parameters<
                Exclude<typeof providedOverrides.onError, undefined>
            >
        ) => {
            internalErrorHandler(args[0])
            providedOverrides.onError?.(...args)
        },
    }
    const {mutate: updateMutate} = useUpdateCustomFieldValue(overrides)
    const {mutate: deleteMutate} = useDeleteCustomFieldValue(overrides)

    return {
        mutate: (
            params: Parameters<typeof updateCustomFieldValue> &
                Parameters<typeof deleteCustomFieldValue>
        ) => {
            if (isDisabled) return
            if (isCustomFieldValueEmpty(params[0].value)) {
                return deleteMutate(params)
            }
            return updateMutate(params)
        },
    }
}
