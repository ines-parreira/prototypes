import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    storeConfigurationKeys,
    useCreateStoreConfigurationPure,
    useUpsertStoreConfigurationPure,
} from 'models/aiAgent/queries'
import type {
    CreateStoreConfigurationPayload,
    StoreConfiguration,
} from 'models/aiAgent/types'

export const useStoreConfigurationMutation = ({
    accountDomain,
    shopName,
}: {
    accountDomain: string
    shopName: string
}) => {
    const queryClient = useQueryClient()

    const {
        mutateAsync: createStoreConfigurationAsync,
        isLoading: isCreateLoading,
    } = useCreateStoreConfigurationPure({
        onSuccess: async () => {
            /**
             * We must invalidate both cache storeConfigurationKeys.details and storeConfigurationKeys.accounts
             * because {@link useGetStoresConfigurationForAccount} uses a different key to bulk fetch.
             */
            void queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.detail({
                    accountDomain,
                    storeName: shopName,
                }),
            })

            await queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.accounts(),
            })
        },
    })

    const {
        mutateAsync: upsertStoreConfigurationAsync,
        isLoading: isUpsertLoading,
        error: isUpsertError,
    } = useUpsertStoreConfigurationPure({
        onSuccess: async () => {
            /**
             * We must invalidate both cache storeConfigurationKeys.details and storeConfigurationKeys.accounts
             * because {@link useGetStoresConfigurationForAccount} uses a different key to bulk fetch.
             */
            await queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.detail({
                    accountDomain,
                    storeName: shopName,
                }),
            })

            await queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.accounts(),
            })
        },
    })

    const createStoreConfiguration = useCallback(
        async (
            configurationToSubmit: CreateStoreConfigurationPayload,
        ): Promise<StoreConfiguration> => {
            const createdConfiguration = await createStoreConfigurationAsync([
                accountDomain,
                configurationToSubmit,
            ])

            return createdConfiguration.data.storeConfiguration
        },
        [accountDomain, createStoreConfigurationAsync],
    )

    const upsertStoreConfiguration = useCallback(
        async (
            configurationToSubmit: StoreConfiguration,
        ): Promise<StoreConfiguration> => {
            const upsertedConfiguration = await upsertStoreConfigurationAsync([
                accountDomain,
                configurationToSubmit,
            ])

            return upsertedConfiguration.data.storeConfiguration
        },
        [accountDomain, upsertStoreConfigurationAsync],
    )

    return {
        createStoreConfiguration,
        upsertStoreConfiguration,
        isLoading: isCreateLoading || isUpsertLoading,
        error: isUpsertError,
    }
}
