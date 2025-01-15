import React from 'react'

import {Panel} from 'core/layout/panels'
import TicketList from 'pages/tickets/list/TicketList'

const panelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

export default function ViewPanel() {
    return (
        <Panel name="view" config={panelConfig}>
            <TicketList />
        </Panel>
    )
}
