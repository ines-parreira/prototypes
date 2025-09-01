import moment from 'moment'

import { StoreConfiguration } from 'models/aiAgent/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'

export const hasTrialStarted = (
    trialType: TrialType,
    storeConfiguration: StoreConfiguration,
) => {
    if (trialType === TrialType.AiAgent) {
        return !!storeConfiguration.trial?.startDatetime
    }
    return !!storeConfiguration.sales?.trial?.startDatetime
}

export const atLeastOneStoreHasActiveTrial = (
    storeConfigurations: StoreConfiguration[],
    trialType: TrialType,
) => {
    return storeConfigurations.some((config) =>
        hasTrialStarted(trialType, config),
    )
}

export const hasTrialOptedOut = (
    trialType: TrialType,
    storeConfiguration: StoreConfiguration,
) => {
    if (trialType === TrialType.AiAgent) {
        return !!storeConfiguration?.trial?.account?.optOutDatetime
    }
    return !!storeConfiguration?.sales?.trial?.account?.optOutDatetime
}

export const hasTrialExpired = (
    trialType: TrialType,
    storeConfiguration: StoreConfiguration,
) => {
    const now = moment()
    const terminationDatetime =
        trialType === TrialType.AiAgent
            ? storeConfiguration.trial?.account?.actualTerminationDatetime
            : storeConfiguration.sales?.trial?.account
                  ?.actualTerminationDatetime
    return !!terminationDatetime && moment(terminationDatetime).isBefore(now)
}

export const hasTrialOptedIn = (
    trialType: TrialType,
    storeConfiguration: StoreConfiguration,
) =>
    hasTrialStarted(trialType, storeConfiguration) &&
    !hasTrialOptedOut(trialType, storeConfiguration)

export const hasTrialActive = (
    trialType: TrialType,
    storeConfiguration: StoreConfiguration,
) =>
    hasTrialStarted(trialType, storeConfiguration) &&
    !hasTrialExpired(trialType, storeConfiguration)

const TRIAL_ENDING_DISMISSED_KEY_PREFIX =
    'ai-agent-trial-ending-tomorrow-dismissed'
const TRIAL_ENDED_DISMISSED_KEY_PREFIX = 'ai-agent-trial-ended-dismissed'

export const getTrialEndingDismissedKey = (
    storeName: string,
    trialType: TrialType,
) => `${TRIAL_ENDING_DISMISSED_KEY_PREFIX}:${storeName}:${trialType}`

export const getTrialEndedDismissedKey = (
    storeName: string,
    trialType: TrialType,
) => `${TRIAL_ENDED_DISMISSED_KEY_PREFIX}:${storeName}:${trialType}`

export const isTrialEndingModalDismissed = (
    storeName: string,
    trialType: TrialType,
) =>
    localStorage.getItem(getTrialEndingDismissedKey(storeName, trialType)) ===
    'true'

export const isTrialEndedModalDismissed = (
    storeName: string,
    trialType: TrialType,
) =>
    localStorage.getItem(getTrialEndedDismissedKey(storeName, trialType)) ===
    'true'

export const dismissTrialEndingModal = (
    storeName: string,
    trialType: TrialType,
) =>
    localStorage.setItem(
        getTrialEndingDismissedKey(storeName, trialType),
        'true',
    )

export const dismissTrialEndedModal = (
    storeName: string,
    trialType: TrialType,
) =>
    localStorage.setItem(
        getTrialEndedDismissedKey(storeName, trialType),
        'true',
    )
