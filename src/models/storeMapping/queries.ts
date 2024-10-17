import {UseQueryOptions, useMutation, useQuery} from '@tanstack/react-query'

import {AxiosError} from 'axios'
import {MutationOverrides} from '../../types/query'
import {
    listStoreMappings,
    createStoreMapping,
    updateStoreMapping,
    deleteStoreMapping,
} from './resources'

export const storeMappingKeys = {
    all: () => ['store-mapping'] as const,
    list: (integrationIds: number[]) =>
        [...storeMappingKeys.all(), ...integrationIds, 'list'] as const,
}

export const useListStoreMappings = <
    TData = Awaited<ReturnType<typeof listStoreMappings>>,
>(
    integrationIds: number[],
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof listStoreMappings>>,
        AxiosError,
        TData
    >
) => {
    return useQuery({
        queryKey: storeMappingKeys.list(integrationIds),
        queryFn: () => listStoreMappings(integrationIds),
        ...overrides,
    })
}

export const useCreateStoreMapping = (
    overrides?: MutationOverrides<typeof createStoreMapping>
) => {
    return useMutation({
        mutationFn: (params) => createStoreMapping(...params),
        ...overrides,
    })
}

export const useUpdateStoreMapping = (
    overrides?: MutationOverrides<typeof updateStoreMapping>
) => {
    return useMutation({
        mutationFn: (params) => updateStoreMapping(...params),
        ...overrides,
    })
}

export const useDeleteStoreMapping = (
    overrides?: MutationOverrides<typeof deleteStoreMapping>
) => {
    return useMutation({
        mutationFn: (params) => deleteStoreMapping(...params),
        ...overrides,
    })
}
