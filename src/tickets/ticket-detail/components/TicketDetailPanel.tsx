import React from 'react'

import {Panel} from 'core/layout/panels'
import TicketWrapper from 'split-ticket-view/components/TicketWrapper'

const panelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

export default function TicketDetailPanel() {
    return (
        <Panel name="ticket-detail" config={panelConfig}>
            <TicketWrapper />
        </Panel>
    )
}
