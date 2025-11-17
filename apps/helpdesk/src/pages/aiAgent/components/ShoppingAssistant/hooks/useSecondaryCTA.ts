import type { UseShoppingAssistantTrialFlowReturn } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import type { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'

import type { ButtonConfig, PromoCardVariant } from '../types/ShoppingAssistant'
import { TrialType } from '../types/ShoppingAssistant'
import { useAiAgentSecondaryCTA } from './useAiAgentSecondaryCTA'
import { useShoppingAssistantSecondaryCTA } from './useShoppingAssistantSecondaryCTA'

/**
 * Returns the secondary CTA for the AI Agent or Shopping Assistant based on the trial type
 */
export const useSecondaryCTA = (
    variant: PromoCardVariant,
    trialAccess: ReturnType<typeof useTrialAccess>,
    trialFlow: UseShoppingAssistantTrialFlowReturn,
): ButtonConfig | undefined => {
    const aiAgentSecondaryCTA = useAiAgentSecondaryCTA(
        variant,
        trialAccess,
        trialFlow,
    )

    const shoppingAssistantSecondaryCTA = useShoppingAssistantSecondaryCTA(
        variant,
        trialAccess,
        trialFlow,
    )

    if (trialAccess.trialType === TrialType.AiAgent) {
        return aiAgentSecondaryCTA
    }

    return shoppingAssistantSecondaryCTA
}
