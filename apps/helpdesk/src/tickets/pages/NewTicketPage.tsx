import { useMemo, useState } from 'react'

import { Handle, Panel } from '@repo/layout'
import { useTicketInfobarNavigation } from '@repo/navigation'
import {
    PrioritySelect,
    TeamAssigneeSelect,
    TicketHeaderContainer,
    TicketHeaderLeft,
    TicketHeaderRight,
    TicketLayout,
    TicketLayoutContent,
    UserAssigneeSelect,
} from '@repo/tickets'

import type {
    Team,
    TicketPriority,
    TicketTeam,
    TicketUser,
    User,
} from '@gorgias/helpdesk-queries'

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

type NewTicketState = {
    priority: TicketPriority | undefined
    assigneeUser: TicketUser | null
    assigneeTeam: TicketTeam | null
}

export function NewTicketPage() {
    const { isExpanded } = useTicketInfobarNavigation()
    const [ticketState, setTicketState] = useState<NewTicketState>({
        priority: undefined,
        assigneeUser: null,
        assigneeTeam: null,
    })

    const handlePriorityChange = (priority: TicketPriority) => {
        setTicketState((prev) => ({ ...prev, priority }))
    }

    const handleUserChange = (user: User | null) => {
        setTicketState((prev) => ({
            ...prev,
            assigneeUser: user as TicketUser | null,
        }))
    }

    const handleTeamChange = (team: Team | null) => {
        setTicketState((prev) => ({
            ...prev,
            assigneeTeam: team as TicketTeam | null,
        }))
    }

    const name = `infobar-${isExpanded ? 'expanded' : 'collapsed'}`
    const config = useMemo(
        () => (isExpanded ? panelConfig : collapsedPanelConfig),
        [isExpanded],
    )

    return (
        <TicketLayout>
            <TicketHeaderContainer>
                <TicketHeaderLeft>New ticket</TicketHeaderLeft>
                <TicketHeaderRight>
                    <PrioritySelect
                        value={ticketState.priority}
                        onChange={handlePriorityChange}
                    />
                    <UserAssigneeSelect
                        value={ticketState.assigneeUser}
                        onChange={handleUserChange}
                    />
                    <TeamAssigneeSelect
                        value={ticketState.assigneeTeam}
                        onChange={handleTeamChange}
                    />
                </TicketHeaderRight>
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
