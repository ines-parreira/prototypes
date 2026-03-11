import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'

export const useHasAccessToOpportunities = (shopName: string): boolean => {
    const { currentAutomatePlan, hasCurrentStoreTrialActive, trialType } =
        useTrialAccess(shopName)

    const isOnUsd6PlusPlan =
        currentAutomatePlan?.generation && currentAutomatePlan.generation >= 6

    return Boolean(
        isOnUsd6PlusPlan ||
            (hasCurrentStoreTrialActive &&
                trialType === TrialType.ShoppingAssistant),
    )
}
