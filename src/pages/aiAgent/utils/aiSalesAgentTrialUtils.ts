import moment from 'moment'

import { StoreConfiguration } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'

import { getAiShoppingAssistantTrialExtensionEnabledFlag } from '../Activation/utils'

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
    return (
        !storeActivation.support.chat.isIntegrationMissing &&
        getAiSalesAgentTrialState(storeActivation.configuration) ===
            TrialState.NotTrial
    )
}

export const getAiSalesAgentTrialState = (
    storeConfiguration: StoreConfiguration,
): TrialState => {
    const trialExtensionPeriodInDays =
        getAiShoppingAssistantTrialExtensionEnabledFlag()

    const trialEnd = storeConfiguration.salesDeactivatedDatetime
    const now = new Date()

    if (trialEnd) {
        const trialEndDate = new Date(trialEnd)
        if (trialEndDate > now) {
            return TrialState.Trial
        }
        if (trialEndDate < now) {
            if (
                trialExtensionPeriodInDays &&
                moment(trialEndDate)
                    .add(trialExtensionPeriodInDays, 'days')
                    .isAfter(now)
            ) {
                return TrialState.Trial
            }
            return TrialState.TrialEnded
        }
    }
    return TrialState.NotTrial
}

export const isAccountPartOfCanduTrial = async (): Promise<boolean> => {
    const CANDU_TRIAL_MEMBERSHIP_SEGMENT_ID = 'FADCAHMBM2'

    if (!window.Candu) return false
    const canduMembership = await window.Candu.getMembership()

    return canduMembership.includes(CANDU_TRIAL_MEMBERSHIP_SEGMENT_ID)
}
