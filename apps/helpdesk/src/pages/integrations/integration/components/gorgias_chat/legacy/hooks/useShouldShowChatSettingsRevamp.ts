import { useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import useAppSelector from 'hooks/useAppSelector'
import type { StoreIntegration } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

/**
 * This hook should be used for the purpose of the chat settings revamp and removed afterwards
 */
const useShouldShowChatSettingsRevamp = (
    storeIntegration?: StoreIntegration,
    chatId?: number,
) => {
    const { value: isRevampEnabled, isLoading: isFlagLoading } =
        useFlagWithLoading(FeatureFlagKey.ChatSettingsRevamp)

    const shopName = storeIntegration
        ? getShopNameFromStoreIntegration(storeIntegration)
        : undefined

    const currentAccount = useAppSelector(getCurrentAccountState)

    const { storeConfiguration, isLoading: isStoreConfigurationLoading } =
        useStoreConfiguration({
            shopName: shopName ?? '',
            accountDomain: currentAccount.get('domain'),
        })

    const isAiAgentEnabled = useMemo(() => {
        if (!storeConfiguration || !shopName || !chatId) {
            return false
        }

        return (
            storeConfiguration.monitoredChatIntegrations.includes(chatId) &&
            !storeConfiguration.chatChannelDeactivatedDatetime
        )
    }, [chatId, storeConfiguration, shopName])

    const shouldShowRevamp = isRevampEnabled
    const shouldShowRevampWhenAiAgentEnabled =
        shouldShowRevamp && isAiAgentEnabled
    const shouldShowPreviewForRevamp = !shouldShowRevampWhenAiAgentEnabled

    return {
        shouldShowRevamp,
        shouldShowPreviewForRevamp,
        shouldShowRevampWhenAiAgentEnabled,
        isLoading: isFlagLoading || isStoreConfigurationLoading,
    }
}

export default useShouldShowChatSettingsRevamp
