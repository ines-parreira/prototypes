import { useCallback, useMemo, useState } from 'react'

import { useLocation } from 'react-router'

import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import useLocalStorageWithExpiry from 'hooks/useLocalStorageWithExpiry'
import { IntegrationType } from 'models/integration/constants'
import { PendingTasksSection } from 'pages/aiAgent/Overview/components/PendingTasksSection/PendingTasksSection'
import { usePendingTasksRuleEngine } from 'pages/aiAgent/Overview/hooks/pendingTasks/usePendingTasksRuleEngine'
import {
    getCurrentAccountId,
    getCurrentDomain,
} from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

type Store = {
    id: number
    name: string
    type: IntegrationType
}

const expireIn1Hour = 3_600 * 1_000

/**
 * To ease the incremental implementation of the PendingTasksSection component
 * we decided to split the component with a connected version of it
 * to decouple data fetching and presentation logic and ease implementation of it in storybook
 * */
export const PendingTasksSectionConnected = () => {
    const rawStores = useAppSelector(getShopifyIntegrationsSortedByName)
    const accountDomain = useAppSelector(getCurrentDomain)
    const accountId = useAppSelector(getCurrentAccountId)

    const { search } = useLocation()
    const shopName = useMemo(() => {
        const urlParams = new URLSearchParams(search)
        return urlParams.get('shopName')
    }, [search])

    const stores = useMemo(
        () =>
            rawStores.map<Store>((store) => ({
                name: store.name,
                id: store.id,
                type: store.type,
            })),
        [rawStores],
    )
    const store = useMemo(
        () => stores.find((store) => store.name === shopName),
        [stores, shopName],
    )

    const selectedStoreStorageKey = `ai-agent-pending-tasks:${accountId}`
    const {
        state: selectedStoreFromStorage,
        setState: setSelectedStoreToStorage,
    } = useLocalStorageWithExpiry<Store>(
        selectedStoreStorageKey,
        expireIn1Hour,
        store ?? stores[0],
    )

    const [selectedStore, setSelectedStore] = useState(selectedStoreFromStorage)

    const setSelectedStoreAndPersist = useCallback(
        (store: Store) => {
            setSelectedStore(store)
            setSelectedStoreToStorage(store)
        },
        [setSelectedStoreToStorage],
    )

    useEffectOnce(() => {
        setSelectedStoreAndPersist(store ?? stores[0])
    })

    const { isLoading, isFetched, pendingTasks, completedTasks } =
        usePendingTasksRuleEngine({
            accountDomain,
            storeName: selectedStore.name,
            storeType: selectedStore.type,
            refetchOnWindowFocus: false,
        })

    return (
        <PendingTasksSection
            stores={stores}
            selectedStore={selectedStore}
            onStoreChange={setSelectedStoreAndPersist}
            isLoading={isLoading}
            isFetched={isFetched}
            pendingTasks={pendingTasks}
            completedTasks={completedTasks}
        />
    )
}
