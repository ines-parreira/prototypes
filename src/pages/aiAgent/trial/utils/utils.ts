import { StoreConfiguration } from 'models/aiAgent/types'

export const atLeastOneStoreHasActiveTrial = (
    storeConfigurations: StoreConfiguration[],
) => {
    return storeConfigurations.some(
        (storeConfiguration) => storeConfiguration.sales?.trial.startDatetime,
    )
}
