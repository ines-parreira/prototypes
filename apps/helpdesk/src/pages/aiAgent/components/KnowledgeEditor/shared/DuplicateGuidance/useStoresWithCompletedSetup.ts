import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import type { StoreIntegration } from 'models/integration/types'
import { isWizardSetupCompleted } from 'pages/aiAgent/utils/wizardSetupHelpers'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

/**
 * Returns only stores that have completed AI agent setup.
 *
 * Uses isWizardSetupCompleted() to determine completion status.
 * @see isWizardSetupCompleted for completion logic
 */
export const useStoresWithCompletedSetup = (): StoreIntegration[] => {
    const allStores = useStoreIntegrations()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { data: storeConfigsResponse, isLoading } =
        useGetStoresConfigurationForAccount({
            accountDomain,
        })

    return useMemo(() => {
        // While loading, show no stores to avoid flickering
        if (isLoading || !storeConfigsResponse) {
            return []
        }

        const storeConfigurations = storeConfigsResponse.storeConfigurations

        const completedSetupStores = new Set(
            storeConfigurations
                .filter(isWizardSetupCompleted)
                .map((config) => config.storeName),
        )

        return allStores.filter((store) => completedSetupStores.has(store.name))
    }, [allStores, storeConfigsResponse, isLoading])
}
