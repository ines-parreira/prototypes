import moment from 'moment'

import type { StoreConfiguration } from 'models/aiAgent/types'
import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'

export enum TrialState {
    NotTrial = 'notTrial',
    Trial = 'trial',
    TrialEnded = 'trialEnded',
}

export const isAtLeastOneStoreEligibleForTrial = async (
    storeActivations: Record<string, StoreActivation>,
    trialExtensionPeriodInDays = 0,
) => {
    const isCanduTrial = await isAccountPartOfCanduTrial()
    const storesEligibleForTrial = getStoresEligibleForTrial(
        storeActivations,
        trialExtensionPeriodInDays,
    )
    return isCanduTrial && storesEligibleForTrial.length > 0
}

/**
 * @deprecated this function will be removed once we have a new trial banner component. Going forward use the function from 'src/pages/aiAgent/trial/utils/utils.ts'
 * @date 2025-06-27
 */
export const getStoresEligibleForTrial = (
    storeActivations: Record<string, StoreActivation>,
    trialExtensionPeriodInDays = 0,
) => {
    return Object.values(storeActivations).filter((storeActivation) => {
        return isStoreEligibleForTrial(
            storeActivation,
            trialExtensionPeriodInDays,
        )
    })
}

/**
 * @deprecated this function will be removed once we have a new trial banner component. Going forward use the function from 'src/pages/aiAgent/trial/utils/utils.ts'
 * @date 2025-06-27
 */
export const isStoreEligibleForTrial = (
    storeActivation: StoreActivation,
    trialExtensionPeriodInDays = 0,
) => {
    return (
        !storeActivation.support.chat.isIntegrationMissing &&
        getAiSalesAgentTrialState(
            storeActivation.configuration,
            trialExtensionPeriodInDays,
        ) === TrialState.NotTrial
    )
}

/**
 * @deprecated this function will be removed once we have a new trial banner component. Going forward use the function from 'src/pages/aiAgent/trial/utils/utils.ts'
 * @date 2025-06-27
 */
export const getAiSalesAgentTrialState = (
    storeConfiguration: StoreConfiguration,
    trialExtensionPeriodInDays = 0,
): TrialState => {
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
