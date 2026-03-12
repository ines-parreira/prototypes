import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    accountConfigurationKeys,
    CACHE_TIME_MS,
    STALE_TIME_MS,
} from 'models/aiAgent/queries'
import {
    createAccountConfiguration,
    getAccountConfiguration,
} from 'models/aiAgent/resources/configuration'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export function useGetOrCreateAccountConfiguration(
    params: {
        accountId: number
        accountDomain: string
        storeNames: string[]
    },
    overrides?: UseQueryOptions<Awaited<
        ReturnType<typeof getAccountConfiguration>
    > | null>,
) {
    const dispatch = useAppDispatch()

    const { accountId, accountDomain, storeNames } = params
    return useQuery({
        queryKey: accountConfigurationKeys.detail(accountDomain),
        queryFn: async (): Promise<Awaited<
            ReturnType<typeof getAccountConfiguration>
        > | null> => {
            try {
                return await getAccountConfiguration(accountDomain)
            } catch (error) {
                if (!isAxiosError(error)) {
                    throw error
                }

                if (error.response?.status === 403) {
                    void dispatch(
                        notify({
                            message:
                                'An error occurred while loading the AI Agent, please contact support.',
                            status: NotificationStatus.Error,
                        }),
                    )
                    return null
                }

                if (error.response?.status !== 404) {
                    throw error
                }

                void dispatch(
                    notify({
                        message: 'Initializing AI Agent',
                        status: NotificationStatus.Loading,
                        closeOnNext: true,
                    }),
                )
                return await createAccountConfiguration({
                    accountId,
                    gorgiasDomain: accountDomain,
                    storeNames,
                    helpdeskOAuth: null,
                    customFieldIds: [],
                })
            }
        },
        onError: () => {
            void dispatch(
                notify({
                    message: 'An error occurred while loading the AI Agent',
                    status: NotificationStatus.Error,
                }),
            )
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}
