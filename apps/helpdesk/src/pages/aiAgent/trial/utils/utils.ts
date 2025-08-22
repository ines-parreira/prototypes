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
