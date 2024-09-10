import classnames from 'classnames'
import decorateComponentWithProps from 'decorate-component-with-props'
import React, {
    ComponentProps,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {useLocation, useParams} from 'react-router-dom'
import {List} from 'immutable'

import {logEvent, SegmentEvent} from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {SearchRankSource} from 'hooks/useSearchRankScenario'
import useTitle from 'hooks/useTitle'
import {EntityType} from 'models/view/types'
import CreateTicketButton from 'pages/common/components/CreateTicket/CreateTicketButton'
import SearchRankScenarioProvider from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioProvider'
import ViewTable from 'pages/common/components/ViewTable/ViewTable'
import {isCreationUrl, isSearchUrl} from 'pages/common/utils/url'
import MacroContainer from 'pages/tickets/common/macros/MacroContainer'
import {fetchTags} from 'state/tags/actions'
import {getTickets} from 'state/tickets/selectors'
import {updateSelectedItemsIds} from 'state/views/actions'
import {
    areAllActiveViewItemsSelected,
    getActiveView,
    getSelectedItemsIds,
    hasActiveView as getHasActiveView,
} from 'state/views/selectors'
import {compactInteger} from 'utils'

import {TicketListActions} from 'pages/tickets/list/components/TicketListActions'
import css from 'pages/tickets/list/TicketList.less'

const TicketList = () => {
    const dispatch = useAppDispatch()

    const activeView = useAppSelector(getActiveView)
    const hasActiveView = useAppSelector(getHasActiveView)
    const selectedItemsIds = useAppSelector(getSelectedItemsIds)
    const tickets = useAppSelector(getTickets)
    const allViewItemsSelected = useAppSelector(areAllActiveViewItemsSelected)

    const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)

    const {pathname} = useLocation()
    const params = useParams<{viewId?: string}>()
    const isSearch = useMemo(() => isSearchUrl(pathname, 'tickets'), [pathname])
    const isUpdate = useMemo(
        () => !isCreationUrl(pathname, 'tickets'),
        [pathname]
    )
    const isEditMode = useMemo(
        () => activeView.get('editMode') as boolean,
        [activeView]
    )

    const onComplete = useCallback(
        (ids: List<any>) => {
            dispatch(updateSelectedItemsIds(ids))
            logEvent(SegmentEvent.BulkAction, {
                type: 'apply-macro',
                location: 'full-width-mode',
            })
        },
        [dispatch]
    )

    useEffect(() => {
        void dispatch(fetchTags())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const title = useMemo(() => {
        let title = 'Loading...'

        if (!isUpdate) {
            title = 'New view'
        } else if (hasActiveView) {
            title = activeView.get('name')
            if (activeView.get('count', 0) > 0) {
                title = `(${compactInteger(
                    activeView.get('count', 0)
                )}) ${title}`
            }
        } else {
            title = 'Wrong view'
        }

        if (isSearch) {
            title = 'Search'
        }
        return title
    }, [activeView, hasActiveView, isSearch, isUpdate])

    useTitle(title)

    const viewTable = (
        <ViewTable
            className={css.table}
            type={EntityType.Ticket}
            items={tickets}
            isUpdate={isUpdate}
            isSearch={isSearch}
            urlViewId={params.viewId}
            ActionsComponent={decorateComponentWithProps<
                ComponentProps<typeof TicketListActions>,
                {openMacroModal: () => void}
            >(TicketListActions, {
                openMacroModal: () => setIsMacroModalOpen(true),
            })}
            viewButtons={!isEditMode && <CreateTicketButton />}
        />
    )

    return (
        <div
            className={classnames('d-flex flex-column', css.container)}
            style={{
                width: '100%',
            }}
        >
            {isSearch ? (
                <SearchRankScenarioProvider
                    source={SearchRankSource.TicketsView}
                >
                    {viewTable}
                </SearchRankScenarioProvider>
            ) : (
                viewTable
            )}

            {isMacroModalOpen && (
                <MacroContainer
                    activeView={activeView}
                    areExternalActionsDisabled
                    selectedItemsIds={selectedItemsIds}
                    closeModal={() => setIsMacroModalOpen(false)}
                    allViewItemsSelected={allViewItemsSelected}
                    selectionMode
                    onComplete={onComplete}
                />
            )}
        </div>
    )
}

export default TicketList
