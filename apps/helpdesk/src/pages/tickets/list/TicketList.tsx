import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTitle } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import {
    useCurrentUserLanguagePreferences,
    useTicketsTranslatedProperties,
} from '@repo/tickets'
import classnames from 'classnames'
import type { List } from 'immutable'
import { fromJS } from 'immutable'
import { useLocation, useParams } from 'react-router-dom'

import type { Ticket } from '@gorgias/helpdesk-queries'
import { useAgentActivity as useAblyAgentActivity } from '@gorgias/realtime'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { SearchRankSource } from 'hooks/useSearchRankScenario'
import { EntityType } from 'models/view/types'
import CreateTicketButton from 'pages/common/components/CreateTicket/CreateTicketButton'
import SearchRankScenarioProvider from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioProvider'
import ViewTable from 'pages/common/components/ViewTable/ViewTable'
import { isCreationUrl, isSearchUrl } from 'pages/common/utils/url'
import MacroContainer from 'pages/tickets/common/macros/MacroContainer'
import { TicketListActions } from 'pages/tickets/list/components/TicketListActions'
import css from 'pages/tickets/list/TicketList.less'
import { fetchTags } from 'state/tags/actions'
import { getTickets } from 'state/tickets/selectors'
import { updateSelectedItemsIds } from 'state/views/actions'
import {
    areAllActiveViewItemsSelected,
    getActiveView,
    hasActiveView as getHasActiveView,
    getSelectedItemsIds,
} from 'state/views/selectors'
import { compactInteger } from 'utils'

const TicketList = () => {
    const dispatch = useAppDispatch()

    const activeView = useAppSelector(getActiveView)
    const hasActiveView = useAppSelector(getHasActiveView)
    const selectedItemsIds = useAppSelector(getSelectedItemsIds)
    const tickets = useAppSelector(getTickets)
    const allViewItemsSelected = useAppSelector(areAllActiveViewItemsSelected)
    const ticketIds = useMemo(
        () =>
            tickets
                .map((ticket) => ticket.get('id') as number)
                .toJS() as number[],
        [tickets],
    )
    const { shouldShowTranslatedContent } = useCurrentUserLanguagePreferences()
    const { translationMap } = useTicketsTranslatedProperties({
        ticket_ids: ticketIds,
    })

    const { viewTickets } = useAblyAgentActivity()
    useEffect(() => {
        viewTickets(ticketIds)
    }, [ticketIds, viewTickets])

    const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)

    const { pathname } = useLocation()
    const params = useParams<{ viewId?: string }>()
    const isSearch = useMemo(() => isSearchUrl(pathname, 'tickets'), [pathname])
    const isUpdate = useMemo(
        () => !isCreationUrl(pathname, 'tickets'),
        [pathname],
    )
    const isEditMode = useMemo(
        () => activeView.get('editMode') as boolean,
        [activeView],
    )

    const onComplete = useCallback(
        (ids: List<any>) => {
            dispatch(updateSelectedItemsIds(ids))
            logEvent(SegmentEvent.BulkAction, {
                type: 'apply-macro',
                location: 'full-width-mode',
            })
        },
        [dispatch],
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
                    activeView.get('count', 0),
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

    const translatedTickets = useMemo(() => {
        const translatedTickets = tickets.toJS().map((ticket: Ticket) => {
            if (
                !ticket.language ||
                !shouldShowTranslatedContent(ticket.language)
            ) {
                return ticket
            }
            const translation = translationMap[ticket.id]
            return {
                ...ticket,
                ...(translation
                    ? {
                          excerpt: translation.excerpt,
                          subject: translation.subject,
                      }
                    : {}),
            }
        })

        return fromJS(translatedTickets)
    }, [tickets, translationMap, shouldShowTranslatedContent])

    const ActionComponent = useCallback(
        () => (
            <TicketListActions
                openMacroModal={() => setIsMacroModalOpen(true)}
                selectedItemsIds={selectedItemsIds}
            />
        ),
        [selectedItemsIds],
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
                    <ViewTable
                        className={css.table}
                        type={EntityType.Ticket}
                        items={translatedTickets}
                        isUpdate={isUpdate}
                        isSearch={isSearch}
                        urlViewId={params.viewId}
                        ActionsComponent={ActionComponent}
                        viewButtons={!isEditMode && <CreateTicketButton />}
                    />
                </SearchRankScenarioProvider>
            ) : (
                <ViewTable
                    className={css.table}
                    type={EntityType.Ticket}
                    items={translatedTickets}
                    isUpdate={isUpdate}
                    isSearch={isSearch}
                    urlViewId={params.viewId}
                    ActionsComponent={ActionComponent}
                    viewButtons={!isEditMode && <CreateTicketButton />}
                />
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
