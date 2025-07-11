import moment from 'moment'

import { atLeastOneStoreHasActiveTrialOnSpecificStores } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { StoreConfiguration } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'

export const atLeastOneStoreHasActiveTrial = (
    storeConfigurations: StoreConfiguration[],
    isRevampTrialEnabled: boolean,
    storeActivations: Record<string, StoreActivation>,
) => {
    if (!isRevampTrialEnabled) {
        return !!atLeastOneStoreHasActiveTrialOnSpecificStores(storeActivations)
    }

    return storeConfigurations.some(
        (storeConfiguration) => storeConfiguration.sales?.trial.startDatetime,
    )
}

export const currentStoreHasOptedOut = (
    storeActivations: Record<string, StoreActivation>,
    isRevampTrialEnabled: boolean,
) => {
    if (!isRevampTrialEnabled) {
        return false
    }

    const storeConfigurations = Object.values(storeActivations).map(
        (storeActivation) => storeActivation.configuration,
    )

    return storeConfigurations.some(
        (storeConfiguration) =>
            storeConfiguration?.sales?.trial?.account?.optOutDatetime,
    )
}

export const atLeastOneStoreHasOptedOut = (
    storeConfigurations: StoreConfiguration[],
    isRevampTrialEnabled: boolean,
) => {
    if (!isRevampTrialEnabled) {
        return false
    }

    return storeConfigurations.some(
        (storeConfiguration) =>
            storeConfiguration?.sales?.trial?.account?.optOutDatetime,
    )
}

export const isTrialExpired = (
    storeActivations: Record<string, StoreActivation>,
) => {
    const now = moment()
    return Object.values(storeActivations).some(
        (storeActivation) =>
            (!!storeActivation.configuration.sales?.trial.account
                .actualTerminationDatetime &&
                moment(
                    storeActivation.configuration.sales?.trial.account
                        .actualTerminationDatetime,
                ).isBefore(now)) ||
            (!!storeActivation.configuration.sales?.trial.account
                .actualUpgradeDatetime &&
                moment(
                    storeActivation.configuration.sales?.trial.account
                        .actualUpgradeDatetime,
                ).isBefore(now)),
    )
}
