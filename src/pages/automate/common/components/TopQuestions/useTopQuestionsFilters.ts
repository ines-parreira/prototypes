import {useEffect, useMemo, useState} from 'react'
import {ShopifyIntegration} from 'models/integration/types'
import {HelpCenter} from 'models/helpCenter/types'
import {useTopQuestionsStoresWithHelpCenters} from './useTopQuestionsStoresWithHelpCenters'

type StoreWithHelpCenters = {
    store: ShopifyIntegration
    helpCenters: HelpCenter[]
}

export const useTopQuestionsFilters = () => {
    const {isLoading, storesWithHelpCenters} =
        useTopQuestionsStoresWithHelpCenters()

    const storesById: Record<number, StoreWithHelpCenters> = useMemo(
        () =>
            isLoading
                ? {}
                : storesWithHelpCenters.reduce(
                      (acc, store) => ({
                          ...acc,
                          [store.store.id]: store,
                      }),
                      {}
                  ),
        [isLoading, storesWithHelpCenters]
    )

    const [selectedStore, setSelectedStore] = useState<
        ShopifyIntegration | undefined
    >(undefined)

    const [selectedHelpCenter, setSelectedHelpCenter] = useState<
        HelpCenter | undefined
    >(undefined)

    useEffect(() => {
        function selectDefaultStoreAndHelpCenter() {
            if (
                !isLoading &&
                !selectedStore &&
                storesWithHelpCenters.length > 0
            ) {
                const {store, helpCenters} = storesWithHelpCenters[0]

                setSelectedStore(store)

                if (!selectedHelpCenter && helpCenters.length > 0) {
                    setSelectedHelpCenter(helpCenters[0])
                }
            }
        }

        selectDefaultStoreAndHelpCenter()
    }, [isLoading, selectedStore, storesWithHelpCenters, selectedHelpCenter])

    return {
        isLoading,
        selectedStore,
        setSelectedStore,
        selectedHelpCenter,
        setSelectedHelpCenter,
        storeOptions: storesWithHelpCenters.map(({store}) => store),
        helpCentersOptions: selectedStore
            ? storesById[selectedStore.id].helpCenters
            : [],
    }
}
