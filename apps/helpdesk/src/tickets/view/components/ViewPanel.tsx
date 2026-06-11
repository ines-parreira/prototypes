import { Panel } from '@repo/layout'

import { TicketList } from 'pages/tickets/list/TicketList'

const panelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

export function ViewPanel() {
    return (
        <Panel name="view" config={panelConfig}>
            <TicketList />
        </Panel>
    )
}
