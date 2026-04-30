import { Handle } from '@repo/layout'
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

import useDraftTicketActivityTracking from 'pages/tickets/detail/hooks/useDraftTicketActivityTracking'
import { NewTicketPageContent } from 'tickets/pages/NewTicketPage/components/NewTicketPageContent/NewTicketPageContent'
import { NewTicketPageInfobar } from 'tickets/pages/NewTicketPage/components/NewTicketPageInfobar'
import {
    NewTicketPageInfobarNavigationPanel,
    NewTicketPageInfobarPanel,
    NewTicketPageTicketDetailPanel,
} from 'tickets/pages/NewTicketPage/components/NewTicketPagePanels'
import { useNewTicketPageForm } from 'tickets/pages/NewTicketPage/hooks/useNewTicketForm'
import { useNewTicketPageSync } from 'tickets/pages/NewTicketPage/hooks/useNewTicketPageSync'

export function NewTicketPage() {
    const {
        ticketState,
        handleSubjectChange,
        handlePriorityChange,
        handleUserChange,
        handleTeamChange,
        handleTagsChange,
        handleRecipientsChange,
        submit,
        temporaryId,
    } = useNewTicketPageForm()

    useDraftTicketActivityTracking(temporaryId)
    useNewTicketPageSync()

    return (
        <TicketLayout>
            <TicketHeaderContainer>
                <TicketHeaderLeft>
                    <TicketTitle>
                        <TicketTitleSubject
                            placeholder="New ticket"
                            value={ticketState.subject}
                            onChange={handleSubjectChange}
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
                <NewTicketPageTicketDetailPanel>
                    <NewTicketPageContent
                        submit={submit}
                        subject={ticketState.subject}
                        onRecipientsChange={handleRecipientsChange}
                    />
                </NewTicketPageTicketDetailPanel>
                <Handle />
                <NewTicketPageInfobarPanel>
                    <NewTicketPageInfobar
                        tags={ticketState.tags}
                        onTagsChange={handleTagsChange}
                    />
                </NewTicketPageInfobarPanel>
                <NewTicketPageInfobarNavigationPanel>
                    <NewTicketInfobarNavigation />
                </NewTicketPageInfobarNavigationPanel>
            </TicketLayoutContent>
        </TicketLayout>
    )
}
