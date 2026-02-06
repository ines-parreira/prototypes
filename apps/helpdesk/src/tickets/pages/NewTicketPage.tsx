import { useMemo, useState } from 'react'

import { ShopifyCustomer } from '@repo/customer'
import { Handle, Panel } from '@repo/layout'
import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import {
    NewTicketInfobarNavigation,
    PrioritySelect,
    TeamAssigneeSelect,
    TicketHeaderContainer,
    TicketHeaderLeft,
    TicketHeaderRight,
    TicketLayout,
    TicketLayoutContent,
    UserAssigneeSelect,
} from '@repo/tickets'

import { Box } from '@gorgias/axiom'
import type {
    Team,
    TicketPriority,
    TicketTeam,
    TicketUser,
    User,
} from '@gorgias/helpdesk-queries'

import {
    InfobarLayoutContainer,
    InfobarLayoutContent,
} from 'pages/tickets/detail/layout/InfobarLayout'

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

const infobarNavigationPanelConfig = {
    defaultSize: 49,
    minSize: 49,
    maxSize: 49,
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

    const { activeTab } = useTicketInfobarNavigation()

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
                    <InfobarLayoutContainer>
                        <InfobarLayoutContent>
                            {activeTab === TicketInfobarTab.Shopify && (
                                <Box flex={1} flexDirection="column">
                                    <ShopifyCustomer />
                                </Box>
                            )}
                            {activeTab === TicketInfobarTab.Customer && (
                                <Box
                                    flex={1}
                                    flexDirection="column"
                                    minWidth="340px"
                                >
                                    Content to extract from the Infobar ticket
                                    area (Tags, Ticket fields)
                                </Box>
                            )}
                        </InfobarLayoutContent>
                    </InfobarLayoutContainer>
                </Panel>
                <Panel
                    name="infobar-navigation"
                    config={infobarNavigationPanelConfig}
                >
                    <NewTicketInfobarNavigation />
                </Panel>
            </TicketLayoutContent>
        </TicketLayout>
    )
}
