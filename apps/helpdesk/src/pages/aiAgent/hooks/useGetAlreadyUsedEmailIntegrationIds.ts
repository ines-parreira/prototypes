import { useMemo } from 'react'

import { uniq } from 'lodash'

import useAppSelector from 'hooks/useAppSelector'
import { useGetStoresConfigurationForAccount } from 'models/aiAgent/queries'
import { useGetOnboardings } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardings'
import { getCurrentDomain } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

/**
 * Hook that retrieves a list of email integration IDs that are already being used by other stores.
 * It checks both store configurations and onboarding data to find all email integrations in use,
 * filtering to only include data from non-deleted stores in the Shopify integrations.
 *
 * @param currentStoreName - The name of the store to get the already used email integrations for.
 * @returns An array of unique email integration IDs that are already being used by other stores.
 */
export const useGetAlreadyUsedEmailIntegrationIds = (
    currentStoreName: string = '',
) => {
    const accountDomain = useAppSelector(getCurrentDomain)

    const shopifyIntegrations = useAppSelector(
        getShopifyIntegrationsSortedByName,
    )
    // Get all other active store names (excluding the current store)
    const otherActiveStoreNames = shopifyIntegrations
        .map((store) => store.name)
        .filter((name) => name !== currentStoreName)

    const { data: onboardingsData } = useGetOnboardings()
    const onboardings = onboardingsData ?? []

    // Select onboardings from other active store names that have not yet been completed
    const otherActiveOnboardings = onboardings.filter(
        (onboarding) =>
            otherActiveStoreNames.includes(onboarding.shopName ?? '') &&
            !onboarding.completedDatetime,
    )

    const { data: storeConfigurationsResponse } =
        useGetStoresConfigurationForAccount({
            accountDomain,
        })
    const storeConfigurations =
        storeConfigurationsResponse?.storeConfigurations ?? []
    const otherActiveStoreConfigurations = storeConfigurations.filter(
        (config) => otherActiveStoreNames.includes(config.storeName),
    )

    const alreadyUsedEmailIntegrationsIds = useMemo(() => {
        const emailIdsFromConfigurations =
            otherActiveStoreConfigurations.flatMap((config) =>
                config.monitoredEmailIntegrations.map(
                    (integration) => integration.id,
                ),
            )

        const emailIdsFromOnboardings = otherActiveOnboardings.flatMap(
            (onboarding) => onboarding.emailIntegrationIds ?? [],
        )

        return uniq([...emailIdsFromConfigurations, ...emailIdsFromOnboardings])
    }, [otherActiveOnboardings, otherActiveStoreConfigurations])

    return alreadyUsedEmailIntegrationsIds
}
