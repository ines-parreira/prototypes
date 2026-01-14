import { useMemo } from 'react'

import { useTicketInfobarNavigation } from '@repo/navigation'
import {
    TicketHeaderContainer,
    TicketHeaderLeft,
    TicketHeaderRight,
    TicketLayout,
    TicketLayoutContent,
} from '@repo/tickets'

import { Handle, Panel } from 'core/layout/panels'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import { InfobarNavigationPanel } from 'tickets/navigation'

const panelConfig = {
    defaultSize: 340,
    minSize: 340,
    maxSize: 0.33,
}

const collapsedPanelConfig = {
    defaultSize: 0,
    minSize: 0,
    maxSize: 0,
}

const ticketDetailPanelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

export function NewTicketPage() {
    const { isExpanded } = useTicketInfobarNavigation()

    const name = `infobar-${isExpanded ? 'expanded' : 'collapsed'}`
    const config = useMemo(
        () => (isExpanded ? panelConfig : collapsedPanelConfig),
        [isExpanded],
    )

    return (
        <TicketLayout>
            <TicketHeaderContainer>
                <TicketHeaderLeft>New ticket</TicketHeaderLeft>
                <TicketHeaderRight>Some actions here...</TicketHeaderRight>
            </TicketHeaderContainer>
            <TicketLayoutContent>
                <Panel name="ticket-detail" config={ticketDetailPanelConfig}>
                    <div>Main content here</div>
                </Panel>
                <Handle />
                <Panel key={name} name={name} config={config}>
                    <TicketInfobarContainer isOnNewLayout />
                </Panel>
                <InfobarNavigationPanel key="infobar-navigation" />
            </TicketLayoutContent>
        </TicketLayout>
    )
}
