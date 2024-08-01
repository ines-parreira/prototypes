import {useCallback, useEffect, useMemo, useState} from 'react'
import {ShopifyIntegration} from 'models/integration/types'
import {HelpCenter} from 'models/helpCenter/types'
import {
    StoreWithHelpCenters,
    useTopQuestionsStoresWithHelpCenters,
} from './useTopQuestionsStoresWithHelpCenters'
import {makeHelpCenterFilter, makeStoreFilter} from './utils'
import {useFirstStoreAndHelpCenterWithTopQuestions} from './useFirstStoreAndHelpCenterWithTopQuestions'

type Props = {
    initialStoreId?: number
    initialHelpCenterId?: number
    searchFirstMatchingStoreAndHelpCenter?: boolean
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
    searchFirstMatchingStoreAndHelpCenter,
}: Props) => {
    const [selectedStore, setSelectedStoreRaw] = useState<
        ShopifyIntegration | undefined
    >(undefined)

    const [selectedHelpCenter, setSelectedHelpCenter] = useState<
        HelpCenter | undefined
    >(undefined)

    const {isLoading: isLoadingStoresWithHelpCenters, storesWithHelpCenters} =
        useTopQuestionsStoresWithHelpCenters()

    const {
        isLoading: isSearchingFirstStoreAndHelpCenter,
        firstMatchingStoreAndHelpCenter,
    } = useFirstStoreAndHelpCenterWithTopQuestions(
        storesWithHelpCenters,
        !isLoadingStoresWithHelpCenters &&
            searchFirstMatchingStoreAndHelpCenter === true
    )

    const isLoading =
        isLoadingStoresWithHelpCenters || isSearchingFirstStoreAndHelpCenter

    useEffect(() => {
        if (isLoading) {
            return
        }

        if (firstMatchingStoreAndHelpCenter) {
            setSelectedStoreRaw(
                firstMatchingStoreAndHelpCenter.firstMatchingStore
            )
            setSelectedHelpCenter(
                firstMatchingStoreAndHelpCenter.firstMatchingHelpCenter
            )
        }
    }, [isLoading, firstMatchingStoreAndHelpCenter])

    const storesById: Record<number, StoreWithHelpCenters> = useMemo(
        () =>
            isLoadingStoresWithHelpCenters
                ? {}
                : storesWithHelpCenters.reduce(
                      (acc, store) => ({
                          ...acc,
                          [store.store.id]: store,
                      }),
                      {}
                  ),
        [isLoadingStoresWithHelpCenters, storesWithHelpCenters]
    )

    useEffect(() => {
        if (isLoading) {
            return
        }

        if (
            (!selectedStore || !selectedHelpCenter) &&
            !firstMatchingStoreAndHelpCenter
        ) {
            const initialStoreAndHelpCenter = findInitialStoreAndHelpCenter(
                storesWithHelpCenters,
                initialStoreId,
                initialHelpCenterId
            )

            if (initialStoreAndHelpCenter) {
                setSelectedStoreRaw(initialStoreAndHelpCenter.initialStore)
                setSelectedHelpCenter(
                    initialStoreAndHelpCenter.initialHelpCenter
                )
            }

            return
        }
    }, [
        isLoading,
        initialStoreId,
        initialHelpCenterId,
        selectedStore,
        selectedHelpCenter,
        storesWithHelpCenters,
        firstMatchingStoreAndHelpCenter,
    ])

    const setSelectedStore: React.Dispatch<
        React.SetStateAction<ShopifyIntegration | undefined>
    > = useCallback(
        (setter) => {
            const newSelectedStore =
                typeof setter === 'function' ? setter(selectedStore) : setter

            const selectedStoreWithHelpCenters = storesWithHelpCenters.find(
                ({store}) => store.id === newSelectedStore?.id
            )

            if (selectedStoreWithHelpCenters) {
                const isNotOneOfStoreHelpCenters =
                    !selectedStoreWithHelpCenters.helpCenters.some(
                        ({id}) => id === selectedHelpCenter?.id
                    )

                if (isNotOneOfStoreHelpCenters) {
                    setSelectedHelpCenter(
                        selectedStoreWithHelpCenters.helpCenters[0]
                    )
                }
            }
            return setSelectedStoreRaw(newSelectedStore)
        },
        [
            selectedStore,
            setSelectedHelpCenter,
            setSelectedStoreRaw,
            storesWithHelpCenters,
            selectedHelpCenter,
        ]
    )

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
