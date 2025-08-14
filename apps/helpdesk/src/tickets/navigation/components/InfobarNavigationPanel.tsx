import { TicketInfobarNavigation } from '@repo/tickets'

import { Panel } from 'core/layout/panels'

const panelConfig = {
    defaultSize: 49,
    minSize: 49,
    maxSize: 49,
}

export function InfobarNavigationPanel() {
    return (
        <Panel name="infobar-navigation" config={panelConfig}>
            <TicketInfobarNavigation />
        </Panel>
    )
}
