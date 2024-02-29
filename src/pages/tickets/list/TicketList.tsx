import React, {ComponentProps, useEffect, useMemo, useState} from 'react'
import {useHistory, useLocation, useParams} from 'react-router-dom'
import decorateComponentWithProps from 'decorate-component-with-props'

import {fetchTags} from 'state/tags/actions'
import {getTickets} from 'state/tickets/selectors'
import {
    getActiveView,
    hasActiveView as getHasActiveView,
    getSelectedItemsIds,
} from 'state/views/selectors'
import {compactInteger} from 'utils'
import {isCreationUrl, isSearchUrl} from 'pages/common/utils/url'
import ViewTable from 'pages/common/components/ViewTable/ViewTable'
import MacroContainer from 'pages/tickets/common/macros/MacroContainer'
import SearchRankScenarioProvider from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioProvider'
import CreateTicketButton from 'pages/common/components/CreateTicket/CreateTicketButton'
import {SearchRankSource} from 'hooks/useSearchRankScenario'
import useTitle from 'hooks/useTitle'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import useShortcuts from 'hooks/useShortcuts'
import TicketListActions, {
    SHORTCUT_MANAGER_COMPONENT_NAME,
} from './components/TicketListActions'
import css from './TicketList.less'

const TicketList = () => {
    const dispatch = useAppDispatch()

    const activeView = useAppSelector(getActiveView)
    const hasActiveView = useAppSelector(getHasActiveView)
    const selectedItemsIds = useAppSelector(getSelectedItemsIds)
    const tickets = useAppSelector(getTickets)

    const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)

    const {pathname} = useLocation()
    const history = useHistory()
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

    useShortcuts(SHORTCUT_MANAGER_COMPONENT_NAME, {
        CREATE_TICKET: {
            action: (e: Event) => {
                e.preventDefault()
                history.push('/app/ticket/new')
            },
        },
    })

    useTitle(title)

    const viewTable = (
        <ViewTable
            className={css.table}
            type="ticket"
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
            className="d-flex flex-column"
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
                    disableExternalActions
                    selectedItemsIds={selectedItemsIds}
                    closeModal={() => setIsMacroModalOpen(false)}
                    selectionMode
                />
            )}
        </div>
    )
}

export default TicketList
