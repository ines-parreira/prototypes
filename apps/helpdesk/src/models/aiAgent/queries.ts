import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { UseQueryOptions } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    createOnboardingNotificationState,
    createStoreConfiguration,
    createStoreSnippetHelpCenter,
    createWelcomePageAcknowledged,
    getAccountConfiguration,
    getAiAgentStoreHandoverConfigurations,
    getOnboardingNotificationState,
    getStoreConfiguration,
    getStoresConfigurations,
    getTrials,
    getWelcomePageAcknowledged,
    optOutAiAgentTrialUpgrade,
    optOutSalesTrialUpgrade,
    startAiAgentTrial,
    startSalesTrial,
    upsertAccountConfiguration,
    upsertAiAgentStoreHandoverConfiguration,
    upsertOnboardingNotificationState,
    upsertStoreConfiguration,
    upsertStoresConfiguration,
} from 'models/aiAgent/resources/configuration'
import {
    searchCustomer,
    searchTickets,
} from 'models/aiAgentPlayground/resources'
import type {
    SearchCustomerRequest,
    SearchTicketsRequest,
} from 'models/aiAgentPlayground/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type { Paths } from 'rest_api/help_center_api/client.generated'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { MutationOverrides } from 'types/query'

import { createContextAndTriggerAIJourney } from './resources/ai-journey'
import { getAIGeneratedGuidances } from './resources/guidances'
import {
    createContextAndGenerateCustomToneOfVoicePreview,
    createContextAndSubmitPlaygroundTicket,
} from './resources/message-processing'
import {
    createTestSession,
    getPlaygroundExecutions,
    getTestSessionLogs,
    submitTestSessionMessage,
} from './resources/playground'
import type {
    GetOnboardingNotificationStateParams,
    GetPlaygroundExecutionsParams,
    GetStoreConfigurationForAccountParams,
    GetStoreConfigurationParams,
    GetStoreHandoverConfigurationParams,
    ResponseTrial,
    Trial,
} from './types'

export const STALE_TIME_MS = 10 * 60 * 1000 // 10 minutes
export const CACHE_TIME_MS = 20 * 60 * 1000 // 20 minutes

const transformResponseTrialToTrial = (
    responseTrial: ResponseTrial,
): Trial => ({
    ...responseTrial,
    type:
        responseTrial.type === 'ai-trial'
            ? TrialType.AiAgent
            : TrialType.ShoppingAssistant,
})

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
        [
            ...storeConfigurationKeys.accounts(),
            Object.values(params).join(','),
        ] as const,
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

export const useGetStoresConfigurationForAccount = <
    TData = Awaited<ReturnType<typeof getStoresConfigurations>>,
