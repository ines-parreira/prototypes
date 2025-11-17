import type { StoreConfiguration } from 'models/aiAgent/types'
import { isAiAgentEnabled } from 'pages/aiAgent/util'

/**
 * Checks if AI Agent is enabled for a store by verifying if either chat or email channels are active
 *
 * @param storeConfiguration - The store configuration containing channel deactivation dates
 * @returns true if either chat or email channels are active, false otherwise
 */
export const isAiAgentEnabledForStore = (
    storeConfiguration: StoreConfiguration,
): boolean => {
    const chatEnabled = isAiAgentEnabled(
        storeConfiguration.chatChannelDeactivatedDatetime,
    )
    const emailEnabled = isAiAgentEnabled(
        storeConfiguration.emailChannelDeactivatedDatetime,
    )

    return chatEnabled || emailEnabled
}
