import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'

export const useAiAgentScopesForAutomationPlan = (
    shopName?: string,
): AiAgentScopes[] => {
    const canUseAiSalesAgent = useCanUseAiSalesAgent(shopName)

    return canUseAiSalesAgent
        ? [AiAgentScopes.SUPPORT, AiAgentScopes.SALES]
        : [AiAgentScopes.SUPPORT]
}
