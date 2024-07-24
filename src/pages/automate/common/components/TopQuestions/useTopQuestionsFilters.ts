import {useEffect, useMemo, useState} from 'react'
import {ShopifyIntegration} from 'models/integration/types'
import {HelpCenter} from 'models/helpCenter/types'
import {useTopQuestionsStoresWithHelpCenters} from './useTopQuestionsStoresWithHelpCenters'
import {makeHelpCenterFilter, makeStoreFilter} from './utils'

type StoreWithHelpCenters = {
    store: ShopifyIntegration
    helpCenters: HelpCenter[]
}

type Props = {
    initialStoreId?: number
    initialHelpCenterId?: number
}

const findInitialStoreAndHelpCenter = (
    storesWithHelpCenters: StoreWithHelpCenters[],
    initialStoreId?: number,
    initialHelpCenterId?: number
) => {
    const initialStore =
        storesWithHelpCenters.find(({store: {id}}) => id === initialStoreId) ??
        storesWithHelpCenters.find(({helpCenters}) =>
            helpCenters.some(({id}) => id === initialHelpCenterId)
        ) ??
        storesWithHelpCenters[0]

    if (!initialStore) {
        return
    }

    const initialHelpCenter =
        initialStore.helpCenters.find(({id}) => id === initialHelpCenterId) ??
        initialStore.helpCenters[0]

    if (!initialHelpCenter) {
        return
    }

    return {initialStore: initialStore.store, initialHelpCenter}
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
        if (isLoading) {
            return
        }

        if (!selectedStore || !selectedHelpCenter) {
            const initialStoreAndHelpCenter = findInitialStoreAndHelpCenter(
                storesWithHelpCenters,
                initialStoreId,
                initialHelpCenterId
            )

            if (initialStoreAndHelpCenter) {
                setSelectedStore(initialStoreAndHelpCenter.initialStore)
                setSelectedHelpCenter(
                    initialStoreAndHelpCenter.initialHelpCenter
                )
            }

            return
        }

        const selectedStoreWithHelpCenters = storesWithHelpCenters.find(
            ({store}) => store.id === selectedStore.id
        )

        if (selectedStoreWithHelpCenters) {
            const isNotOneOfStoreHelpCenters =
                !selectedStoreWithHelpCenters.helpCenters.some(
                    ({id}) => id === selectedHelpCenter.id
                )

            if (isNotOneOfStoreHelpCenters) {
                setSelectedHelpCenter(
                    selectedStoreWithHelpCenters.helpCenters[0]
                )
            }
        }
    }, [
        isLoading,
        initialStoreId,
        initialHelpCenterId,
        selectedStore,
        selectedHelpCenter,
        storesWithHelpCenters,
    ])

    const storeFilter = useMemo(
        () =>
            makeStoreFilter(
                storesWithHelpCenters.map(({store}) => store),
                setSelectedStore
            ),
        [storesWithHelpCenters, setSelectedStore]
    )

    const helpCenterFilter = useMemo(
        () =>
            makeHelpCenterFilter(
                selectedStore ? storesById[selectedStore.id].helpCenters : [],
                setSelectedHelpCenter
            ),
        [selectedStore, storesById, setSelectedHelpCenter]
    )

    return {
        isLoading,
        selectedStore,
        storeFilter,
        selectedHelpCenter,
        helpCenterFilter,
    }
}
