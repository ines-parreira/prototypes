import { useMemo } from 'react'

import type { View } from '@gorgias/helpdesk-types'

import { getPrivateViews, usePrivateViews } from './usePrivateViews'
import { getPublicViews, usePublicViews } from './usePublicViews'
import { getSystemViews, useSystemViews } from './useSystemViews'

/**
 * Returns every view the sidebar renders, in the order it renders them:
 * system views (top + bottom as `useSystemViews` returns them), then public
 * views (display order), then private views (display order). Dedupes by id.
 */
export function useAllViewsOrdered(): View[] {
    const systemViews = useSystemViews()
    const publicViews = usePublicViews()
    const privateViews = usePrivateViews()

    return useMemo(
        () => mergeOrdered(systemViews, publicViews, privateViews),
        [systemViews, publicViews, privateViews],
    )
}

/**
 * Non-hook variant: composes the `get*` getters that read from the same
 * React Query caches as the corresponding hooks. Used from non-React code
 * (e.g. the v3 scheduler) that needs the sidebar-ordered view list.
 */
export function getAllViewsOrdered(): View[] {
    return mergeOrdered(getSystemViews(), getPublicViews(), getPrivateViews())
}

function mergeOrdered(...lists: View[][]): View[] {
    const seen = new Set<number>()
    const out: View[] = []
    for (const list of lists) {
        for (const view of list) {
            if (view.id == null || seen.has(view.id)) continue
            seen.add(view.id)
            out.push(view)
        }
    }
    return out
}
