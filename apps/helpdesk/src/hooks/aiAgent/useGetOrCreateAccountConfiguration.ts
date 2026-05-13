import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

import { toast } from '@gorgias/axiom'

import {
    accountConfigurationKeys,
    CACHE_TIME_MS,
    STALE_TIME_MS,
} from 'models/aiAgent/queries'
import {
    createAccountConfiguration,
    getAccountConfiguration,
} from 'models/aiAgent/resources/configuration'

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
                    toast.error(
                        'An error occurred while loading the AI Agent, please contact support.',
                    )
                    return null
                }

                if (error.response?.status !== 404) {
                    throw error
                }

                toast.info('Initializing AI Agent')
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
            toast.error('An error occurred while loading the AI Agent')
        },
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
        ...overrides,
    })
}
