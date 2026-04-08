import { useCallback, useEffect, useMemo, useState } from 'react'

import { useHelpdeskV2MS4Dot5Flag } from '@repo/tickets/feature-flags'
import { ViewPanel } from '@repo/tickets/views'
import { fromJS } from 'immutable'
import { useHistory, useLocation } from 'react-router-dom'

import { useGetView } from '@gorgias/helpdesk-queries'
import type { ViewField } from '@gorgias/helpdesk-types'

import * as viewsConfig from 'config/views'
import { BASE_VIEW_ID } from 'constants/view'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { ViewVisibility as ViewVisibilityType } from 'models/view/types'
import { ViewType, ViewVisibility } from 'models/view/types'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import {
    resetView,
    setViewActive,
    setViewEditMode,
    updateView,
} from 'state/views/actions'
import {
    getActiveView,
    areFiltersValid as getAreFiltersValid,
    areFiltersValidAst as getAreFiltersValidAst,
    isDirty as getIsDirty,
    isEditMode as getIsEditMode,
    getViewPlainJS,
} from 'state/views/selectors'
import ApplyMacro from 'ticket-list-view/components/bulk-actions/ApplyMacro'
import { useViewId } from 'tickets/core/hooks'

import LegacyViewPanel from './ViewPanel'
import { ViewPanelFiltersBridge } from './ViewPanelFiltersBridge'

type ViewPanelLocationState = {
    openViewFilters?: boolean
    viewName?: string
    filters?: string
}

type DraftTableState = {
    search: string
    filters: string
}

