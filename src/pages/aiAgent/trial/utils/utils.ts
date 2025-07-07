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
