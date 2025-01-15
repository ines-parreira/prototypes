import React from 'react'

import {Panel} from 'core/layout/panels'
import {EmptyTicket} from 'ticket-page'

const panelConfig = {
    defaultSize: Infinity,
    minSize: 100,
    maxSize: Infinity,
}

export default function TicketEmptyPanel() {
    return (
        <Panel name="ticket-empty" config={panelConfig}>
            <EmptyTicket />
        </Panel>
    )
}
