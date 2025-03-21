import { useMemo } from 'react'

import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { useGetOnboardings } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardings'
import { getCurrentDomain } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

export const useGetUsedEmailIntegrations = () => {
    const accountDomain = useAppSelector(getCurrentDomain)
    const { shopName } = useParams<{ shopName: string }>()

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

    const usedEmailIntegrations = useMemo(() => {
        const usedInConfigurations = storeConfigurations
            ? storeConfigurations.reduce<number[]>(
                  (acc, element) =>
                      acc.concat(
                          element.monitoredEmailIntegrations.map(
                              (item) => item.id,
                          ),
                      ),
                  [],
              )
            : []
        const usedInOnboarding = currentOnboardings
            ? currentOnboardings
                  .filter((element) => element.shopName !== shopName)
                  .reduce<
                      number[]
                  >((acc, element) => acc.concat(element.emailIntegrationIds ?? []), [])
            : []

        return [...usedInConfigurations, ...usedInOnboarding]
    }, [storeConfigurations, currentOnboardings, shopName])

    return usedEmailIntegrations
}
