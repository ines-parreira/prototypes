import { useMemo } from 'react'

import {
    useAllViews,
    useAllViewSections,
    usePrivateViews,
    usePrivateViewsOrdering,
    usePublicViews,
    usePublicViewsOrdering,
} from '@repo/views'

import { useGetView } from '@gorgias/helpdesk-queries'
import type { View } from '@gorgias/helpdesk-types'

import { useDefaultViews } from '../../../sidebar/hooks/useDefaultViews'
import { getViewDisplayName } from '../../../utils/views'

type NamedViewSection = {
    id: number
    name: string
    private?: boolean
}

export type ViewSearchResult = {
    view: View
    breadcrumb?: string
    searchText: string
}

export type ViewSectionGroup = {
    section: NamedViewSection
    views: View[]
}

type UseViewSearchMenuDataArgs = {
    viewId: number
    searchValue: string
}

export function useViewSearchMenuData({
    viewId,
    searchValue,
}: UseViewSearchMenuDataArgs) {
    const { data: activeViewResponse } = useGetView(viewId)
    const allViews = useAllViews()
    const publicViews = usePublicViews()
    const privateViews = usePrivateViews()
    const viewSections = useAllViewSections()
    const publicOrdering = usePublicViewsOrdering()
    const privateOrdering = usePrivateViewsOrdering()
    const { visibleSystemViews, defaultSystemViews } = useDefaultViews()
    const systemViews = useMemo(
        () => visibleSystemViews ?? defaultSystemViews ?? [],
        [defaultSystemViews, visibleSystemViews],
    )

    const activeView =
        (activeViewResponse?.data as View | undefined) ??
        allViews.find((candidateView) => candidateView.id === viewId) ??
        null

    const menuData = useMemo(() => {
        const sectionById = new Map(
            viewSections
                .filter(isNamedViewSection)
                .map((section) => [section.id, section]),
        )

        const privateSections = viewSections
            .filter(isNamedViewSection)
            .filter((section) => section.private)
        const sharedSections = viewSections
            .filter(isNamedViewSection)
            .filter((section) => !section.private)

        const privateRootViews: View[] = []
        const sharedRootViews: View[] = []
        const privateViewsBySectionId = new Map<number, View[]>()
        const sharedViewsBySectionId = new Map<number, View[]>()

        for (const view of privateViews) {
            if (view.section_id == null) {
                privateRootViews.push(view)
                continue
            }

            pushToSectionBucket(privateViewsBySectionId, view.section_id, view)
        }

        for (const view of publicViews) {
            if (view.section_id == null) {
                sharedRootViews.push(view)
                continue
            }

            pushToSectionBucket(sharedViewsBySectionId, view.section_id, view)
        }

        const privateSectionViews = groupSectionBuckets(
            privateSections,
            privateOrdering.view_sections,
            privateViewsBySectionId,
        )
        const sharedSectionViews = groupSectionBuckets(
            sharedSections,
            publicOrdering.view_sections,
            sharedViewsBySectionId,
        )

        const searchResults = [
            ...systemViews.map((view) => createSearchResult(view, sectionById)),
            ...publicViews.map((view) => createSearchResult(view, sectionById)),
            ...privateViews.map((view) =>
                createSearchResult(view, sectionById),
            ),
        ].filter((result) =>
            result.searchText.includes(searchValue.toLowerCase()),
        )

        return {
            defaultViews: systemViews,
            sharedRootViews,
            privateRootViews,
            sharedSectionViews,
            privateSectionViews,
            searchResults,
        }
    }, [
        privateOrdering.view_sections,
        privateViews,
        publicOrdering.view_sections,
        publicViews,
        searchValue,
        systemViews,
        viewSections,
    ])

    return {
        activeView,
        viewName: activeView ? getViewDisplayName(activeView) : undefined,
        ...menuData,
    }
}
function groupSectionBuckets(
    sections: NamedViewSection[],
    sectionOrdering: Record<string, { display_order: number }>,
    viewsBySectionId: Map<number, View[]>,
): ViewSectionGroup[] {
    return [...sections]
        .sort(
            (sectionA, sectionB) =>
                (sectionOrdering[String(sectionA.id)]?.display_order ??
                    Infinity) -
                (sectionOrdering[String(sectionB.id)]?.display_order ??
                    Infinity),
        )
        .map((section) => ({
            section,
            views: viewsBySectionId.get(section.id) ?? [],
        }))
        .filter(({ views }) => views.length > 0)
}

function pushToSectionBucket(
    viewsBySectionId: Map<number, View[]>,
    sectionId: number,
    view: View,
) {
    const existingViews = viewsBySectionId.get(sectionId)

    if (existingViews) {
        existingViews.push(view)
        return
    }

    viewsBySectionId.set(sectionId, [view])
}

function createSearchResult(
    view: View,
    sectionById: Map<number, NamedViewSection>,
): ViewSearchResult {
    const label = getViewDisplayName(view)
    const breadcrumb = getSearchBreadcrumb(view, sectionById)

    return {
        view,
        breadcrumb,
        searchText: [label, breadcrumb].filter(Boolean).join(' ').toLowerCase(),
    }
}

function getSearchBreadcrumb(
    view: View,
    sectionById: Map<number, NamedViewSection>,
) {
    if (view.category === 'system') {
        return undefined
    }

    const visibility = view.visibility === 'private' ? 'Private' : 'Shared'

    if (view.section_id == null) {
        return visibility
    }

    const section = sectionById.get(view.section_id)

    return section ? `${visibility} > ${section.name}` : visibility
}

function isNamedViewSection(section: {
    id?: number
    name?: string
    private?: boolean
}): section is NamedViewSection {
    return section.id !== undefined && section.name !== undefined
}
