import { useEffect, useState } from 'react'

import { useHelpdeskV2MS4Dot5Flag } from '@repo/tickets/feature-flags'
import { ViewPanel } from '@repo/tickets/views'
import { fromJS } from 'immutable'
import { useHistory, useLocation } from 'react-router-dom'

import { useGetView } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { resetView, setViewActive, setViewEditMode } from 'state/views/actions'
import {
    getActiveView,
    areFiltersValid as getAreFiltersValid,
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
}

export function ViewPanelEntrypoint() {
    const hasUIVisionMS4Dot5 = useHelpdeskV2MS4Dot5Flag()
    const dispatch = useAppDispatch()
    const history = useHistory()
    const { setIsEnabled } = useSplitTicketView()
    const location = useLocation<ViewPanelLocationState>()
    const viewId = useViewId()
    const view = useAppSelector((state) => getViewPlainJS(state, `${viewId}`))
    const { data: viewResponse } = useGetView(viewId)
    const activeView = useAppSelector(getActiveView)
    const isViewDirty = useAppSelector(getIsDirty)
    const isEditMode = useAppSelector(getIsEditMode)
    const areFiltersValid = useAppSelector(getAreFiltersValid)
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)
    const [macroTicketIds, setMacroTicketIds] = useState<number[] | null>(null)

    const persistedView = viewResponse?.data ?? view
    const shouldOpenViewFiltersFromRoute =
        location.state?.openViewFilters === true

    useEffect(() => {
        const activeViewId = activeView.get('id') as number | undefined
        const shouldHydrateActiveView =
            hasUIVisionMS4Dot5 && persistedView && activeViewId !== viewId

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
        persistedView,
        shouldOpenViewFiltersFromRoute,
        viewId,
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

    const handleToggleFiltersBridge = () => {
        if (isEditMode) {
            dispatch(resetView())
            setIsFiltersExpanded(false)
            return
        }

        dispatch(
            setViewEditMode(persistedView ? fromJS(persistedView) : undefined),
        )
        setIsFiltersExpanded(true)
    }

    const handleOpenFilters = () => {
        if (!isEditMode) {
            dispatch(setViewEditMode())
        }

        setIsFiltersExpanded(true)
    }

    if (hasUIVisionMS4Dot5) {
        return (
            <>
                <ViewPanel
                    viewId={viewId}
                    onExpand={() => setIsEnabled(true)}
                    onEditView={handleToggleFiltersBridge}
                    onFixFilters={handleOpenFilters}
                    onNavigateToTicket={() => setIsEnabled(true)}
                    onApplyMacro={setMacroTicketIds}
                    topContent={
                        isEditMode ? (
                            <ViewPanelFiltersBridge
                                viewId={viewId}
                                isExpanded={isFiltersExpanded}
                                onExpandedChange={setIsFiltersExpanded}
                            />
                        ) : null
                    }
                    dirtyView={{
                        enabled: isViewDirty && isEditMode,
                        search: (activeView.get('search') as string) || '',
                        filters: (activeView.get('filters') as string) || '',
                        areFiltersValid,
                    }}
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
