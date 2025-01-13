import {UseQueryOptions, useMutation, useQuery} from '@tanstack/react-query'

import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import * as CloudFunctionConfig from 'models/aiAgent/resources/cloud-function-configuration'
import * as KubernetesConfig from 'models/aiAgent/resources/configuration'
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
} from 'models/aiAgent/resources/configuration'
import {searchCustomer} from 'models/aiAgentPlayground/resources'
import {SearchCustomerRequest} from 'models/aiAgentPlayground/types'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {Paths} from 'rest_api/help_center_api/client.generated'
import {MutationOverrides} from 'types/query'

import {getAIGeneratedGuidances} from './resources/guidances'
import {
    createContextAndGenerateCustomToneOfVoicePreview,
    createContextAndSubmitPlaygroundTicket,
} from './resources/message-processing'
import {
    GetOnboardingNotificationStateParams,
    GetStoreConfigurationParams,
} from './types'

export const STALE_TIME_MS = 10 * 60 * 1000 // 10 minutes
export const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

// Factory function to select the appropriate manager
function getConfigManager(useKubernetes: boolean) {
    return useKubernetes ? KubernetesConfig : CloudFunctionConfig
}

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
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {getAccountConfiguration} = getConfigManager(
        useKubernetesConfigManager
    )

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
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {upsertAccountConfiguration} = getConfigManager(
        useKubernetesConfigManager
    )

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
    detail: (params: GetStoreConfigurationParams) =>
        [...storeConfigurationKeys.details(), params] as const,
}

export const useGetStoreConfigurationPure = (
    params: GetStoreConfigurationParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getStoreConfiguration>>
    >
) => {
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {getStoreConfiguration} = getConfigManager(useKubernetesConfigManager)

    return useQuery({
        queryKey: storeConfigurationKeys.detail(params),
        queryFn: () => getStoreConfiguration(params),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useCreateStoreConfigurationPure = (
    overrides?: MutationOverrides<typeof createStoreConfiguration>
) => {
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {createStoreConfiguration} = getConfigManager(
        useKubernetesConfigManager
    )

    return useMutation({
        mutationFn: (params) => createStoreConfiguration(...params),
        ...overrides,
    })
}

export const useUpsertStoreConfigurationPure = (
    overrides?: MutationOverrides<typeof upsertStoreConfiguration>
) => {
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {upsertStoreConfiguration} = getConfigManager(
        useKubernetesConfigManager
    )

    return useMutation({
        mutationFn: (params) => upsertStoreConfiguration(...params),
        ...overrides,
    })
}

export const useCreateStoreSnippetHelpCenter = (
    overrides?: MutationOverrides<typeof createStoreSnippetHelpCenter>
) => {
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {createStoreSnippetHelpCenter} = getConfigManager(
        useKubernetesConfigManager
    )

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
    TData = Awaited<ReturnType<typeof getAIGeneratedGuidances>>,
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

    const isAiAgentAIGeneratedGuidancesEnabled =
        useFlags()[FeatureFlagKey.AiAgentAIGeneratedGuidances]

    return useQuery({
        queryKey: aiGeneratedGuidanceKeys.listWithStore(
            helpCenterId,
            storeIntegrationId
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
    >
) => {
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {getWelcomePageAcknowledged} = getConfigManager(
        useKubernetesConfigManager
    )

    return useQuery({
        queryKey: getWelcomePageAcknowledgedKey(storeName),
        queryFn: () => getWelcomePageAcknowledged(accountDomain, storeName),
        ...overrides,
    })
}

export const useCreateWelcomePageAcknowledged = (
    overrides?: MutationOverrides<typeof createWelcomePageAcknowledged>
) => {
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {createWelcomePageAcknowledged} = getConfigManager(
        useKubernetesConfigManager
    )

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
    >
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
    >
) => {
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {getOnboardingNotificationState} = getConfigManager(
        useKubernetesConfigManager
    )

    return useQuery({
        queryKey: onboardingNotificationStateKeys.detail(params),
        queryFn: () =>
            getOnboardingNotificationState(
                params.accountDomain,
                params.storeName
            ),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useGetOrCreateOnboardingNotificationState = (
    params: GetOnboardingNotificationStateParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getOnboardingNotificationState>>
    >
) => {
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {getOnboardingNotificationState, createOnboardingNotificationState} =
        getConfigManager(useKubernetesConfigManager)

    const {accountDomain, storeName} = params

    return useQuery({
        queryKey: onboardingNotificationStateKeys.detail(params),
        queryFn: async () => {
            const fetchData = await getOnboardingNotificationState(
                accountDomain,
                storeName
            )

            if (!fetchData?.data.onboardingNotificationState) {
                const createdData = await createOnboardingNotificationState(
                    accountDomain,
                    storeName,
                    {
                        shopName: storeName,
                    }
                )

                return createdData
            }

            return fetchData
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useCreateOnboardingNotificationState = (
    overrides?: MutationOverrides<typeof createOnboardingNotificationState>
) => {
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {createOnboardingNotificationState} = getConfigManager(
        useKubernetesConfigManager
    )

    return useMutation({
        mutationFn: (params) => createOnboardingNotificationState(...params),
        ...overrides,
    })
}

export const useUpsertOnboardingNotificationState = (
    overrides?: MutationOverrides<typeof upsertOnboardingNotificationState>
) => {
    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]

    const {upsertOnboardingNotificationState} = getConfigManager(
        useKubernetesConfigManager
    )

    return useMutation({
        mutationFn: (params) => upsertOnboardingNotificationState(...params),
        ...overrides,
    })
}
