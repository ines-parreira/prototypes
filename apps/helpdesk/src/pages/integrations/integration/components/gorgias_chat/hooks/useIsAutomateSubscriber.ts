import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import type { GorgiasChatIntegration } from 'models/integration/types/gorgiasChat'

const useIsAutomateSubscriber = (
    integration: GorgiasChatIntegration,
): boolean => {
    const shopName = integration.meta?.shop_name as string | undefined
    const shopType = integration.meta?.shop_type as string | null
    const { hasAccess } = useAiAgentAccess(shopName)

    return Boolean(hasAccess && shopName && shopType)
}

export default useIsAutomateSubscriber
