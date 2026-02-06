import { useCallback, useMemo, useState } from 'react'

import { Handle, Panel } from '@repo/layout'
import { useTicketInfobarNavigation } from '@repo/navigation'
import {
    NewTicketInfobarNavigation,
    PrioritySelect,
    TeamAssigneeSelect,
    TicketHeaderContainer,
    TicketHeaderLeft,
    TicketHeaderRight,
    TicketLayout,
    TicketLayoutContent,
    TicketTitle,
    TicketTitleSubject,
    UserAssigneeSelect,
} from '@repo/tickets'

import type {
    Team,
    TicketPriority,
    TicketTag,
    TicketTeam,
    TicketUser,
    User,
} from '@gorgias/helpdesk-queries'

import { NewTicketPageInfobar } from 'tickets/pages/NewTicketPage/components/NewTicketPageInfobar'

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
    subject: string
    priority: TicketPriority | undefined
    assigneeUser: TicketUser | null
    assigneeTeam: TicketTeam | null
    tags: TicketTag[]
}

export function NewTicketPage() {
    const { isExpanded } = useTicketInfobarNavigation()
    const [ticketState, setTicketState] = useState<NewTicketState>({
        subject: '',
        priority: undefined,
        assigneeUser: null,
        assigneeTeam: null,
        tags: [],
    })
    // const fields = useTicketFieldsStore((state) => state.fields)

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

    const handleTagsChange = useCallback((tags: TicketTag[]) => {
        setTicketState((prev) => ({ ...prev, tags }))
    }, [])

    // const handleSubmit = useCallback(() => {
    //     /**
    //      * Merge ticket fields & ticket state
    //      */
    // }, [])

    const name = `infobar-${isExpanded ? 'expanded' : 'collapsed'}`
    const config = useMemo(
        () => (isExpanded ? panelConfig : collapsedPanelConfig),
        [isExpanded],
    )

    return (
        <TicketLayout>
            <TicketHeaderContainer>
                <TicketHeaderLeft>
                    <TicketTitle>
                        <TicketTitleSubject
                            placeholder="New ticket"
                            value={ticketState.subject}
                            onChange={(subject) =>
                                setTicketState({ ...ticketState, subject })
                            }
                        />
                    </TicketTitle>
                </TicketHeaderLeft>
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
                    <NewTicketPageInfobar
                        tags={ticketState.tags}
                        onTagsChange={handleTagsChange}
                    />
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
