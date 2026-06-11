import { useMemo } from 'react'

import { appQueryClient } from '@repo/api-resources'

import type { IconName } from '@gorgias/axiom'
import { queryKeys, useListAllViews } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import {
    BOTTOM_SYSTEM_VIEW_NAMES,
    DEFAULT_BOTTOM_SYSTEM_VIEW_ORDER,
    DEFAULT_TOP_SYSTEM_VIEW_ORDER,
    TOP_SYSTEM_VIEW_NAMES,
    VIEWS_STALE_TIME,
} from '../constants'
import type { AllViewsQueryData } from './allViewsQuery'
import { getAllViewsFromQueryData } from './allViewsQuery'
import {
    getPublicViewsOrdering,
    usePublicViewsOrdering,
} from './usePublicViewsOrdering'

export type SystemView = View & {
    id: number
    name: string
    icon: IconName | null
}

export const SYSTEM_VIEWS_QUERY_PARAMS = {
    limit: 100,
    category: 'system',
} as const

export function useSystemViews(): SystemView[] {
    const { items: views } = useListAllViews(SYSTEM_VIEWS_QUERY_PARAMS, {
        query: {
            staleTime: VIEWS_STALE_TIME,
            refetchOnWindowFocus: false,
        },
    })

    const ordering = usePublicViewsOrdering()

    return useMemo(
        () =>
            selectSystemViews(views, ordering.views_top, ordering.views_bottom),
        [views, ordering.views_top, ordering.views_bottom],
    )
}

/**
 * Non-hook variant: reads the same React Query caches `useSystemViews` does
 * and applies the same selection. Used from non-React code (e.g. the v3
 * scheduler) that needs the ordered sidebar view list.
 */
export function getSystemViews(): SystemView[] {
    const data = appQueryClient.getQueryData<AllViewsQueryData>(
        queryKeys.views.listAllViews(SYSTEM_VIEWS_QUERY_PARAMS),
    )
    const views = getAllViewsFromQueryData(data)
    const ordering = getPublicViewsOrdering()
    return selectSystemViews(views, ordering.views_top, ordering.views_bottom)
}

export function selectSystemViews(
    views: View[],
    topOrdering: Record<string, { display_order: number }>,
    bottomOrdering: Record<string, { display_order: number }>,
): SystemView[] {
    const withIcons = views
        .filter(
            (v): v is View & { id: number; name: string } =>
                !!v.name && v.id != null,
        )
        .map((v) => ({
            ...v,
            icon: ICON_BY_NAME.get(v.name) ?? null,
        }))

    const top = sortWithFallback(
        withIcons.filter((v) => TOP_SYSTEM_VIEW_NAMES.includes(v.name)),
        topOrdering,
        DEFAULT_TOP_SYSTEM_VIEW_ORDER,
    )

    const bottom = sortWithFallback(
        withIcons.filter((v) => BOTTOM_SYSTEM_VIEW_NAMES.includes(v.name)),
        bottomOrdering,
        DEFAULT_BOTTOM_SYSTEM_VIEW_ORDER,
    )

    return [...top, ...bottom]
}

function sortWithFallback(
    items: SystemView[],
    orderingMap: Record<string, { display_order: number }>,
    defaultOrder: Record<string, number>,
): SystemView[] {
    return [...items].sort((a, b) => {
        const orderA =
            orderingMap[String(a.id)]?.display_order ??
            defaultOrder[a.name] ??
            Infinity
        const orderB =
            orderingMap[String(b.id)]?.display_order ??
            defaultOrder[b.name] ??
            Infinity
        return orderA - orderB
    })
}

const ICON_BY_NAME = new Map<string, IconName>([
    ['Inbox', 'user-arrow'],
    ['Unassigned', 'folder-remove'],
    ['All', 'inbox'],
    ['Snoozed', 'timer-snooze'],
    ['Closed', 'check-circle'],
    ['Trash', 'trash-empty'],
    ['Spam', 'error-octagon'],
])
