import { useQueryClient } from '@tanstack/react-query'

import {
    storeConfigurationKeys,
    useUpsertStoreConfigurationPure,
} from 'models/aiAgent/queries'
import { AiAgentScope } from 'models/aiAgent/types'
import { useGetOnboardingDataByShopName } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingDataByShopName'
import { useFetchAiAgentStoreConfigurationData } from 'pages/aiAgent/Overview/hooks/pendingTasks/useFetchAiAgentStoreConfigurationData'

export const useUpdateAIAgentStoreConfigurationData = (
    accountDomain: string,
    storeName: string,
    enabled = true,
) => {
    const queryClient = useQueryClient()

    const { data, isLoading: isFetchingOnboardingData } =
        useGetOnboardingDataByShopName({ shopName: storeName, enabled })

    const { data: storeConfig, isLoading: isFetchingStoreConfiguration } =
        useFetchAiAgentStoreConfigurationData({
            accountDomain,
            storeName,
            enabled,
        })

    const isLoading = isFetchingOnboardingData || isFetchingStoreConfiguration

    // Use mutation hook to update the store configuration
    const {
        mutate,
        isLoading: isUpdating,
        error,
    } = useUpsertStoreConfigurationPure({
        onSuccess: () => {
            // Invalidate and refetch store configuration to keep UI in sync
            queryClient.invalidateQueries({
                queryKey: storeConfigurationKeys.all(),
            })
        },
    })

    // Function to update specific fields
    const updateStoreConfig = (onSuccess?: () => void) => {
        if (isFetchingOnboardingData || isFetchingStoreConfiguration) {
            console.warn(
                '🚀 ~ updateStoreConfig: Data is still loading, aborting update',
            )
            return
        }

        if (!storeConfig || !data) {
            console.error(
                '🚀 ~ updateStoreConfig: Missing data, aborting update',
            )
            return
        }

        const updatedConfig = {
            ...storeConfig,
            emailChannelDeactivatedDatetime: data?.emailIntegrationIds?.length
                ? null
                : storeConfig.emailChannelDeactivatedDatetime,
            chatChannelDeactivatedDatetime: data?.chatIntegrationIds?.length
                ? null
                : storeConfig.chatChannelDeactivatedDatetime,
            scopes: data?.chatIntegrationIds?.length
                ? [AiAgentScope.Sales, AiAgentScope.Support]
                : [AiAgentScope.Support],
        }

        mutate([accountDomain, updatedConfig], {
            onSuccess: () => {
                if (onSuccess) onSuccess()
            },
        })
    }

    return {
        storeConfig,
        isLoading,
        updateStoreConfig,
        isUpdating,
        error,
    }
}
