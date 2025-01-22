import React from 'react'

import {Panel} from 'core/layout/panels'
import TicketWrapper from 'split-ticket-view/components/TicketWrapper'
import {OnToggleUnreadFn} from 'tickets/dtp'

const panelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

type Props = {
    onToggleUnread?: OnToggleUnreadFn
}

export default function TicketDetailPanel({onToggleUnread}: Props) {
    return (
        <Panel name="ticket-detail" config={panelConfig}>
            <TicketWrapper onToggleUnread={onToggleUnread} />
        </Panel>
    )
}
