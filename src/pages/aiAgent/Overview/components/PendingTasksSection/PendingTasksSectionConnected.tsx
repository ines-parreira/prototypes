import React, {useCallback, useMemo, useState} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import useLocalStorageWithExpiry from 'hooks/useLocalStorageWithExpiry'
import {PendingTasksSection} from 'pages/aiAgent/Overview/components/PendingTasksSection/PendingTasksSection'
import {usePendingTasksRuleEngine} from 'pages/aiAgent/Overview/hooks/pendingTasks/usePendingTasksRuleEngine'
import {
    getCurrentAccountId,
    getCurrentDomain,
} from 'state/currentAccount/selectors'
import {getStoreIntegrations} from 'state/integrations/selectors'

type Store = {
    name: string
    id: number
}

const expireIn1Hour = 3_600 * 1_000

/**
 * To ease the incremental implementation of the PendingTasksSection component
 * we decided to split the component with a connected version of it
 * to decouple data fetching and presentation logic and ease implementation of it in storybook
 * */
export const PendingTasksSectionConnected = () => {
    const rawStores = useAppSelector(getStoreIntegrations)
    const accountDomain = useAppSelector(getCurrentDomain)
    const accountId = useAppSelector(getCurrentAccountId)

    const stores = useMemo(
        () =>
            rawStores.map<Store>((store) => ({name: store.name, id: store.id})),
        [rawStores]
    )

    const selectedStoreStorageKey = `ai-agent-pending-tasks:${accountId}`
    const {
        state: selectedStoreFromStorage,
        setState: setSelectedStoreToStorage,
    } = useLocalStorageWithExpiry<Store>(
        selectedStoreStorageKey,
        expireIn1Hour,
        stores[0]
    )

    const [selectedStore, setSelectedStore] = useState(selectedStoreFromStorage)

    const setSelectedStoreAndPersist = useCallback(
        (store: Store) => {
            setSelectedStore(store)
            setSelectedStoreToStorage(store)
        },
        [setSelectedStoreToStorage]
    )

    const {isLoading, pendingTasks, completedTasks} = usePendingTasksRuleEngine(
        {
            accountDomain,
            storeName: selectedStore.name,
        }
    )

    return (
        <PendingTasksSection
            stores={stores}
            selectedStore={selectedStore}
            onStoreChange={setSelectedStoreAndPersist}
            isLoading={isLoading}
            pendingTasks={pendingTasks}
            completedTasks={completedTasks}
        />
    )
}
