import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import axios from 'axios'

import {notify} from 'state/notifications/actions'
import {
    CACHE_TIME_MS,
    STALE_TIME_MS,
    accountConfigurationKeys,
} from 'models/aiAgent/queries'
import {
    getAccountConfiguration,
    createAccountConfiguration,
} from 'models/aiAgent/resources/account-configuration'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'

export function useGetOrCreateAccountConfiguration(
    params: {
        accountId: number
        accountDomain: string
    },
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getAccountConfiguration>>
    >
) {
    const dispatch = useAppDispatch()
    const {accountId, accountDomain} = params
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
