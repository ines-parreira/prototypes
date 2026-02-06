import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { StoreIntegration } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'

/**
 * This hook should be used for the purpose of the chat settings revamp and removed afterwards
 */
const useShouldShowChatSettingsRevamp = (
    storeIntegration: StoreIntegration | undefined,
) => {
    const isRevampEnabled = useFlag(FeatureFlagKey.ChatSettingsRevamp)

    const shopName = storeIntegration
        ? getShopNameFromStoreIntegration(storeIntegration)
        : undefined

    const { hasAccess } = useAiAgentAccess(shopName)

    const shouldShowRevamp = isRevampEnabled && hasAccess
    const shouldShowPreviewForRevamp = !shouldShowRevamp

    return { shouldShowRevamp, shouldShowPreviewForRevamp }
}

export default useShouldShowChatSettingsRevamp
