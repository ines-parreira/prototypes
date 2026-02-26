import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

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
    const isRevampEnabled = useFlag(FeatureFlagKey.ChatSettingsRevamp)

    const shopName = storeIntegration
        ? getShopNameFromStoreIntegration(storeIntegration)
        : undefined

    const currentAccount = useAppSelector(getCurrentAccountState)

    const { storeConfiguration } = useStoreConfiguration({
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
    }
}

export default useShouldShowChatSettingsRevamp
