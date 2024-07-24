import {useEffect, useMemo, useState} from 'react'
import {ShopifyIntegration} from 'models/integration/types'
import {HelpCenter} from 'models/helpCenter/types'
import {useTopQuestionsStoresWithHelpCenters} from './useTopQuestionsStoresWithHelpCenters'

type StoreWithHelpCenters = {
    store: ShopifyIntegration
    helpCenters: HelpCenter[]
}

type Props = {
    initialStoreId?: number
    initialHelpCenterId?: number
}

export const useTopQuestionsFilters = ({
    initialStoreId,
    initialHelpCenterId,
}: Props) => {
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
    }, [isLoading, selectedHelpCenter, selectedStore, storesWithHelpCenters])

    useEffect(() => {
        if (initialStoreId || initialHelpCenterId) {
            let store: ShopifyIntegration | undefined
            let helpCenter: HelpCenter | undefined

            if (initialStoreId) {
                store = storesWithHelpCenters.find(
                    ({store}) => store.id === initialStoreId
                )?.store
                if (store) {
                    if (initialHelpCenterId) {
                        helpCenter = storesById[store.id].helpCenters.find(
                            (hc) => hc.id === initialHelpCenterId
                        )
                    }
                    if (!helpCenter) {
                        helpCenter = storesById[store.id]?.helpCenters[0]
                    }
                }
            }
            if (!store && initialHelpCenterId) {
                for (const {store: s, helpCenters} of storesWithHelpCenters) {
                    const hc = helpCenters.find(
                        (hc) => hc.id === initialHelpCenterId
                    )
                    if (hc) {
                        helpCenter = hc
                        store = s
                        break
                    }
                }
            }

            if (store) {
                setSelectedStore(store)
                setSelectedHelpCenter(helpCenter)
                return
            }
        }
    }, [
        isLoading,
        selectedStore,
        storesWithHelpCenters,
        selectedHelpCenter,
        initialStoreId,
        initialHelpCenterId,
        storesById,
    ])

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
