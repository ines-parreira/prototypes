import { useCallback, useMemo, useState } from 'react'

import type { ShopifyIntegration } from 'models/integration/types'

import type { MetafieldCategory, NavigationLevel } from './types'
import { CATEGORIES } from './utils'

export type UseSubmenuNavigationReturn = {
    currentLevel: NavigationLevel
    selectedStore: ShopifyIntegration | null
    selectedCategory: MetafieldCategory | null
    backButtonLabel: string
    handleBack: (e: React.MouseEvent) => void
    handleStoreSelect: (e: React.MouseEvent, store: ShopifyIntegration) => void
    handleCategorySelect: (
        e: React.MouseEvent,
        category: MetafieldCategory,
    ) => void
    resetSubmenuState: () => void
}

export function useSubmenuNavigation(): UseSubmenuNavigationReturn {
    const [currentLevel, setCurrentLevel] = useState<NavigationLevel>('stores')
    const [selectedStore, setSelectedStore] =
        useState<ShopifyIntegration | null>(null)
    const [selectedCategory, setSelectedCategory] =
        useState<MetafieldCategory | null>(null)

    const backButtonLabel = useMemo(() => {
        if (currentLevel === 'categories' && selectedStore) {
            return selectedStore.name
        }
        if (currentLevel === 'metafields' && selectedCategory) {
            const categoryObj = CATEGORIES.find(
                (c) => c.id === selectedCategory,
            )
            return categoryObj?.name ?? selectedCategory
        }
        return ''
    }, [currentLevel, selectedStore, selectedCategory])

    const handleBack = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            if (currentLevel === 'metafields') {
                setCurrentLevel('categories')
                setSelectedCategory(null)
            } else if (currentLevel === 'categories') {
                setCurrentLevel('stores')
                setSelectedStore(null)
            }
        },
        [currentLevel],
    )

    const handleStoreSelect = useCallback(
        (e: React.MouseEvent, store: ShopifyIntegration) => {
            e.stopPropagation()
            setSelectedStore(store)
            setCurrentLevel('categories')
        },
        [],
    )

    const handleCategorySelect = useCallback(
        (e: React.MouseEvent, category: MetafieldCategory) => {
            e.stopPropagation()
            setSelectedCategory(category)
            setCurrentLevel('metafields')
        },
        [],
    )

    const resetSubmenuState = useCallback(() => {
        setCurrentLevel('stores')
        setSelectedStore(null)
        setSelectedCategory(null)
    }, [])

    return {
        currentLevel,
        selectedStore,
        selectedCategory,
        backButtonLabel,
        handleBack,
        handleStoreSelect,
        handleCategorySelect,
        resetSubmenuState,
    }
}
