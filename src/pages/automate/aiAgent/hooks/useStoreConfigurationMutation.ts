import {useQueryClient} from '@tanstack/react-query'

import {useCallback} from 'react'
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
                queryKey: storeConfigurationKeys.detail(shopName),
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
                queryKey: storeConfigurationKeys.detail(shopName),
            })
        },
    })

    const createStoreConfiguration = useCallback(
        async (configurationToSubmit: CreateStoreConfigurationPayload) => {
            await createStoreConfigurationAsync([
                accountDomain,
                configurationToSubmit,
            ])
        },
        [accountDomain, createStoreConfigurationAsync]
    )

    const upsertStoreConfiguration = useCallback(
        async (configurationToSubmit: StoreConfiguration) => {
            await upsertStoreConfigurationAsync([
                accountDomain,
                configurationToSubmit,
            ])
        },
        [accountDomain, upsertStoreConfigurationAsync]
    )

    return {
        createStoreConfiguration,
        upsertStoreConfiguration,
        isLoading: isCreateLoading || isUpsertLoading,
        error: isUpsertError,
    }
}
