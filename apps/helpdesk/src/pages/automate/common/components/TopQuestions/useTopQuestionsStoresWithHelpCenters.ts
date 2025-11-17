import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import type { HelpCenter } from 'models/helpCenter/types'
import type { StoreIntegration } from 'models/integration/types'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import { useHelpCenterList } from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import { getStoreIntegrations } from 'state/integrations/selectors'
import type { NonEmptyArray } from 'types'

export type StoreWithHelpCenters = {
    store: StoreIntegration
    helpCenters: NonEmptyArray<HelpCenter>
}

const useHelpCentersByStoreId = (storesIntegrations: StoreIntegration[]) => {
    const { helpCenters, isLoading } = useHelpCenterList({
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
                                  helpCenter.shop_name ===
                                  storeIntegration.name,
                          ),
                      }),
                      {},
                  ),
        [helpCenters, isLoading, storesIntegrations],
    )

    return { isLoading, helpCentersByStoreId }
}

const isStoreWithHelpCenter = (
    maybeStoreWithHelpCenter: Omit<StoreWithHelpCenters, 'helpCenters'> & {
        helpCenters: HelpCenter[]
    },
): maybeStoreWithHelpCenter is StoreWithHelpCenters =>
    maybeStoreWithHelpCenter.helpCenters.length > 0

export const useTopQuestionsStoresWithHelpCenters = (): {
    isLoading: boolean
    storesWithHelpCenters: StoreWithHelpCenters[]
} => {
    const storesIntegrations = useAppSelector(getStoreIntegrations)

    const { helpCentersByStoreId, isLoading: isLoadingHelpCenters } =
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
                      .filter(isStoreWithHelpCenter),
        [storesIntegrations, helpCentersByStoreId, isLoadingHelpCenters],
    )

    return {
        isLoading: isLoadingHelpCenters,
        storesWithHelpCenters,
    }
}