function getNewRouteVisibility(
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

export function ViewPanelEntrypoint() {
    const hasUIVisionMS4Dot5 = useHelpdeskV2MS4Dot5Flag()
    const dispatch = useAppDispatch()
    const history = useHistory()
    const { setIsEnabled } = useSplitTicketView()
    const location = useLocation<ViewPanelLocationState>()
    const viewId = useViewId()
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))
    const newRouteVisibility = getNewRouteVisibility(location.pathname)
    const isNewViewRoute = newRouteVisibility !== null
    const { data: viewResponse } = useGetView(viewId, {
        query: {
            enabled: !isNewViewRoute,
        },
    })
    const activeView = useAppSelector(getActiveView)
    const isViewDirty = useAppSelector(getIsDirty)
    const isEditMode = useAppSelector(getIsEditMode)
    const areFiltersValid = useAppSelector(getAreFiltersValid)
    const areFiltersValidAst = useAppSelector(getAreFiltersValidAst)
    const effectiveViewId = isNewViewRoute ? BASE_VIEW_ID : viewId
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(isNewViewRoute)
    const [macroTicketIds, setMacroTicketIds] = useState<number[] | null>(null)
    const [draftPreviewState, setDraftPreviewState] =
        useState<DraftTableState | null>(null)

    const persistedView = isNewViewRoute ? null : (viewResponse?.data ?? view)
    const shouldOpenViewFiltersFromRoute =
        location.state?.openViewFilters === true
    const draftEditState = useMemo(
        () => ({
            search: (activeView.get('search') as string) || '',
            filters: (activeView.get('filters') as string) || '',
        }),
        [activeView],
    )
    const fallbackDraftPreviewState = useMemo(
        () =>
            isNewViewRoute
                ? {
                      search: '',
                      filters: '',
                  }
                : null,
        [isNewViewRoute],
    )
    const isDraftPreviewable = areFiltersValid && areFiltersValidAst

    useEffect(() => {
        if (!isEditMode || !isDraftPreviewable) {
            return
        }

        setDraftPreviewState((previousDraftPreviewState) => {
            if (
                previousDraftPreviewState?.search === draftEditState.search &&
                previousDraftPreviewState.filters === draftEditState.filters
            ) {
                return previousDraftPreviewState
            }

            return draftEditState
        })
    }, [draftEditState, isDraftPreviewable, isEditMode])

    useEffect(() => {
        setDraftPreviewState(null)
    }, [location.pathname, viewId])

    useEffect(() => {
        if (!hasUIVisionMS4Dot5 || isNewViewRoute) {
            return
        }

        const activeViewId = activeView.get('id') as number | undefined
        const shouldHydrateActiveView = persistedView && activeViewId !== viewId

        if (shouldHydrateActiveView) {
            const nextActiveView = fromJS(persistedView)

            if (shouldOpenViewFiltersFromRoute) {
                dispatch(setViewEditMode(nextActiveView))
            } else {
                dispatch(setViewActive(nextActiveView))
            }
        }
    }, [
        activeView,
        dispatch,
        hasUIVisionMS4Dot5,
        isNewViewRoute,
        persistedView,
        shouldOpenViewFiltersFromRoute,
        viewId,
    ])

    useEffect(() => {
        if (!hasUIVisionMS4Dot5 || !isNewViewRoute || !newRouteVisibility) {
            return
        }

        const currentActiveViewId = activeView.get('id') as number | undefined
        const currentDraftVisibility = activeView.get(
            'visibility',
        ) as ViewVisibilityType | null
        const shouldInitializeDraft =
            currentActiveViewId !== BASE_VIEW_ID ||
            !isEditMode ||
            currentDraftVisibility !== newRouteVisibility

        if (!shouldInitializeDraft) {
            return
        }

        const initialDraftView = (
            viewsConfig.getConfigByType(ViewType.TicketList).get('newView') as (
                visibility?: ViewVisibilityType,
                viewName?: string,
                filters?: string,
            ) => {
                set: (key: string, value: unknown) => any
            }
        )(newRouteVisibility, location.state?.viewName, location.state?.filters)
            .set('name', '')
            .set('slug', '')

        dispatch(setViewEditMode(initialDraftView))
        setIsFiltersExpanded(true)
    }, [
        activeView,
        dispatch,
        hasUIVisionMS4Dot5,
        isEditMode,
        isNewViewRoute,
        location.state?.filters,
        location.state?.viewName,
        newRouteVisibility,
    ])

    useEffect(() => {
        if (!location.state?.openViewFilters || !isEditMode) {
            return
        }

        setIsFiltersExpanded(true)
        history.replace(location.pathname, {
            ...location.state,
            openViewFilters: false,
        })
    }, [history, isEditMode, location.pathname, location.state])

    const dirtyView = useMemo(() => {
        const isDirtyPreviewEnabled =
            isEditMode && (isNewViewRoute || isViewDirty)
        const previewState = isDraftPreviewable
            ? draftEditState
            : draftPreviewState || fallbackDraftPreviewState

        return {
            enabled: isDirtyPreviewEnabled && previewState !== null,
            search: previewState?.search || '',
            filters: previewState?.filters || '',
            areFiltersValid: previewState !== null,
        }
    }, [
        draftEditState,
        draftPreviewState,
        fallbackDraftPreviewState,
        isDraftPreviewable,
        isEditMode,
        isNewViewRoute,
        isViewDirty,
    ])

    const topContent = useMemo(
        () =>
            isEditMode || isNewViewRoute ? (
                <ViewPanelFiltersBridge
                    viewId={effectiveViewId}
                    isExpanded={isFiltersExpanded}
                    onExpandedChange={setIsFiltersExpanded}
                />
            ) : null,
        [effectiveViewId, isEditMode, isFiltersExpanded, isNewViewRoute],
    )

    const handleToggleFiltersBridge = useCallback(() => {
        if (isEditMode) {
            dispatch(resetView())
            setIsFiltersExpanded(false)
            return
        }

        dispatch(
            setViewEditMode(persistedView ? fromJS(persistedView) : undefined),
        )
        setIsFiltersExpanded(true)
    }, [dispatch, isEditMode, persistedView])

    const handleOpenFilters = useCallback(() => {
        if (!isEditMode) {
            dispatch(setViewEditMode())
        }

        setIsFiltersExpanded(true)
    }, [dispatch, isEditMode])

    const draftFields = useMemo(
        () =>
            (activeView.get('fields')?.toJS?.() as ViewField[] | undefined) ??
            [],
        [activeView],
    )

    const handleDraftFieldsChange = useCallback(
        (nextFields: ViewField[]) => {
            if (!isNewViewRoute && !isEditMode) {
                return
            }

            dispatch(updateView(activeView.set('fields', fromJS(nextFields))))
        },
        [activeView, dispatch, isEditMode, isNewViewRoute],
    )

    const handleExpand = useCallback(() => {
        setIsEnabled(true)
    }, [setIsEnabled])

    const handleNavigateToTicket = useCallback(() => {
        setIsEnabled(true)
    }, [setIsEnabled])

    if (hasUIVisionMS4Dot5) {
        return (
            <>
                <ViewPanel
                    viewId={effectiveViewId}
                    onExpand={handleExpand}
                    onEditView={handleToggleFiltersBridge}
                    onFixFilters={handleOpenFilters}
                    onNavigateToTicket={handleNavigateToTicket}
                    onApplyMacro={setMacroTicketIds}
                    titleOverride={isNewViewRoute ? 'New view' : undefined}
                    hideCreateTicket={isNewViewRoute}
                    isDraftView={isNewViewRoute}
                    draftFields={draftFields}
                    onDraftFieldsChange={handleDraftFieldsChange}
                    topContent={topContent}
                    dirtyView={dirtyView}
                />
                {macroTicketIds !== null && (
                    <ApplyMacro
                        ticketIds={macroTicketIds}
                        setIsOpen={(isOpen) => {
                            if (!isOpen) setMacroTicketIds(null)
                        }}
                        onApplyMacro={() => setMacroTicketIds(null)}
                    />
                )}
            </>
        )
    }

    return <LegacyViewPanel />
}
