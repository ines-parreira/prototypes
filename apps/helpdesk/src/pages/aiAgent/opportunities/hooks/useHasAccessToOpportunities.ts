import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'

export const useHasAccessToOpportunities = (shopName?: string): boolean => {
    const {
        currentAutomatePlan,
        hasCurrentStoreTrialActive,
        hasAnyTrialActive,
        trialType,
    } = useTrialAccess(shopName)

    const isOnUsd6PlusPlan =
        currentAutomatePlan?.generation && currentAutomatePlan.generation >= 6

    const hasTrialActive = shopName
        ? hasCurrentStoreTrialActive
        : hasAnyTrialActive

    return Boolean(
        isOnUsd6PlusPlan ||
            (hasTrialActive && trialType === TrialType.ShoppingAssistant),
    )
}