>(
    params: GetStoreConfigurationForAccountParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getStoresConfigurations>>,
        unknown,
        TData
    >,
) => {
    const parsedParams = {
        accountDomain: params.accountDomain,
    }

    const queryFn = async () => {
        return await getStoresConfigurations(parsedParams.accountDomain, {
            withWizard: true,
            withFloatingInput: true,
        }).catch((e: AxiosError) => {
            throw e
        })
    }

    return useQuery({
        queryKey: storeConfigurationKeys.account({
            accountDomain: parsedParams.accountDomain,
        }),
        queryFn,
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        enabled: !!parsedParams.accountDomain && (overrides?.enabled ?? true),
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

export const searchTicketKeys = {
    search: (query: string) => ['searchTickets', query] as const,
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
        enabled: false,
        ...overrides,
    })
}

export const useSearchTickets = (
    params: SearchTicketsRequest,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof searchTickets>>>,
) => {
    return useQuery({
        queryKey: searchTicketKeys.search(params.query),
        queryFn: () => searchTickets(params.query),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}

export const useCreateTestSessionMutation = (
    overrides?: MutationOverrides<typeof createTestSession>,
) => {
    return useMutation({
        mutationFn: (params) => createTestSession(...params),
        ...overrides,
    })
}

export const useSubmitTestModeMessageMutation = (
    overrides?: MutationOverrides<typeof submitTestSessionMessage>,
) => {
    return useMutation({
        mutationFn: (params) => submitTestSessionMessage(...params),
        ...overrides,
    })
}

export const testSessionLogsKeys = {
    all: () => ['aiAgentTestSessionLogs'] as const,
    logs: (testSessionId: string) =>
        [...testSessionLogsKeys.all(), testSessionId] as const,
}

export const useGetTestSessionLogs = (
    testSessionId: string,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getTestSessionLogs>>
    > & {
        baseUrl?: string
    },
) => {
    const { baseUrl, ...queryOverrides } = overrides || {}
    return useQuery({
        queryKey: testSessionLogsKeys.logs(testSessionId),
        queryFn: () => getTestSessionLogs(testSessionId, baseUrl),
        ...queryOverrides,
    })
}

export const useTriggerAIJourney = (
    overrides?: MutationOverrides<typeof createContextAndTriggerAIJourney>,
) => {
    return useMutation({
        mutationFn: (params) => createContextAndTriggerAIJourney(...params),
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

    const isAiAgentAIGeneratedGuidancesEnabled = useFlag(
        FeatureFlagKey.AiAgentAIGeneratedGuidances,
    )

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
    overrides?: UseQueryOptions<Awaited<
        ReturnType<typeof getOnboardingNotificationState>
    > | null>,
) => {
    const { accountDomain, storeName } = params

    return useQuery({
        queryKey: onboardingNotificationStateKeys.detail(params),
        queryFn: async (): Promise<Awaited<
            ReturnType<typeof getOnboardingNotificationState>
        > | null> => {
            try {
                const fetchData = await getOnboardingNotificationState(
                    accountDomain,
                    storeName,
                )

                if (
                    !fetchData.data.onboardingNotificationState &&
                    !!storeName
                ) {
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
            } catch (error) {
                // If we get a 403 error, the account is out of sync
                // Don't attempt to create a new resource, just return null
                if (
                    error instanceof AxiosError &&
                    error.response?.status === 403
                ) {
                    return null
                }
                // For any other error, let it throw so React Query can handle retries
                throw error
            }
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

export const handoverConfigurationKeys = {
    all: () => ['aiAgentHandoverConfigurations'] as const,
    details: () => [...handoverConfigurationKeys.all(), 'detail'] as const,
    detail: (params: GetStoreHandoverConfigurationParams) =>
        [...handoverConfigurationKeys.details(), params] as const,
}

export const trialsKeys = {
    all: () => ['aiAgentTrials'] as const,
    list: (gorgiasDomain: string) =>
        [...trialsKeys.all(), gorgiasDomain] as const,
}

export const useGetStoreHandoverConfigurations = (
    params: GetStoreHandoverConfigurationParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAiAgentStoreHandoverConfigurations>>
    >,
) => {
    return useQuery({
        queryKey: handoverConfigurationKeys.detail(params),
        queryFn: () =>
            getAiAgentStoreHandoverConfigurations(
                params.accountDomain,
                params.storeName,
                params.channel,
            ),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        enabled: !!params.accountDomain && !!params.storeName,
        ...overrides,
    })
}

export const useUpsertStoreHandoverConfiguration = (
    overrides?: MutationOverrides<
        typeof upsertAiAgentStoreHandoverConfiguration
    >,
) => {
    return useMutation({
        mutationFn: (params) =>
            upsertAiAgentStoreHandoverConfiguration(...params),
        ...overrides,
    })
}

export const useGetTrials = (
    gorgiasDomain: string,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getTrials>>,
        unknown,
        Trial[]
    >,
) => {
    return useQuery({
        queryKey: trialsKeys.list(gorgiasDomain),
        queryFn: async () => {
            try {
                return await getTrials(gorgiasDomain)
            } catch (error) {
                if (
                    error instanceof AxiosError &&
                    error.response?.status === 404
                ) {
                    return []
                }
                throw error
            }
        },
        select: (data) => data.map(transformResponseTrialToTrial),
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
        enabled: !!gorgiasDomain && (overrides?.enabled ?? true),
    })
}

/**
 * AI Agent Trial endpoints
 */
export const useStartAiAgentTrialMutation = (
    overrides?: Omit<
        MutationOverrides<
            (
                ...params: [
                    shopType: string,
                    storeName: string,
                    optedInForUpgrade?: boolean,
                ]
            ) => ReturnType<typeof startAiAgentTrial>
        >,
        'mutationFn'
    >,
) => {
    const queryClient = useQueryClient()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    return useMutation({
        mutationFn: ([shopType, storeName, optedInForUpgrade]) =>
            startAiAgentTrial(
                accountDomain,
                shopType,
                storeName,
                optedInForUpgrade,
            ),
        onSuccess: (...args) => {
            // Invalidate store configurations to refresh trial state
            queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.all(),
            })
            queryClient.invalidateQueries({
                queryKey: trialsKeys.all(),
            })
            // Invalidate onboarding data to refresh onboarding state because onboarding is created when trial is started
            queryClient.invalidateQueries({
                queryKey: ['onboardingData', 'all'],
            })
            overrides?.onSuccess?.(...args)
        },
        onError: (...args) => {
            overrides?.onError?.(...args)
        },
        ...overrides,
    })
}

export const useOptOutAiAgentTrialUpgradeMutation = (
    overrides?: MutationOverrides<() => unknown>,
) => {
    const queryClient = useQueryClient()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    return useMutation({
        mutationFn: () => optOutAiAgentTrialUpgrade(accountDomain),
        ...overrides,
        onSuccess: (...args) => {
            // Invalidate store configurations to refresh trial state
            queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.all(),
            })
            queryClient.invalidateQueries({
                queryKey: trialsKeys.all(),
            })
            overrides?.onSuccess?.(...args)
        },
        onError: (...args) => {
            overrides?.onError?.(...args)
        },
    })
}

// Sales endpoints
export const useStartSalesTrialMutation = (
    overrides?: Omit<
        MutationOverrides<(storeName: string) => unknown>,
        'mutationFn'
    >,
) => {
    const queryClient = useQueryClient()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    return useMutation({
        mutationFn: ([storeName]) =>
            startSalesTrial(accountDomain, 'shopify', storeName),
        onSuccess: () => {
            // Invalidate store configurations to refresh trial state
            void queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.all(),
            })
            void queryClient.invalidateQueries({
                queryKey: trialsKeys.all(),
            })
        },
        ...overrides,
    })
}

export const useOptOutSalesTrialUpgradeMutation = (
    overrides?: MutationOverrides<() => unknown>,
) => {
    const queryClient = useQueryClient()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const dispatch = useAppDispatch()

    return useMutation({
        mutationFn: () => optOutSalesTrialUpgrade(accountDomain),
        onSuccess: (...args) => {
            // Invalidate store configurations to refresh trial state
            void queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.all(),
            })
            void queryClient.invalidateQueries({
                queryKey: trialsKeys.all(),
            })
            overrides?.onSuccess?.(...args)
        },
        onError: (...args) => {
            void dispatch(
                notify({
                    message: 'Failed to upgrade plan. Please try again later.',
                    status: NotificationStatus.Error,
                }),
            )
            overrides?.onError?.(...args)
        },
        ...overrides,
    })
}
