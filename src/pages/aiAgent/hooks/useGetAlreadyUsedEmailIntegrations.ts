import { useMemo } from 'react'

import { uniq } from 'lodash'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { useGetOnboardings } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardings'
import { getCurrentDomain } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

export const useGetAlreadyUsedEmailIntegrations = (shopNameParam?: string) => {
    const accountDomain = useAppSelector(getCurrentDomain)
    const { shopName: shopNameFromParams } = useParams<{ shopName: string }>()

    const shopName = shopNameParam || shopNameFromParams

    const stores = useAppSelector(getShopifyIntegrationsSortedByName)
    const { data: currentOnboardings } = useGetOnboardings()

    const storesName = useMemo(
        () =>
            stores
                .filter((element) => element.name !== shopName)
                .map((store) => store.name),
        [stores, shopName],
    )

    const { storeConfigurations } = useStoreConfigurationForAccount({
        accountDomain,
        storesName,
    })

    const alreadyUsedEmailIntegrations = useMemo(() => {
        const otherStoreConfigurations =
            storeConfigurations?.filter(
                (configuration) => configuration.storeName !== shopName,
            ) ?? []

        const usedInConfigurations = otherStoreConfigurations.reduce<number[]>(
            (used, configuration) =>
                used.concat(
                    configuration.monitoredEmailIntegrations.map(
                        (integration) => integration.id,
                    ),
                ),
            [],
        )

        const otherOnboardings =
            currentOnboardings?.filter(
                (onboarding) => onboarding.shopName !== shopName,
            ) ?? []

        const usedInOnboarding = otherOnboardings.reduce<number[]>(
            (used, onboarding) =>
                used.concat(onboarding.emailIntegrationIds ?? []),
            [],
        )

        return uniq([...usedInConfigurations, ...usedInOnboarding])
    }, [storeConfigurations, currentOnboardings, shopName])

    return alreadyUsedEmailIntegrations
}
