import {useMemo} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {HelpCenter} from 'models/helpCenter/types'
import {IntegrationType} from 'models/integration/constants'
import {ShopifyIntegration} from 'models/integration/types'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {getIntegrationsByTypes} from 'state/integrations/selectors'

const useHelpCentersByStoreId = (storesIntegrations: ShopifyIntegration[]) => {
    const {helpCenters, isLoading} = useHelpCenterList({
        per_page: HELP_CENTER_MAX_CREATION,
        type: 'faq',
    })

    const helpCentersByStoreId: Record<number, HelpCenter[]> = useMemo(
        () =>
            isLoading
                ? {}
                : storesIntegrations.reduce(
                      (acc, storeIntegration) => ({
                          ...acc,
                          [storeIntegration.id]: helpCenters.filter(
                              (helpCenter) =>
                                  helpCenter.shop_name === storeIntegration.name
                          ),
                      }),
                      {}
                  ),
        [helpCenters, isLoading, storesIntegrations]
    )

    return {isLoading, helpCentersByStoreId}
}

export const useTopQuestionsStoresWithHelpCenters = () => {
    // note: help-centers can only be connected to shopify stores at the moment, so we only show shopify integrations
    const storesIntegrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.Shopify])
    )

    const {helpCentersByStoreId, isLoading: isLoadingHelpCenters} =
        useHelpCentersByStoreId(storesIntegrations)

    const storesWithHelpCenters = useMemo(
        () =>
            isLoadingHelpCenters
                ? []
                : storesIntegrations
                      .map((store) => ({
                          store,
                          helpCenters: helpCentersByStoreId[store.id] ?? [],
                      }))
                      .filter(({helpCenters}) => helpCenters.length > 0),
        [storesIntegrations, helpCentersByStoreId, isLoadingHelpCenters]
    )

    return {
        isLoading: isLoadingHelpCenters,
        storesWithHelpCenters,
    }
}
