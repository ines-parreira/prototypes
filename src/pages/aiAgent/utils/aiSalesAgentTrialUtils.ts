import { StoreConfiguration } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'

import { getAiShoppingAssistantTrialEnabledFlag } from '../Activation/utils'

export enum TrialState {
    NotTrial = 'notTrial',
    Trial = 'trial',
    TrialEnded = 'trialEnded',
}

export const isAtLeastOneStoreEligibleForTrial = async (
    storeActivations: Record<string, StoreActivation>,
) => {
    const isCanduTrial = await isAccountPartOfCanduTrial()
    const storesEligibleForTrial = getStoresEligibleForTrial(storeActivations)
    return isCanduTrial && storesEligibleForTrial.length > 0
}

export const getStoresEligibleForTrial = (
    storeActivations: Record<string, StoreActivation>,
) => {
    return Object.values(storeActivations).filter((storeActivation) => {
        return isStoreEligibleForTrial(storeActivation)
    })
}

export const isStoreEligibleForTrial = (storeActivation: StoreActivation) => {
    return !storeActivation.support.chat.isIntegrationMissing
}

export const getAiSalesAgentTrialState = (
    storeConfiguration: StoreConfiguration,
): TrialState => {
    const trialEnd = storeConfiguration.salesDeactivatedDatetime
    const now = new Date()

    if (trialEnd) {
        const trialEndDate = new Date(trialEnd)
        if (trialEndDate > now) {
            return TrialState.Trial
        }
        if (trialEndDate < now) {
            return TrialState.TrialEnded
        }
    }
    return TrialState.NotTrial
}

export const isAccountPartOfCanduTrial = async (): Promise<boolean> => {
    // This feature flag will be used to enable the release of the trial feature to segment FADCAHMBM2.
    const isAiShoppingAssistantTrialEnabled =
        getAiShoppingAssistantTrialEnabledFlag()
    const CANDU_TRIAL_MEMBERSHIP_SEGMENT_ID = isAiShoppingAssistantTrialEnabled
        ? 'FADCAHMBM2'
        : 'GqzPfgRSY3'

    if (!window.Candu) return false
    const canduMembership = await window.Candu.getMembership()

    return canduMembership.includes(CANDU_TRIAL_MEMBERSHIP_SEGMENT_ID)
}
