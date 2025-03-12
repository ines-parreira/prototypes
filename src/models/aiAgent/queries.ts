import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { AxiosError, AxiosResponse } from 'axios'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import {
    createOnboardingNotificationState,
    createStoreConfiguration,
    createStoreSnippetHelpCenter,
    createWelcomePageAcknowledged,
    getAccountConfiguration,
    getOnboardingNotificationState,
    getStoreConfiguration,
    getWelcomePageAcknowledged,
    upsertAccountConfiguration,
    upsertOnboardingNotificationState,
    upsertStoreConfiguration,
    upsertStoresConfiguration,
} from 'models/aiAgent/resources/configuration'
import { searchCustomer } from 'models/aiAgentPlayground/resources'
import { SearchCustomerRequest } from 'models/aiAgentPlayground/types'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { Paths } from 'rest_api/help_center_api/client.generated'
import { MutationOverrides } from 'types/query'

import { getAIGeneratedGuidances } from './resources/guidances'
import {
    createContextAndGenerateCustomToneOfVoicePreview,
    createContextAndSubmitPlaygroundTicket,
} from './resources/message-processing'
import { getPlaygroundExecutions } from './resources/playground'
import {
    GetOnboardingNotificationStateParams,
    GetPlaygroundExecutionsParams,
    GetStoreConfigurationForAccountParams,
    GetStoreConfigurationParams,
    StoreConfigurationResponse,
} from './types'

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
    >,
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
    overrides?: MutationOverrides<typeof upsertAccountConfiguration>,
) => {
    return useMutation({
        mutationFn: (params) => upsertAccountConfiguration(...params),
        ...overrides,
    })
}

export const storeConfigurationKeys = {
    all: () => ['aiAgentStoreConfigurations'] as const,
    lists: () => [...storeConfigurationKeys.all(), 'list'] as const,
    list: (params: { query: string }) =>
        [...storeConfigurationKeys.lists(), params] as const,
    details: () => [...storeConfigurationKeys.all(), 'detail'] as const,
    detail: (params: GetStoreConfigurationParams) =>
        [...storeConfigurationKeys.details(), params] as const,
    accounts: () => [...storeConfigurationKeys.all(), 'account'] as const,
    account: (params: GetStoreConfigurationForAccountParams) =>
        [...storeConfigurationKeys.accounts(), params] as const,
}

export const useGetStoreConfigurationPure = (
    params: GetStoreConfigurationParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getStoreConfiguration>>
    >,
) => {
    return useQuery({
        queryKey: storeConfigurationKeys.detail(params),
        queryFn: () => getStoreConfiguration(params),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        enabled:
            !!params.accountDomain &&
            !!params.storeName &&
            (overrides?.enabled ?? true),
        ...overrides,
    })
}

// TODO: expose a new API that returns the configuration for each stores in the account. In the meantime we need to pass a list of stores.
export const useGetStoresConfigurationForAccount = (
    params: GetStoreConfigurationForAccountParams,
    overrides?: UseQueryOptions<
        AxiosResponse<StoreConfigurationResponse | undefined>[]
    >,
) => {
    const queryFn = () => {
        const getAllStoreConfigurationPromise: Promise<
            AxiosResponse<StoreConfigurationResponse | undefined>
        >[] = []

        for (const storeName of params.storesName) {
            getAllStoreConfigurationPromise.push(
                getStoreConfiguration({ ...params, storeName }).catch(
                    (e: AxiosError) => {
                        if (e.status === 404) {
                            return e.response as AxiosResponse<undefined>
                        }
                        throw e
                    },
                ),
            )
        }

        return Promise.all(getAllStoreConfigurationPromise)
    }

    return useQuery({
        queryKey: storeConfigurationKeys.account(params),
        queryFn,
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        enabled:
            !!params.accountDomain &&
            !!params.storesName.length &&
            (overrides?.enabled ?? true),
        ...overrides,
    })
}

export const useCreateStoreConfigurationPure = (
    overrides?: MutationOverrides<typeof createStoreConfiguration>,
) => {
    return useMutation({
        mutationFn: (params) => createStoreConfiguration(...params),
        ...overrides,
    })
}

export const useUpsertStoresConfigurationPure = (
    overrides?: MutationOverrides<typeof upsertStoresConfiguration>,
) => {
    return useMutation({
        mutationFn: (params) => upsertStoresConfiguration(...params),
        ...overrides,
    })
}

export const useUpsertStoreConfigurationPure = (
    overrides?: MutationOverrides<typeof upsertStoreConfiguration>,
) => {
    return useMutation({
        mutationFn: (params) => upsertStoreConfiguration(...params),
        ...overrides,
    })
}

export const useCreateStoreSnippetHelpCenter = (
    overrides?: MutationOverrides<typeof createStoreSnippetHelpCenter>,
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
    overrides?: MutationOverrides<
        typeof createContextAndSubmitPlaygroundTicket
    >,
) =>
    useMutation({
        mutationFn: (body) => createContextAndSubmitPlaygroundTicket(...body),
        ...overrides,
    })

export const useSearchCustomer = (
    params: SearchCustomerRequest,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof searchCustomer>>>,
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
        storeIntegrationId: number | null,
    ) => [
        ...aiGeneratedGuidanceKeys.list(helpCenterId),
        'store',
        storeIntegrationId,
    ],
}

