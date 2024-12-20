import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import axios from 'axios'

import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    CACHE_TIME_MS,
    STALE_TIME_MS,
    accountConfigurationKeys,
} from 'models/aiAgent/queries'
import * as CloudFunctionConfig from 'models/aiAgent/resources/cloud-function-configuration'
import * as KubernetesConfig from 'models/aiAgent/resources/configuration'
import {getAccountConfiguration} from 'models/aiAgent/resources/configuration'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

// Factory function to select the appropriate manager
function getConfigManager(useKubernetes: boolean) {
    return useKubernetes ? KubernetesConfig : CloudFunctionConfig
}

export function useGetOrCreateAccountConfiguration(
    params: {
        accountId: number
        accountDomain: string
        storeNames: string[]
    },
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAccountConfiguration>>
    >
) {
    const dispatch = useAppDispatch()

    const useKubernetesConfigManager =
        useFlags()[FeatureFlagKey.AiAgentKubernetesConfigManager]
    const {getAccountConfiguration, createAccountConfiguration} =
        getConfigManager(useKubernetesConfigManager)

    const {accountId, accountDomain, storeNames} = params
    return useQuery({
        queryKey: accountConfigurationKeys.detail(accountDomain),
        queryFn: async () => {
            try {
                return await getAccountConfiguration(accountDomain)
            } catch (error) {
                if (
                    !axios.isAxiosError(error) ||
                    error.response?.status !== 404
                ) {
                    throw error
                }

                void dispatch(
                    notify({
                        message: 'Initializing AI Agent',
                        status: NotificationStatus.Loading,
                        closeOnNext: true,
                    })
                )
                return await createAccountConfiguration({
                    accountId,
                    gorgiasDomain: accountDomain,
                    storeNames,
                    helpdeskOAuth: null,
                })
            }
        },
        onError: () => {
            void dispatch(
                notify({
                    message: 'An error occurred while loading the AI Agent',
                    status: NotificationStatus.Error,
                })
            )
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}
