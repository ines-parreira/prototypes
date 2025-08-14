import { Handle } from 'core/layout/panels'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { KnowledgeSourceSideBarProvider } from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBarProvider'
import KnowledgeSourceSidebarWrapper from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSidebarWrapper'
import { OnToggleUnreadFn } from 'tickets/dtp'
import { TicketDetailPanel } from 'tickets/ticket-detail'
import { TicketInfobarPanel } from 'tickets/ticket-infobar'

type Props = {
    onToggleUnread?: OnToggleUnreadFn
}

export function TicketDetailWithInfobar({ onToggleUnread }: Props) {
    return (
        <KnowledgeSourceSideBarProvider>
            <TicketDetailContent onToggleUnread={onToggleUnread} />
        </KnowledgeSourceSideBarProvider>
    )
}

function TicketDetailContent({ onToggleUnread }: Props) {
    const { mode } = useKnowledgeSourceSideBar()

    return (
        <>
            <TicketDetailPanel
                key="ticket-detail-panel"
                onToggleUnread={onToggleUnread}
            />
            <Handle />
            <TicketInfobarPanel key="infobar-panel" />

            {mode && (
                <KnowledgeSourceSidebarWrapper key="knowledge-source-sidebar-wrapper" />
            )}
        </>
    )
}
