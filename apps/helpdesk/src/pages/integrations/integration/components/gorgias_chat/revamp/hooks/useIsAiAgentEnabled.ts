import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import type { StoreIntegration } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

export const useIsAiAgentEnabled = (
    storeIntegration?: StoreIntegration,
    chatId?: number,
) => {
    const shopName = storeIntegration
        ? getShopNameFromStoreIntegration(storeIntegration)
        : undefined

    const currentAccount = useAppSelector(getCurrentAccountState)

    const { storeConfiguration, isLoading } = useStoreConfiguration({
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

    return { isAiAgentEnabled, isLoading }
}
