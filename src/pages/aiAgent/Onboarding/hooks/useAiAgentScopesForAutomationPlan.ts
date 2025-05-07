import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding/types'

export const useAiAgentScopesForAutomationPlan = (): AiAgentScopes[] => {
    const canUseAiSalesAgent = useCanUseAiSalesAgent()

    return canUseAiSalesAgent
        ? [AiAgentScopes.SUPPORT, AiAgentScopes.SALES]
        : [AiAgentScopes.SUPPORT]
}
