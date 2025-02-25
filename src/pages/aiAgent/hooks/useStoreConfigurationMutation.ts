import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    storeConfigurationKeys,
    useCreateStoreConfigurationPure,
    useUpsertStoreConfigurationPure,
} from 'models/aiAgent/queries'
import {
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
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.detail({
                    accountDomain,
                    storeName: shopName,
                }),
            })
        },
    })

    const {
        mutateAsync: upsertStoreConfigurationAsync,
        isLoading: isUpsertLoading,
        error: isUpsertError,
    } = useUpsertStoreConfigurationPure({
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.detail({
                    accountDomain,
                    storeName: shopName,
                }),
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
