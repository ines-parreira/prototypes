import React, {ComponentProps, useEffect, useMemo, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import DocumentTitle from 'react-document-title'
import {Link, useLocation, useParams} from 'react-router-dom'
import decorateComponentWithProps from 'decorate-component-with-props'

import Button from 'pages/common/components/button/Button'
import {RootState} from '../../../state/types'
import {fetchTags} from '../../../state/tags/actions'
import {getTickets} from '../../../state/tickets/selectors'
import {
    getActiveView,
    hasActiveView,
    getSelectedItemsIds,
} from '../../../state/views/selectors'
import {compactInteger} from '../../../utils'
import {isCreationUrl, isSearchUrl} from '../../common/utils/url'
import ViewTable from '../../common/components/ViewTable/ViewTable'
import MacroContainer from '../common/macros/MacroContainer'

import TicketListActions from './components/TicketListActions'
import css from './TicketListContainer.less'

export const TicketListContainer = ({
    activeView,
    fetchTags,
    hasActiveView,
    selectedItemsIds,
    tickets,
}: ConnectedProps<typeof connector>) => {
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

    useEffect(() => {
        void fetchTags()
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

    return (
        <DocumentTitle title={title}>
            <div
                className="d-flex flex-column"
                style={{
                    width: '100%',
                }}
            >
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
                    viewButtons={
                        !isEditMode && (
                            <div className="d-inline-flex align-items-center">
                                <Link to="/app/ticket/new">
                                    <Button type="button">Create ticket</Button>
                                </Link>
                            </div>
                        )
                    }
                />
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
        </DocumentTitle>
    )
}

const connector = connect(
    (state: RootState) => ({
        activeView: getActiveView(state),
        hasActiveView: hasActiveView(state),
        selectedItemsIds: getSelectedItemsIds(state),
        tickets: getTickets(state),
    }),
    {
        fetchTags,
    }
)

export default connector(TicketListContainer)
