import { useCallback } from 'react'

import { useStore } from 'zustand'

import { viewsCountStore } from '../store/viewsCountStore'
import { useAllViewSections } from './useAllViewSections'

type UseExpandedSectionsResult = {
    expandedKeys: string[]
    onExpandedChange: (keys: string[]) => void
}

export function useExpandedSections(): UseExpandedSectionsResult {
    const expandedSectionIds = useStore(
        viewsCountStore,
        (s) => s.expandedSectionIds,
    )
    const allSections = useAllViewSections()

    const expandedKeys = expandedSectionIds ?? [
        ...DEFAULT_CATEGORY_KEYS,
        ...allSections.map((s) => `section-${s.id}`),
    ]

    const onExpandedChange = useCallback((keys: string[]) => {
        viewsCountStore.setState({ expandedSectionIds: keys })
    }, [])

    return { expandedKeys, onExpandedChange }
}

const DEFAULT_CATEGORY_KEYS = ['public', 'private']
