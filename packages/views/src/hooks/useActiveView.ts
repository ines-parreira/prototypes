import { useMemo } from 'react'

import { useStore } from 'zustand'

import type { View } from '@gorgias/helpdesk-types'

import { viewsCountStore } from '../store/viewsCountStore'
import { useAllViews } from './useAllViews'

export function useActiveView(): View | null {
    const activeViewId = useStore(viewsCountStore, (s) => s.activeViewId)
    const views = useAllViews()

    return useMemo(
        () => views.find((v) => v.id === activeViewId) ?? null,
        [views, activeViewId],
    )
}
