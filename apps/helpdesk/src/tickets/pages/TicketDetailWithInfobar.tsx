import { FeatureFlagKey } from '@repo/feature-flags'
import { useTicketInfobarNavigation } from '@repo/navigation'
import { TicketHeader } from '@repo/tickets'

import { useFlag } from 'core/flags'
import { Handle } from 'core/layout/panels'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { KnowledgeSourceSideBarProvider } from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBarProvider'
import KnowledgeSourceSidebarWrapper from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSidebarWrapper'
import { OnToggleUnreadFn } from 'tickets/dtp'
import { InfobarNavigationPanel } from 'tickets/navigation'
import { TicketDetailPanel } from 'tickets/ticket-detail'
import { TicketInfobarPanel } from 'tickets/ticket-infobar'

import css from './TicketDetailWithInfobar.less'

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
    const hasUIVisionMS1 = useFlag(FeatureFlagKey.UIVisionMilestone1)
    const { isExpanded } = useTicketInfobarNavigation()
    const { mode } = useKnowledgeSourceSideBar()

    return (
        <div className={css.container}>
            {hasUIVisionMS1 && <TicketHeader />}
            <div className={css.content}>
                <TicketDetailPanel
                    key="ticket-detail-panel"
                    onToggleUnread={onToggleUnread}
                />
                {(!hasUIVisionMS1 || isExpanded) && (
                    <>
                        <Handle />
                        <TicketInfobarPanel key="infobar-panel" />
                    </>
                )}
                {hasUIVisionMS1 && (
                    <InfobarNavigationPanel key="infobar-navigation" />
                )}

                {mode && (
                    <KnowledgeSourceSidebarWrapper key="knowledge-source-sidebar-wrapper" />
                )}
            </div>
        </div>
    )
}
