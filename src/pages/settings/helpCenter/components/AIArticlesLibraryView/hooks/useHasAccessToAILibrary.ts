import {StoreIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getStoreIntegrations} from 'state/integrations/selectors'

export const useHasAccessToAILibrary = () => {
    const allSupportedStoreIntegrations: StoreIntegration[] =
        useAppSelector(getStoreIntegrations)

    return allSupportedStoreIntegrations.length > 0
}
