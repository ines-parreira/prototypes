import { useLocalStorage } from '@repo/hooks'

import { useCanUseAiSalesAgent } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { AiAgentScopes } from 'pages/aiAgent/Onboarding_V2/types'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'

export const useAiAgentScopesForAutomationPlan = (
    shopName?: string,
): AiAgentScopes[] => {
    const [shoppingAssistantTrialOptin] = useLocalStorage<boolean>(
        `${shopName}-shopping-assistant-trial-optin`,
        false,
    )
    const canUseAiSalesAgent = useCanUseAiSalesAgent(shopName)
    const { trialType, isOnboarded } = useTrialAccess(shopName)

    const isOptedInForShoppingAssistantTrial =
        !!shopName &&
        shoppingAssistantTrialOptin &&
        trialType === TrialType.ShoppingAssistant &&
        isOnboarded === false // specific check because of loading

    return canUseAiSalesAgent || isOptedInForShoppingAssistantTrial
        ? [AiAgentScopes.SUPPORT, AiAgentScopes.SALES]
        : [AiAgentScopes.SUPPORT]
}
