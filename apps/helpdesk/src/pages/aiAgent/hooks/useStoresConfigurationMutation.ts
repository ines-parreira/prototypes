import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    storeConfigurationKeys,
    useUpsertStoresConfigurationPure,
} from 'models/aiAgent/queries'
import type { StoreConfiguration } from 'models/aiAgent/types'

export const useStoresConfigurationMutation = ({
    accountDomain,
}: {
    accountDomain: string
}) => {
    const queryClient = useQueryClient()

    const {
        mutateAsync: upsertStoresConfigurationAsync,
        isLoading: isUpsertLoading,
        error: isUpsertError,
    } = useUpsertStoresConfigurationPure({
        onSuccess: async () => {
            /**
             * We must invalidate both cache storeConfigurationKeys.details and storeConfigurationKeys.accounts
             * because {@link useGetStoresConfigurationForAccount} uses a different key to bulk fetch.
             */
            await queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.details(),
            })
            await queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.accounts(),
            })
        },
    })

    const upsertStoresConfiguration = useCallback(
        async (
            configurationToSubmit: StoreConfiguration[],
        ): Promise<StoreConfiguration[]> => {
            const upsertedConfiguration = await upsertStoresConfigurationAsync([
                accountDomain,
                configurationToSubmit,
            ])

            return upsertedConfiguration.map((it) => it.data.storeConfiguration)
        },
        [accountDomain, upsertStoresConfigurationAsync],
    )

    return {
        upsertStoresConfiguration,
        isLoading: isUpsertLoading,
        error: isUpsertError,
    }
}
