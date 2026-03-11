import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'

export const useHasAccessToOpportunities = (shopName: string): boolean => {
    const { currentAutomatePlan, trials } = useTrialAccess(shopName)

    const isOnUsd6PlusPlan =
        currentAutomatePlan?.generation && currentAutomatePlan.generation >= 6

    const storeTrial = trials?.find(
        (trial) =>
            trial.shopName === shopName &&
            trial.type === TrialType.ShoppingAssistant,
    )

    const now = new Date()
    const isStoreTrialActive = storeTrial
        ? new Date(storeTrial.trial.endDatetime ?? 0) > now &&
          storeTrial.trial.account.actualTerminationDatetime === null
        : false

    return Boolean(isOnUsd6PlusPlan || isStoreTrialActive)
}
