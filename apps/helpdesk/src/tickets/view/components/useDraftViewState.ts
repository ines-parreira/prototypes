import { useEffect, useMemo, useRef, useState } from 'react'

import type { ViewField } from '@gorgias/helpdesk-types'

import * as viewsConfig from 'config/views'
import type { ViewVisibility as ViewVisibilityType } from 'models/view/types'
import { ViewType, ViewVisibility } from 'models/view/types'
import type { ViewImmutable } from 'state/views/types'

type ViewPanelLocationState = {
    viewName?: string
    filters?: string
}

export function getDraftFields(viewLike: ViewImmutable) {
    return (viewLike.get('fields')?.toJS?.() as ViewField[] | undefined) ?? []
}

export function areDraftFieldsEqual(left: ViewField[], right: ViewField[]) {
    return (
        left.length === right.length &&
        left.every((field, index) => field === right[index])
    )
}

export function createInitialDraftView(
    visibility: ViewVisibilityType,
    viewName?: string,
    filters?: string,
) {
    return (
        viewsConfig.getConfigByType(ViewType.TicketList).get('newView') as (
            visibility?: ViewVisibilityType,
            viewName?: string,
            filters?: string,
        ) => ViewImmutable
    )(visibility, viewName, filters)
        .set('name', '')
        .set('slug', '')
}

function getInitialDraftFields(
    visibility: ViewVisibility.Public | ViewVisibility.Private | null,
    locationState?: ViewPanelLocationState,
) {
    if (!visibility) {
        return []
    }

    return getDraftFields(
        createInitialDraftView(
            visibility,
            locationState?.viewName,
            locationState?.filters,
        ),
    )
}

export function getNewRouteVisibility(
    pathname: string,
): ViewVisibility.Public | ViewVisibility.Private | null {
    const match = pathname.match(/^\/app\/tickets\/new\/(public|private)$/)
    if (!match) {
        return null
    }

    return match[1] === ViewVisibility.Private
        ? ViewVisibility.Private
        : ViewVisibility.Public
}

type UseDraftViewStateParams = {
    activeView: ViewImmutable
    isNewViewRoute: boolean
    newRouteVisibility: ViewVisibility.Public | ViewVisibility.Private | null
    locationState?: ViewPanelLocationState
}

export function useDraftViewState({
    activeView,
    isNewViewRoute,
    newRouteVisibility,
    locationState,
}: UseDraftViewStateParams) {
    const [draftFields, setDraftFields] = useState<ViewField[]>(() =>
        getInitialDraftFields(newRouteVisibility, locationState),
    )
    const initializedDraftKeyRef = useRef<string | null>(null)
    const hasHydratedDraftFieldsRef = useRef(false)

    const routeDefaultDraftFields = useMemo(
        () => getInitialDraftFields(newRouteVisibility, locationState),
        [locationState, newRouteVisibility],
    )
    const effectiveDraftFields = useMemo(
        () =>
            isNewViewRoute && draftFields.length === 0
                ? routeDefaultDraftFields
                : draftFields,
        [draftFields, isNewViewRoute, routeDefaultDraftFields],
    )

    useEffect(() => {
        if (isNewViewRoute) {
            return
        }

        initializedDraftKeyRef.current = null
        hasHydratedDraftFieldsRef.current = false
        setDraftFields([])
    }, [isNewViewRoute])

    useEffect(() => {
        if (!isNewViewRoute) {
            return
        }

        if (hasHydratedDraftFieldsRef.current) {
            return
        }

        const nextDraftFields = getDraftFields(activeView)
        if (areDraftFieldsEqual(draftFields, nextDraftFields)) {
            hasHydratedDraftFieldsRef.current = true
            return
        }

        hasHydratedDraftFieldsRef.current = true
        setDraftFields(nextDraftFields)
    }, [activeView, draftFields, isNewViewRoute])

    const resetDraftFields = () => {
        if (!newRouteVisibility) {
            return
        }

        const initialDraftView = createInitialDraftView(
            newRouteVisibility,
            locationState?.viewName,
            locationState?.filters,
        )

        hasHydratedDraftFieldsRef.current = true
        setDraftFields(getDraftFields(initialDraftView))
    }

    return {
        effectiveDraftFields,
        draftFields,
        setDraftFields,
        resetDraftFields,
        initializedDraftKeyRef,
        hasHydratedDraftFieldsRef,
    }
}
