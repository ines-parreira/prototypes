import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { StoreConfiguration } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useStoreConfigurations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import {
    getAiSalesAgentTrialState,
    TrialState,
} from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'
import { getCurrentAutomatePlan } from 'state/billing/selectors'
import {
    getCurrentAccountState,
    isTrialing as getIsTrialing,
} from 'state/currentAccount/selectors'

/**
 * This hook checks if the current account can use the Ai Sales Agent feature.
 * It checks if the user can bypass the plan check via the feature flag or if the user's account is trialing.
 * If none of the above is true, it checks if the user has it's automate plan upgraded to generation 6 or higher.
 * @returns whether the user can use the Ai Sales Agent feature or not
 */
export const useCanUseAiSalesAgent = () => {
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const hasNewAutomatePlan = (currentAutomatePlan?.generation ?? 0) >= 6

    const isTrialing = useAppSelector(getIsTrialing)
    const bypassPlanCheck =
        useFlag(FeatureFlagKey.AiSalesAgentBypassPlanCheck, false) || isTrialing

    return bypassPlanCheck || hasNewAutomatePlan
}

export const canStoreUseAiSalesAgent = (
    storeConfiguration: StoreConfiguration,
) => {
    const trialState = getAiSalesAgentTrialState(storeConfiguration)

    return trialState === TrialState.Trial
}

/**
 * @deprecated use {@link atLeastOneStoreHasActiveTrial} instead
 */
export const useAtLeastOneStoreHasActiveTrial = () => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { storeConfigurations } = useStoreConfigurations(accountDomain)

    return storeConfigurations.some((storeConfiguration) =>
        canStoreUseAiSalesAgent(storeConfiguration),
    )
}

/**
 * @deprecated use {@link atLeastOneStoreHasActiveTrial} instead
 */
export const atLeastOneStoreHasActiveTrialOnSpecificStores = (
    storeActivations: Record<string, StoreActivation>,
) => {
    return Object.values(storeActivations).some((storeActivation) =>
        canStoreUseAiSalesAgent(storeActivation.configuration),
    )
}
