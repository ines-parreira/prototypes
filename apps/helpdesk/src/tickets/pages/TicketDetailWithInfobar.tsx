import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useTicketInfobarNavigation } from '@repo/navigation'
import { TicketHeader } from '@repo/tickets'
import { useParams } from 'react-router-dom'

import { useFlag } from 'core/flags'
import { Handle, Panel } from 'core/layout/panels'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { KnowledgeSourceSideBarProvider } from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBarProvider'
import KnowledgeSourceSidebarWrapper from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSidebarWrapper'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import type { OnToggleUnreadFn } from 'tickets/dtp'
import { InfobarNavigationPanel } from 'tickets/navigation'
import { TicketDetailPanel } from 'tickets/ticket-detail'
import { TicketInfobarPanel } from 'tickets/ticket-infobar'

import css from './TicketDetailWithInfobar.less'

type Props = {
    onToggleUnread?: OnToggleUnreadFn
}

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

export function TicketDetailWithInfobar({ onToggleUnread }: Props) {
    return (
        <KnowledgeSourceSideBarProvider>
            <TicketDetailContent onToggleUnread={onToggleUnread} />
        </KnowledgeSourceSideBarProvider>
    )
}

function TicketDetailContent({ onToggleUnread }: Props) {
    const hasUIVisionMS1 = useFlag(FeatureFlagKey.UIVisionMilestone1)
    const { ticketId: ticketIdParam } = useParams<{ ticketId: string }>()
    const { isExpanded } = useTicketInfobarNavigation()
    const { mode } = useKnowledgeSourceSideBar()

    const ticketId = parseInt(ticketIdParam, 10)

    const name = `infobar-${isExpanded ? 'expanded' : 'collapsed'}`
    const config = useMemo(
        () => (isExpanded ? panelConfig : collapsedPanelConfig),
        [isExpanded],
    )

    return (
        <div className={css.container}>
            {hasUIVisionMS1 && <TicketHeader ticketId={ticketId} />}
            <div className={css.content}>
                <TicketDetailPanel
                    key="ticket-detail-panel"
                    onToggleUnread={onToggleUnread}
                />
                {!hasUIVisionMS1 && (
                    <>
                        <Handle />
                        <TicketInfobarPanel key="infobar-panel" />
                    </>
                )}
                {hasUIVisionMS1 && (
                    <>
                        <Handle />
                        <Panel key={name} name={name} config={config}>
                            <TicketInfobarContainer isOnNewLayout />
                        </Panel>
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
