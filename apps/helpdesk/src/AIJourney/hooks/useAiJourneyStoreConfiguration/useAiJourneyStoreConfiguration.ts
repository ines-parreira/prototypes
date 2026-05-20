import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import type { StoreConfigurationRequestSchema } from '@gorgias/convert-client'
import {
    queryKeys,
    useCreateOrUpdateStoreConfiguration,
    useGetStoreConfiguration,
} from '@gorgias/convert-queries'

export const useAiJourneyStoreConfiguration = (
    storeIntegrationId: number | undefined,
) => {
    const queryClient = useQueryClient()

    const { data, isLoading, error, isFetched } = useGetStoreConfiguration(
        storeIntegrationId!,
        {
            query: {
                enabled: !!storeIntegrationId,
                refetchOnWindowFocus: false,
            },
        },
    )

    const { mutateAsync } = useCreateOrUpdateStoreConfiguration()

    const saveConfiguration = useCallback(
        async (configuration: StoreConfigurationRequestSchema) => {
            if (!storeIntegrationId) return

            await mutateAsync({
                storeIntegrationId,
                data: configuration,
            })

            await queryClient.invalidateQueries({
                queryKey:
                    queryKeys.storeConfigurations.getStoreConfiguration(
                        storeIntegrationId,
                    ),
            })
        },
        [storeIntegrationId, mutateAsync, queryClient],
    )

    return {
        storeConfiguration: data?.data,
        isLoading,
        error,
        isFetched,
        saveConfiguration,
    }
}
