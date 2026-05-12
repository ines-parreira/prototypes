import { useMemo } from 'react'

import type { IconName } from '@gorgias/axiom'
import { useListAllViews } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import {
    BOTTOM_SYSTEM_VIEW_NAMES,
    DEFAULT_BOTTOM_SYSTEM_VIEW_ORDER,
    DEFAULT_TOP_SYSTEM_VIEW_ORDER,
    TOP_SYSTEM_VIEW_NAMES,
    VIEWS_STALE_TIME,
} from '../constants'
import { usePublicViewsOrdering } from './usePublicViewsOrdering'

export type SystemView = View & {
    id: number
    name: string
    icon: IconName | null
}

export function useSystemViews(): SystemView[] {
    const { items: views } = useListAllViews(
        { limit: 100, category: 'system' },
        {
            query: {
                staleTime: VIEWS_STALE_TIME,
                refetchOnWindowFocus: false,
            },
        },
    )

    const ordering = usePublicViewsOrdering()

    return useMemo(() => {
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
            ordering.views_top,
            DEFAULT_TOP_SYSTEM_VIEW_ORDER,
        )

        const bottom = sortWithFallback(
            withIcons.filter((v) => BOTTOM_SYSTEM_VIEW_NAMES.includes(v.name)),
            ordering.views_bottom,
            DEFAULT_BOTTOM_SYSTEM_VIEW_ORDER,
        )

        return [...top, ...bottom]
    }, [views, ordering.views_top, ordering.views_bottom])
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
