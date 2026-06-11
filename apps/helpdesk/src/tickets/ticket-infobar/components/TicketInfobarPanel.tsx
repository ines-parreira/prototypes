import { Panel } from '@repo/layout'

import { DefaultExportTicketInfobarContainer as TicketInfobarContainer } from 'pages/tickets/detail/TicketInfobarContainer'

const panelConfig = {
    defaultSize: 340,
    minSize: 340,
    maxSize: 0.33,
}

export function TicketInfobarPanel() {
    return (
        <Panel name="infobar" config={panelConfig}>
            <TicketInfobarContainer isOnNewLayout />
        </Panel>
    )
}
