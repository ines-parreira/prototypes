import {useQuery, UseQueryOptions, useMutation} from '@tanstack/react-query'

import {MutationOverrides} from 'types/query'
import {
    GetAccountConfigurationParams,
    GetStoreConfigurationParams,
} from './types'
import {
    getAccountConfiguration,
    getStoreConfiguration,
    upsertAccountConfiguration,
    upsertStoreConfiguration,
} from './resources'

const STALE_TIME_MS = 10 * 60 * 1000 // 10 minutes
const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

export const storeConfigurationKeys = {
    all: () => ['storeConfigurations'] as const,
    storeConfiguration: (storeName: string) =>
        [...storeConfigurationKeys.all(), storeName] as const,
}

export const useGetStoreConfigurationPure = (
    params: GetStoreConfigurationParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getStoreConfiguration>>
    >
) => {
    return useQuery({
        queryKey: storeConfigurationKeys.storeConfiguration(params.storeName),
        queryFn: () => getStoreConfiguration(params),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useUpsertStoreConfigurationPure = (
    overrides?: MutationOverrides<typeof upsertStoreConfiguration>
) => {
    return useMutation({
        mutationFn: (params) => upsertStoreConfiguration(...params),
        ...overrides,
    })
}

export const accountConfigurationKeys = {
    accountConfiguration: () => ['accountConfiguration'] as const,
}

export const useGetAccountConfiguration = (
    params: GetAccountConfigurationParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAccountConfiguration>>
    >
) => {
    return useQuery({
        queryKey: accountConfigurationKeys.accountConfiguration(),
        queryFn: () => getAccountConfiguration(params),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useUpsertAccountConfiguration = (
    overrides?: MutationOverrides<typeof upsertAccountConfiguration>
) => {
    return useMutation({
        mutationFn: (params) => upsertAccountConfiguration(...params),
        ...overrides,
    })
}
