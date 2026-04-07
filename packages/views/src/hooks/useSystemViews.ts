import { useMemo } from 'react'

import type { IconName } from '@gorgias/axiom'
import { useListAllViews } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import { VIEWS_STALE_TIME } from '../constants'
import { usePublicViewsOrdering } from './usePublicViewsOrdering'

export type SystemView = View & {
    id: number
    name: string
    icon: IconName | null
}

const TOP_VIEW_NAMES = new Set(['Inbox', 'Unassigned', 'All', 'Snoozed'])
const BOTTOM_VIEW_NAMES = new Set(['Closed', 'Trash', 'Spam'])

const DEFAULT_TOP_ORDER: Record<string, number> = {
    Inbox: 0,
    Unassigned: 1,
    All: 2,
    Snoozed: 3,
}

const DEFAULT_BOTTOM_ORDER: Record<string, number> = {
    Closed: 0,
    Trash: 1,
    Spam: 2,
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
            withIcons.filter((v) => TOP_VIEW_NAMES.has(v.name)),
            ordering.views_top,
            DEFAULT_TOP_ORDER,
        )

        const bottom = sortWithFallback(
            withIcons.filter((v) => BOTTOM_VIEW_NAMES.has(v.name)),
            ordering.views_bottom,
            DEFAULT_BOTTOM_ORDER,
        )

        return [...top, ...bottom]
    }, [views, ordering.views_top, ordering.views_bottom])
}

const ICON_BY_NAME = new Map<string, IconName>([
    ['Inbox', 'user-arrow'],
    ['Unassigned', 'folder-remove'],
    ['All', 'inbox'],
    ['Snoozed', 'timer-snooze'],
    ['Closed', 'circle-check'],
    ['Trash', 'trash-empty'],
    ['Spam', 'octagon-error'],
])
