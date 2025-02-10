import React, {useMemo, useState} from 'react'

import useAppSelector from 'hooks/useAppSelector'

import {PendingTasksSection} from 'pages/aiAgent/Overview/components/PendingTasksSection/PendingTasksSection'
import {usePendingTasksRuleEngine} from 'pages/aiAgent/Overview/hooks/pendingTasks/usePendingTasksRuleEngine'
import {getCurrentDomain} from 'state/currentAccount/selectors'
import {getStoreIntegrations} from 'state/integrations/selectors'

/**
 * To ease the incremental implementation of the PendingTasksSection component
 * we decided to split the component with a connected version of it
 * to decouple data fetching and presentation logic and ease implementation of it in storybook
 * */
export const PendingTasksSectionConnected = () => {
    const rawStores = useAppSelector(getStoreIntegrations)
    const accountDomain = useAppSelector(getCurrentDomain)

    const stores = useMemo(
        () => rawStores.map((store) => ({name: store.name, id: store.id})),
        [rawStores]
    )

    const [selectedStore, setSelectedStore] = useState(stores[0])

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
            onStoreChange={setSelectedStore}
            isLoading={isLoading}
            pendingTasks={pendingTasks}
            completedTasks={completedTasks}
        />
    )
}
