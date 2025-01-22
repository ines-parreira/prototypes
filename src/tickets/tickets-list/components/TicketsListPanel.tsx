import React from 'react'
import {useParams} from 'react-router-dom'

import {Panel} from 'core/layout/panels'
import {TicketListView} from 'ticket-list-view'
import {useViewId} from 'tickets/core/hooks'
import type {OnToggleUnreadFn} from 'tickets/dtp'

const panelConfig = {
    defaultSize: 300,
    minSize: 300,
    maxSize: 450,
}

type Props = {
    registerOnToggleUnread?: (toggleUnreadFn: OnToggleUnreadFn) => void
}

export default function TicketsListPanel({registerOnToggleUnread}: Props) {
    const {ticketId: urlTicketId} = useParams<{ticketId?: string}>()
    const viewId = useViewId()

    const ticketId = urlTicketId ? parseInt(urlTicketId, 10) : undefined

    return (
        <Panel name="ticket-list" config={panelConfig}>
            <TicketListView
                activeTicketId={ticketId}
                registerToggleUnread={registerOnToggleUnread}
                viewId={viewId}
            />
        </Panel>
    )
}