export const useGetAIGeneratedGuidances = <
    TData = Awaited<ReturnType<typeof getAIGeneratedGuidances>>,
>(
    helpCenterId: Paths.ListAIGuidancesByHelpCenterAndStore.Parameters.HelpCenterId | null,
    storeIntegrationId: Paths.ListAIGuidancesByHelpCenterAndStore.Parameters.StoreIntegrationId | null,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAIGeneratedGuidances>>,
        unknown,
        TData
    >,
) => {
    const { client } = useHelpCenterApi()

    const isAiAgentAIGeneratedGuidancesEnabled =
        useFlags()[FeatureFlagKey.AiAgentAIGeneratedGuidances]

    return useQuery({
        queryKey: aiGeneratedGuidanceKeys.listWithStore(
            helpCenterId,
            storeIntegrationId,
        ),
        queryFn: async () => {
            if (
                storeIntegrationId === null ||
                helpCenterId === null ||
                !isAiAgentAIGeneratedGuidancesEnabled
            ) {
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

// Welcome page
export const getWelcomePageAcknowledgedKey = (storeName: string) =>
    ['ai-agent-welcome-page-acknowledged', storeName] as const

export const useGetWelcomePageAcknowledged = (
    accountDomain: string,
    storeName: string,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getWelcomePageAcknowledged>>
    >,
) => {
    return useQuery({
        queryKey: getWelcomePageAcknowledgedKey(storeName),
        queryFn: () => getWelcomePageAcknowledged(accountDomain, storeName),
        ...overrides,
    })
}

export const useCreateWelcomePageAcknowledged = (
    overrides?: MutationOverrides<typeof createWelcomePageAcknowledged>,
) => {
    return useMutation({
        mutationFn: ([accountDomain, storeName]) =>
            createWelcomePageAcknowledged(accountDomain, storeName),
        ...overrides,
    })
}

// Custom tone of voice preview
export const useGenerateCustomToneOfVoicePreview = (
    overrides?: MutationOverrides<
        typeof createContextAndGenerateCustomToneOfVoicePreview
    >,
) =>
    useMutation({
        mutationFn: (body) =>
            createContextAndGenerateCustomToneOfVoicePreview(...body),
        ...overrides,
    })

// Onboarding notification state
export const onboardingNotificationStateKeys = {
    all: () => ['aiAgentOnboardingNotificationState'] as const,
    details: () =>
        [...onboardingNotificationStateKeys.all(), 'detail'] as const,
    detail: (params: GetOnboardingNotificationStateParams) =>
        [...onboardingNotificationStateKeys.details(), params] as const,
}

export const useGetOnboardingNotificationState = (
    params: GetOnboardingNotificationStateParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getOnboardingNotificationState>>
    >,
) => {
    return useQuery({
        queryKey: onboardingNotificationStateKeys.detail(params),
        queryFn: () =>
            getOnboardingNotificationState(
                params.accountDomain,
                params.storeName,
            ),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        enabled: !!params.accountDomain && !!params.storeName,
        ...overrides,
    })
}

export const useGetOrCreateOnboardingNotificationState = (
    params: GetOnboardingNotificationStateParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getOnboardingNotificationState>>
    >,
) => {
    const { accountDomain, storeName } = params

    return useQuery({
        queryKey: onboardingNotificationStateKeys.detail(params),
        queryFn: async () => {
            const fetchData = await getOnboardingNotificationState(
                accountDomain,
                storeName,
            )

            if (!fetchData?.data.onboardingNotificationState && !!storeName) {
                const createdData = await createOnboardingNotificationState(
                    accountDomain,
                    storeName,
                    {
                        shopName: storeName,
                    },
                )

                return createdData
            }

            return fetchData
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        enabled: !!accountDomain && !!storeName && (overrides?.enabled ?? true),
        ...overrides,
    })
}

export const useCreateOnboardingNotificationState = (
    overrides?: MutationOverrides<typeof createOnboardingNotificationState>,
) => {
    return useMutation({
        mutationFn: (params) => createOnboardingNotificationState(...params),
        ...overrides,
    })
}

export const useUpsertOnboardingNotificationState = (
    overrides?: MutationOverrides<typeof upsertOnboardingNotificationState>,
) => {
    return useMutation({
        mutationFn: (params) => upsertOnboardingNotificationState(...params),
        ...overrides,
    })
}

export const playgroundExecutionsKeys = {
    all: () => ['aiAgentPlaygroundExecutions'] as const,
    details: () => [...playgroundExecutionsKeys.all(), 'detail'] as const,
    detail: (params: GetPlaygroundExecutionsParams) =>
        [...playgroundExecutionsKeys.details(), params] as const,
}

export const useGetPlaygroundExecutions = (
    params: GetPlaygroundExecutionsParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getPlaygroundExecutions>>
    >,
) => {
    return useQuery({
        queryKey: playgroundExecutionsKeys.detail(params),
        queryFn: () =>
            getPlaygroundExecutions(params.accountDomain, params.storeName),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        enabled: !!params.accountDomain && !!params.storeName,
        ...overrides,
    })
}
