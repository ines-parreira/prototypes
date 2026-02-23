import { Panel } from '@repo/layout'
import { useHelpdeskV2MS4Flag } from '@repo/tickets/feature-flags'
import { useParams } from 'react-router-dom'

import { TicketListView } from 'ticket-list-view'
import { useViewId } from 'tickets/core/hooks'
import type { OnToggleUnreadFn } from 'tickets/dtp'

const panelConfig = {
    defaultSize: 300,
    minSize: 300,
    maxSize: 450,
}

type Props = {
    registerOnToggleUnread?: (toggleUnreadFn: OnToggleUnreadFn) => void
}

export default function TicketsListPanel({ registerOnToggleUnread }: Props) {
    const hasUIVisionMS4 = useHelpdeskV2MS4Flag()
    const { ticketId: urlTicketId } = useParams<{ ticketId?: string }>()
    const viewId = useViewId()

    const ticketId = urlTicketId ? parseInt(urlTicketId, 10) : undefined

    if (hasUIVisionMS4) {
        return (
            <Panel name="ticket-list-ms4" config={panelConfig}>
                PLACEHOLDER
            </Panel>
        )
    }

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
