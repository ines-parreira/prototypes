import { ShopifyIntegration } from 'models/integration/types'
import { UseShoppingAssistantTrialFlowReturn } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { TrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { TrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'

import {
    ButtonConfig,
    PromoCardVariant,
    TrialType,
} from '../types/ShoppingAssistant'
import { useAiAgentPrimaryCTA } from './useAiAgentPrimaryCTA'
import { useShoppingAssistantPrimaryCTA } from './useShoppingAssistantPrimaryCTA'

/**
 * Returns the primary CTA for the AI Agent or Shopping Assistant based on the trial type
 */
export const usePrimaryCTA = ({
    trialAccess,
    trialFlow,
    isDisabled,
    trialMetrics,
    routeShopName,
    firstShopifyIntegration,
}: {
    trialAccess: TrialAccess
    trialFlow: UseShoppingAssistantTrialFlowReturn
    isDisabled: boolean
    trialMetrics: TrialMetrics
    routeShopName: string | undefined
    firstShopifyIntegration: ShopifyIntegration
}): {
    button: ButtonConfig
    variant: PromoCardVariant
} => {
    const aiAgentPrimaryCTA = useAiAgentPrimaryCTA({
        trialAccess,
        trialFlow,
        isDisabled,
        trialMetrics,
        routeShopName,
        firstShopifyIntegration,
    })

    const shoppingAssistantPrimaryCTA = useShoppingAssistantPrimaryCTA({
        trialAccess,
        trialFlow,
        isDisabled,
        trialMetrics,
        routeShopName,
        firstShopifyIntegration,
    })

    if (trialAccess.trialType === TrialType.AiAgent) {
        return aiAgentPrimaryCTA
    }

    return shoppingAssistantPrimaryCTA
}
