import {UseQueryOptions, useMutation, useQuery} from '@tanstack/react-query'

import {searchCustomer} from 'models/aiAgentPlayground/resources'
import {SearchCustomerRequest} from 'models/aiAgentPlayground/types'
import {MutationOverrides} from 'types/query'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {Paths} from 'rest_api/help_center_api/client.generated'
import {
    createStoreConfiguration,
    createStoreSnippetHelpCenter,
    getAccountConfiguration,
    getStoreConfiguration,
    upsertAccountConfiguration,
    upsertStoreConfiguration,
} from './resources/account-configuration'
import {createContextAndSubmitPlaygroundTicket} from './resources/message-processing'
import {GetStoreConfigurationParams} from './types'
import {getAIGeneratedGuidances} from './resources/guidances'

export const STALE_TIME_MS = 10 * 60 * 1000 // 10 minutes
export const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

export const accountConfigurationKeys = {
    all: () => ['aiAgentAccountConfigurations'] as const,
    details: () => [...accountConfigurationKeys.all(), 'detail'] as const,
    detail: (accountDomain: string) =>
        [...accountConfigurationKeys.details(), accountDomain] as const,
}

export const useGetAccountConfiguration = (
    accountDomain: string,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAccountConfiguration>>
    >
) => {
    return useQuery({
        queryKey: accountConfigurationKeys.detail(accountDomain),
        queryFn: () => getAccountConfiguration(accountDomain),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useUpsertAccountConfigurationPure = (
    overrides?: MutationOverrides<typeof upsertAccountConfiguration>
) => {
    return useMutation({
        mutationFn: (params) => upsertAccountConfiguration(...params),
        ...overrides,
    })
}

export const storeConfigurationKeys = {
    all: () => ['aiAgentStoreConfigurations'] as const,
    lists: () => [...storeConfigurationKeys.all(), 'list'] as const,
    list: (params: {query: string}) =>
        [...storeConfigurationKeys.lists(), params] as const,
    details: () => [...storeConfigurationKeys.all(), 'detail'] as const,
    detail: (storeName: string) =>
        [...storeConfigurationKeys.details(), storeName] as const,
}

export const useGetStoreConfigurationPure = (
    params: GetStoreConfigurationParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getStoreConfiguration>>
    >
) => {
    return useQuery({
        queryKey: storeConfigurationKeys.detail(params.storeName),
        queryFn: () => getStoreConfiguration(params),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useCreateStoreConfigurationPure = (
    overrides?: MutationOverrides<typeof createStoreConfiguration>
) => {
    return useMutation({
        mutationFn: (params) => createStoreConfiguration(...params),
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

export const useCreateStoreSnippetHelpCenter = (
    overrides?: MutationOverrides<typeof createStoreSnippetHelpCenter>
) => {
    return useMutation({
        mutationFn: (params) => createStoreSnippetHelpCenter(...params),
        ...overrides,
    })
}

// Playground
export const searchCustomerKeys = {
    search: (customerEmail: string) => ['search', customerEmail] as const,
}

export const useSubmitPlaygroundTicket = (
    overrides?: MutationOverrides<typeof createContextAndSubmitPlaygroundTicket>
) =>
    useMutation({
        mutationFn: (body) => createContextAndSubmitPlaygroundTicket(...body),
        ...overrides,
    })

export const useSearchCustomer = (
    params: SearchCustomerRequest,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof searchCustomer>>>
) => {
    return useQuery({
        queryKey: searchCustomerKeys.search(params.email),
        queryFn: () => searchCustomer(params),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

// Guidances
export const aiGeneratedGuidanceKeys = {
    all: () => ['aiGuidances'] as const,
    lists: () => [...aiGeneratedGuidanceKeys.all(), 'list'] as const,
    list: (helpCenterId: number | null) =>
        [...aiGeneratedGuidanceKeys.lists(), helpCenterId] as const,
    listWithStore: (
        helpCenterId: number | null,
        storeIntegrationId: number | null
    ) => [
        ...aiGeneratedGuidanceKeys.list(helpCenterId),
        'store',
        storeIntegrationId,
    ],
}

export const useGetAIGeneratedGuidances = <
    TData = Awaited<ReturnType<typeof getAIGeneratedGuidances>>
>(
    helpCenterId: Paths.ListAIGuidancesByHelpCenterAndStore.Parameters.HelpCenterId | null,
    storeIntegrationId: Paths.ListAIGuidancesByHelpCenterAndStore.Parameters.StoreIntegrationId | null,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAIGeneratedGuidances>>,
        unknown,
        TData
    >
) => {
    const {client} = useHelpCenterApi()

    return useQuery({
        queryKey: aiGeneratedGuidanceKeys.listWithStore(
            helpCenterId,
            storeIntegrationId
        ),
        queryFn: async () => {
            if (storeIntegrationId === null || helpCenterId === null) {
                return Promise.resolve(null)
            }
            return getAIGeneratedGuidances(client, {
                help_center_id: helpCenterId,
                store_integration_id: storeIntegrationId,
            })
        },
        enabled:
            !!client && storeIntegrationId !== null && helpCenterId !== null,
        ...overrides,
    })
}
