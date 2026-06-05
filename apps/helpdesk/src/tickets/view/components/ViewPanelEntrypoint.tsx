import { useCallback, useEffect, useMemo, useState } from 'react'

import { SearchRankSource, useSearchRankScenario } from '@repo/logging'
import { useHelpdeskV2MS4Dot5Flag } from '@repo/tickets/feature-flags'
import { ViewPanel } from '@repo/tickets/views'
import { fromJS } from 'immutable'
import type { Map } from 'immutable'
import {
    compressToEncodedURIComponent,
    decompressFromEncodedURIComponent,
} from 'lz-string'
import { useHistory, useLocation } from 'react-router-dom'

import { useGetView } from '@gorgias/helpdesk-queries'

import { getConfigByName } from 'config/views'
import { BASE_VIEW_ID } from 'constants/view'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { SearchEngine } from 'models/search/types'
import type { ViewVisibility as ViewVisibilityType } from 'models/view/types'
import { EntityType } from 'models/view/types'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { resetView, setViewActive, setViewEditMode } from 'state/views/actions'
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

import {
    areDraftFieldsEqual,
    createInitialDraftView,
    getDraftFields,
    getNewRouteVisibility,
    useDraftViewState,
} from './useDraftViewState'
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

export function ViewPanelEntrypoint() {
    const hasUIVisionMS4Dot5 = useHelpdeskV2MS4Dot5Flag()
    const dispatch = useAppDispatch()
    const history = useHistory()
    const { setIsEnabled } = useSplitTicketView()
    const location = useLocation<ViewPanelLocationState>()
    const viewId = useViewId()
    const isSearchMode = location.pathname === '/app/tickets/search'
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
    const searchRank = useSearchRankScenario(SearchRankSource.TicketsView)
    const effectiveViewId = isNewViewRoute ? BASE_VIEW_ID : viewId
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(
        isNewViewRoute || isSearchMode,
    )
    const [macroTicketIds, setMacroTicketIds] = useState<number[] | null>(null)
    const [searchResultCount, setSearchResultCount] = useState<number>()
    const [draftPreviewState, setDraftPreviewState] =
        useState<DraftTableState | null>(null)
    const {
        effectiveDraftFields,
        draftFields,
        setDraftFields,
        resetDraftFields,
        initializedDraftKeyRef,
        hasHydratedDraftFieldsRef,
    } = useDraftViewState({
        activeView,
        isNewViewRoute,
        newRouteVisibility,
        locationState: location.state,
    })

    const persistedView = isNewViewRoute ? null : (viewResponse?.data ?? view)
    const shouldOpenViewFiltersFromRoute =
        location.state?.openViewFilters === true
    const searchParams = new URLSearchParams(location.search)
    const searchQuery = searchParams.get('q') ?? ''
    const searchFilters =
        decompressFromEncodedURIComponent(searchParams.get('filters') ?? '') ||
        ''
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
        if (!isSearchMode) {
            setSearchResultCount(undefined)
        }
    }, [isSearchMode])

    useEffect(() => {
        if (!isSearchMode) {
            return
        }

        setIsEnabled(false)
        setIsFiltersExpanded(true)
    }, [isSearchMode, setIsEnabled])

    useEffect(() => {
        if (!hasUIVisionMS4Dot5 || isNewViewRoute) {
            return
        }

        if (isSearchMode) {
            const currentSearch = activeView.get('search') as
                | string
                | null
                | undefined
            const currentFilters = activeView.get('filters') as
                | string
                | null
                | undefined
            const isSearchActiveView = currentSearch != null

            if (
                currentSearch === searchQuery &&
                currentFilters === searchFilters &&
                isSearchActiveView
            ) {
                return
            }

            if (isEditMode && isSearchActiveView) {
                return
            }

            const config = getConfigByName(EntityType.Ticket)
            const searchView = config.get('searchView') as
                | ((term: string, filters?: string) => Map<string, unknown>)
                | undefined

            if (typeof searchView === 'function') {
                dispatch(setViewActive(searchView(searchQuery, searchFilters)))
            }
            return
        }

        const activeViewId = activeView.get('id') as number | undefined
        const shouldHydrateActiveView = persistedView && activeViewId !== viewId

        if (!shouldHydrateActiveView) {
            return
        }

        const nextActiveView = fromJS(persistedView)

        if (shouldOpenViewFiltersFromRoute) {
            dispatch(setViewEditMode(nextActiveView))
            return
        }

        dispatch(setViewActive(nextActiveView))
    }, [
        activeView,
        dispatch,
        hasUIVisionMS4Dot5,
        isEditMode,
        isNewViewRoute,
        isSearchMode,
        persistedView,
        searchFilters,
        searchQuery,
        shouldOpenViewFiltersFromRoute,
        viewId,
    ])

    useEffect(() => {
        if (!hasUIVisionMS4Dot5 || !isNewViewRoute || !newRouteVisibility) {
            return
        }

        const nextDraftKey = `${location.pathname}:${location.state?.viewName ?? ''}:${location.state?.filters ?? ''}`

        const currentActiveViewId = activeView.get('id') as number | undefined
        const currentDraftVisibility = activeView.get(
            'visibility',
        ) as ViewVisibilityType | null
        const shouldInitializeDraft =
            currentActiveViewId !== BASE_VIEW_ID ||
            !isEditMode ||
            (currentDraftVisibility !== null &&
                currentDraftVisibility !== newRouteVisibility)

        // A fresh navigation carrying different route state (e.g. clicking a
        // second stat view-link) must re-seed the draft even when one is
        // already open in edit mode — otherwise the previous link's filters
        // stick. `shouldInitializeDraft` only covers the no-draft-yet case.
        const hasFreshRouteState =
            initializedDraftKeyRef.current !== nextDraftKey

        if (!shouldInitializeDraft && !hasFreshRouteState) {
            return
        }

        if (initializedDraftKeyRef.current === nextDraftKey) {
            return
        }

        const initialDraftView = createInitialDraftView(
            newRouteVisibility,
            location.state?.viewName,
            location.state?.filters,
        )

        const nextDraftFields = getDraftFields(initialDraftView)
        initializedDraftKeyRef.current = nextDraftKey
        hasHydratedDraftFieldsRef.current = true
        if (!areDraftFieldsEqual(draftFields, nextDraftFields)) {
            setDraftFields(nextDraftFields)
        }
        dispatch(setViewEditMode(initialDraftView))
        setIsFiltersExpanded(true)
    }, [
        activeView,
        dispatch,
        draftFields,
        hasUIVisionMS4Dot5,
        hasHydratedDraftFieldsRef,
        initializedDraftKeyRef,
        isEditMode,
        isNewViewRoute,
        location.pathname,
        location.state?.filters,
        location.state?.viewName,
        newRouteVisibility,
        setDraftFields,
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

    useEffect(() => {
        if (!isSearchMode || !isEditMode || !areFiltersValid) {
            return
        }

        const activeSearch = (activeView.get('search') as string | null) ?? ''
        const activeFilters =
            (activeView.get('filters') as string | null | undefined) ?? ''
        const isSearchActiveView = activeView.get('search') != null

        if (!isSearchActiveView || activeFilters === searchFilters) {
            return
        }

        const nextSearchParams = new URLSearchParams(location.search)

        if (activeSearch) {
            nextSearchParams.set('q', activeSearch)
        } else {
            nextSearchParams.delete('q')
        }

        if (activeFilters) {
            nextSearchParams.set(
                'filters',
                compressToEncodedURIComponent(activeFilters),
            )
        } else {
            nextSearchParams.delete('filters')
        }

        history.push({
            ...location,
            search: nextSearchParams.toString()
                ? `?${nextSearchParams.toString()}`
                : '',
        })
    }, [
        activeView,
        areFiltersValid,
        history,
        isEditMode,
        isSearchMode,
        location,
        searchFilters,
    ])

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

    const activeSearchView = useMemo(() => {
        if (!isSearchMode) {
            return null
        }

        const config = getConfigByName(EntityType.Ticket)
        const searchView = config.get('searchView') as
            | ((term: string, filters?: string) => Map<string, unknown>)
            | undefined

        return typeof searchView === 'function'
            ? searchView(searchQuery, searchFilters)
            : null
    }, [isSearchMode, searchFilters, searchQuery])

    const settingsContent = useMemo(
        () => (
            <ViewPanelFiltersBridge
                viewId={effectiveViewId}
                draftFields={isNewViewRoute ? effectiveDraftFields : undefined}
                onExpandedChange={setIsFiltersExpanded}
                isExpanded={isFiltersExpanded}
                hideViewNameInput={isSearchMode}
                hideFooterActions={isSearchMode}
                isSearchMode={isSearchMode}
                searchResultCount={isSearchMode ? searchResultCount : undefined}
            />
        ),
        [
            effectiveDraftFields,
            effectiveViewId,
            isFiltersExpanded,
            isNewViewRoute,
            isSearchMode,
            searchResultCount,
        ],
    )

    const handleToggleFiltersBridge = useCallback(() => {
        if (isFiltersExpanded) {
            if (isNewViewRoute && newRouteVisibility) {
                resetDraftFields()
            }

            dispatch(resetView())
            setIsFiltersExpanded(false)
            return
        }

        if (!isEditMode) {
            dispatch(
                setViewEditMode(
                    activeSearchView ??
                        (persistedView ? fromJS(persistedView) : undefined),
                ),
            )
        }
        setIsFiltersExpanded(true)
    }, [
        activeSearchView,
        dispatch,
        isEditMode,
        isFiltersExpanded,
        isNewViewRoute,
        newRouteVisibility,
        persistedView,
        resetDraftFields,
    ])

    const handleOpenFilters = useCallback(() => {
        if (!isEditMode) {
            dispatch(setViewEditMode())
        }

        setIsFiltersExpanded(true)
    }, [dispatch, isEditMode])

    const handleExpand = useCallback(() => {
        setIsEnabled(true)
    }, [setIsEnabled])

    const handleNavigateToTicket = useCallback(() => {
        setIsEnabled(false)
    }, [setIsEnabled])

    const searchTracking = useMemo(
        () =>
            isSearchMode
                ? {
                      onRequest: searchRank.registerResultsRequest,
                      onResponse: ({
                          responseTime,
                          numberOfResults,
                          searchEngine,
                      }: {
                          responseTime: number
                          numberOfResults: number
                          searchEngine?: string
                      }) =>
                          searchRank.registerResultsResponse({
                              responseTime,
                              numberOfResults,
                              searchEngine: searchEngine as
                                  | SearchEngine
                                  | undefined,
                          }),
                      onSelection: searchRank.registerResultSelection,
                  }
                : undefined,
        [isSearchMode, searchRank],
    )

    if (hasUIVisionMS4Dot5) {
        return (
            <>
                <ViewPanel
                    viewId={effectiveViewId}
                    isSearchMode={isSearchMode}
                    onExpand={handleExpand}
                    onEditView={handleToggleFiltersBridge}
                    onFixFilters={handleOpenFilters}
                    onNavigateToTicket={handleNavigateToTicket}
                    onApplyMacro={setMacroTicketIds}
                    onSearchResultCountChange={setSearchResultCount}
                    searchTracking={searchTracking}
                    titleOverride={
                        isSearchMode
                            ? 'Advanced search'
                            : isNewViewRoute
                              ? 'New view'
                              : undefined
                    }
                    hideCreateTicket={isNewViewRoute || isSearchMode}
                    isDraftView={isNewViewRoute}
                    draftFields={effectiveDraftFields}
                    onDraftFieldsChange={setDraftFields}
                    settingsContent={settingsContent}
                    isSettingsExpanded={isFiltersExpanded}
                    onSettingsExpandedChange={setIsFiltersExpanded}
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
