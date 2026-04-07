import { useMemo } from 'react'

import { useStore } from 'zustand'

import type { View } from '@gorgias/helpdesk-types'

import { activeViewStore } from '../store/activeViewStore'
import { useActiveViewUrlSync } from './useActiveViewUrlSync'
import { useAllViews } from './useAllViews'

export function useActiveView(): View | null {
    useActiveViewUrlSync()

    const activeViewId = useStore(activeViewStore, (s) => s.activeViewId)
    const views = useAllViews()

    return useMemo(
        () => views.find((v) => v.id === activeViewId) ?? null,
        [views, activeViewId],
    )
}
