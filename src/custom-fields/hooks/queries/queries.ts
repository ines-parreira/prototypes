// Will be autogenerate with API SDK
import {ObjectType} from '@gorgias/api-queries'
import {useMutation, useQuery, UseQueryOptions} from '@tanstack/react-query'

import {
    createCustomField,
    deleteCustomFieldValue,
    getCustomField,
    getCustomFields,
    getCustomFieldValues,
    updateCustomField,
    updateCustomFields,
    updateCustomFieldValue,
    updatePartialCustomField,
} from 'custom-fields/resources'
import {ListParams} from 'custom-fields/types'
import {MutationOverrides} from 'types/query'

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
    objectType: (objectType: ObjectType, holderId: number) =>
        [...customFieldValueKeys.all(), objectType, holderId] as const,
    value: (id: number) => [...customFieldValueKeys.all(), id] as const,
}

export type UseGetCustomFieldDefinitions = Awaited<
    ReturnType<typeof getCustomFields>
>

export const useGetCustomFieldDefinitions = <
    TData = UseGetCustomFieldDefinitions,
>(
    params: ListParams,
    overrides?: UseQueryOptions<UseGetCustomFieldDefinitions, unknown, TData>
) => {
    return useQuery({
        queryKey: customFieldDefinitionKeys.list(params),
        queryFn: () => getCustomFields(params),
        ...overrides,
    })
}

export const useGetCustomFieldDefinition = <
    TData = Awaited<ReturnType<typeof getCustomField>>,
>(
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

export const useCreateCustomField = (
    overrides?: MutationOverrides<typeof createCustomField>
) => {
    return useMutation({
        mutationFn: (params) => createCustomField(...params),
        ...overrides,
    })
}

export const useUpdateCustomField = (
    overrides?: MutationOverrides<typeof updateCustomField>
) => {
    return useMutation({
        mutationFn: (params) => updateCustomField(...params),
        ...overrides,
    })
}

export const useUpdateCustomFields = (
    overrides?: MutationOverrides<typeof updateCustomFields>
) => {
    return useMutation({
        mutationFn: (params) => updateCustomFields(...params),
        ...overrides,
    })
}

export const useUpdatePartialCustomField = (
    overrides?: MutationOverrides<typeof updatePartialCustomField>
) => {
    return useMutation({
        mutationFn: (params) => updatePartialCustomField(...params),
        ...overrides,
    })
}

// values

export const useGetCustomFieldValues = <
    TData = Awaited<ReturnType<typeof getCustomFieldValues>>,
>(
    {
        object_type,
        holderId,
    }: {
        object_type: ObjectType
        holderId: number
    },
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getCustomFieldValues>>,
        unknown,
        TData
    >
) => {
    return useQuery({
        queryKey: customFieldValueKeys.objectType(object_type, holderId),
        queryFn: () => getCustomFieldValues({object_type, holderId}),
        ...overrides,
    })
}

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
