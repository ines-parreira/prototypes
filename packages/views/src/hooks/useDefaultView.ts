import { useMemo } from 'react'

import { tryLocalStorage } from '@repo/browser-storage'

import { useListAccountSettings } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import {
    BOTTOM_SYSTEM_VIEW_NAMES,
    TOP_SYSTEM_VIEW_NAMES,
    VIEWS_STALE_TIME,
} from '../constants'
import type { DisplayOrderMap, ViewSection } from '../types'
import { isViewsVisibilityData } from '../types'
import { usePrivateViews } from './usePrivateViews'
import { usePrivateViewSections } from './usePrivateViewSections'
import { usePrivateViewsOrdering } from './usePrivateViewsOrdering'
import { usePublicViews } from './usePublicViews'
import { usePublicViewSections } from './usePublicViewSections'
import { usePublicViewsOrdering } from './usePublicViewsOrdering'
import { useSystemViews } from './useSystemViews'

const VIEW_CATEGORIES_STORAGE_KEY = 'viewCategories'

type CategoryPreference = 'public' | 'private'

type SectionsOrdering = {
    views: DisplayOrderMap
    view_sections: DisplayOrderMap
}

export function useDefaultView(): View | null {
    const systemViews = useSystemViews()
    const hiddenViewIds = useHiddenViewIds()
    const publicViews = usePublicViews()
    const publicSections = usePublicViewSections()
    const publicOrdering = usePublicViewsOrdering()
    const privateViews = usePrivateViews()
    const privateSections = usePrivateViewSections()
    const privateOrdering = usePrivateViewsOrdering()

    return useMemo(() => {
        const hidden = new Set(hiddenViewIds)

        const topSystemView = systemViews.find(
            (v) => TOP_SYSTEM_VIEW_NAMES.includes(v.name) && !hidden.has(v.id),
        )
        if (topSystemView) {
            return topSystemView
        }

        const preferPrivate =
            readFirstCategoryPreference() === 'private' &&
            privateViews.length > 0

        const firstFromNavbar = preferPrivate
            ? findFirstViewInNavbar(
                  privateViews,
                  privateSections,
                  privateOrdering,
              )
            : findFirstViewInNavbar(publicViews, publicSections, publicOrdering)

        if (firstFromNavbar) {
            return firstFromNavbar
        }

        return (
            systemViews.find(
                (v) =>
                    BOTTOM_SYSTEM_VIEW_NAMES.includes(v.name) &&
                    !hidden.has(v.id),
            ) ?? null
        )
    }, [
        systemViews,
        hiddenViewIds,
        publicViews,
        publicSections,
        publicOrdering,
        privateViews,
        privateSections,
        privateOrdering,
    ])
}

function useHiddenViewIds(): number[] {
    const { data } = useListAccountSettings(
        { type: 'views-visibility' },
        {
            query: {
                staleTime: VIEWS_STALE_TIME,
                refetchOnWindowFocus: false,
                select: (response) => {
                    const setting = response.data.data[0]
                    return isViewsVisibilityData(setting?.data)
                        ? setting.data.hidden_views
                        : []
                },
            },
        },
    )

    return data ?? EMPTY_HIDDEN_IDS
}

const EMPTY_HIDDEN_IDS: number[] = []

function readFirstCategoryPreference(): CategoryPreference {
    const stored: unknown = tryLocalStorage(() =>
        window.localStorage.getItem(VIEW_CATEGORIES_STORAGE_KEY),
    )

    if (typeof stored !== 'string' || stored === '') {
        return 'public'
    }

    try {
        const parsed: unknown = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed[0] === 'private') {
            return 'private'
        }
    } catch {
        // fall through to default
    }

    return 'public'
}

type NavbarElement =
    | { kind: 'view'; order: number; view: View }
    | { kind: 'section'; order: number; firstChild: View | null }

function findFirstViewInNavbar(
    views: View[],
    sections: ViewSection[],
    ordering: SectionsOrdering,
): View | null {
    const sectionIds = new Set(
        sections.map((s) => s.id).filter((id): id is number => id != null),
    )

    const standaloneViews = views.filter(
        (v) => v.section_id == null || !sectionIds.has(v.section_id),
    )

    const viewElements: NavbarElement[] = standaloneViews.map((view) => ({
        kind: 'view',
        order: ordering.views[String(view.id)]?.display_order ?? Infinity,
        view,
    }))

    const sectionElements: NavbarElement[] = sections.map((section) => {
        const childViews = views
            .filter((v) => section.id != null && v.section_id === section.id)
            .sort(
                (a, b) =>
                    (ordering.views[String(a.id)]?.display_order ?? Infinity) -
                    (ordering.views[String(b.id)]?.display_order ?? Infinity),
            )
        return {
            kind: 'section',
            order:
                ordering.view_sections[String(section.id)]?.display_order ??
                Infinity,
            firstChild: childViews[0] ?? null,
        }
    })

    const ordered = [...viewElements, ...sectionElements].sort(
        (a, b) => a.order - b.order,
    )

    for (const element of ordered) {
        if (element.kind === 'view') {
            return element.view
        }
        if (element.firstChild) {
            return element.firstChild
        }
    }

    return null
}
