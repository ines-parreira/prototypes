import moment from 'moment'

import { atLeastOneStoreHasActiveTrialOnSpecificStores } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { StoreConfiguration } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'

export const hasTrialStarted = (storeConfiguration: StoreConfiguration) =>
    !!storeConfiguration.sales?.trial.startDatetime

export const atLeastOneStoreHasActiveTrial = (
    storeConfigurations: StoreConfiguration[],
    isRevampTrialEnabled: boolean,
    storeActivations: Record<string, StoreActivation>,
) => {
    if (!isRevampTrialEnabled) {
        return !!atLeastOneStoreHasActiveTrialOnSpecificStores(storeActivations)
    }

    return storeConfigurations.some(hasTrialStarted)
}

export const hasTrialOptedOut = (storeConfiguration: StoreConfiguration) =>
    !!storeConfiguration?.sales?.trial?.account?.optOutDatetime

export const hasTrialExpired = (storeConfiguration: StoreConfiguration) => {
    const now = moment()
    const terminationDatetime =
        storeConfiguration.sales?.trial.account.actualTerminationDatetime
    return !!terminationDatetime && moment(terminationDatetime).isBefore(now)
}

export const hasTrialOptedIn = (storeConfiguration: StoreConfiguration) =>
    hasTrialStarted(storeConfiguration) && !hasTrialOptedOut(storeConfiguration)

export const hasTrialActive = (storeConfiguration: StoreConfiguration) =>
    hasTrialStarted(storeConfiguration) && !hasTrialExpired(storeConfiguration)
