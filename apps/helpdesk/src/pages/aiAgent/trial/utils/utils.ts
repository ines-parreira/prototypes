import moment from 'moment'

import { Trial } from 'models/aiAgent/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'

export const hasTrialStarted = (trial: Trial) => {
    return !!trial.trial?.startDatetime
}

export const atLeastOneStoreHasActiveTrial = (trials: Trial[]) => {
    return trials.some((trial) => hasTrialStarted(trial))
}

export const hasTrialOptedOut = (trial: Trial) => {
    return !!trial.trial?.account?.optOutDatetime
}

export const hasTrialExpired = (trial: Trial) => {
    const now = moment()
    const terminationDatetime = trial.trial?.account?.actualTerminationDatetime
    return !!terminationDatetime && moment(terminationDatetime).isBefore(now)
}

export const hasTrialOptedIn = (trial: Trial) =>
    hasTrialStarted(trial) && !hasTrialOptedOut(trial)

export const hasTrialActive = (trial: Trial) =>
    hasTrialStarted(trial) && !hasTrialExpired(trial)

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

export const toPercentage = (value: number, decimals = 1) => {
    const percentage = value * 100
    return `${parseFloat(percentage.toFixed(decimals))}%`
}
