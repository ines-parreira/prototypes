import { TicketInfobarNavigation } from '@repo/tickets'

import { Panel } from 'core/layout/panels'
import useHasAIAgent from 'pages/tickets/detail/components/TicketFeedback/hooks/useHasAIAgent'

const panelConfig = {
    defaultSize: 49,
    minSize: 49,
    maxSize: 49,
}

export function InfobarNavigationPanel() {
    const hasAIAgent = useHasAIAgent()

    return (
        <Panel name="infobar-navigation" config={panelConfig}>
            <TicketInfobarNavigation hasAIFeedback={hasAIAgent} />
        </Panel>
    )
}
