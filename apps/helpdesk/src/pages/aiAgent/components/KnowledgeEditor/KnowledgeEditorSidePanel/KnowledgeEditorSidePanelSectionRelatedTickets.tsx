import { useMemo } from 'react'

import { Link } from 'react-router-dom'

import { Icon, IconSize, Tag } from '@gorgias/axiom'

import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'
import RelativeTime from 'pages/common/components/RelativeTime'

import css from './KnowledgeEditorSidePanelSectionRelatedTickets.less'

type Ticket = {
    title: string
    lastUpdatedDatetime: Date
    url: string
    messageCount: number
    aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS
}

export type Props = {
    tickets?: Ticket[]
    relatedTicketsUrl?: string
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionRelatedTickets = ({
    sectionId,
    tickets,
    relatedTicketsUrl,
}: Props) => {
    const latest3Tickets = useMemo(() => {
        if (!tickets) return []

        return [...tickets]
            .sort(
                (a, b) =>
                    b.lastUpdatedDatetime.getTime() -
                    a.lastUpdatedDatetime.getTime(),
            )
            .slice(0, 3)
    }, [tickets])

    return (
        <KnowledgeEditorSidePanelSection
            header={{
                title: <Title tickets={tickets} />,
                subtitle: 'Last 28 days',
            }}
            sectionId={sectionId}
            bottomLink={
                tickets && tickets.length > 3
                    ? {
                          text: 'View all',
                          url: relatedTicketsUrl,
                      }
                    : undefined
            }
        >
            {latest3Tickets.length > 0 ? (
                <div className={css.container}>
                    <div className={css.ticketsList}>
                        {latest3Tickets.map((ticket, index) => (
                            <TicketCard key={index} ticket={ticket} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className={css.emptyContainer}>
                    This knowledge item has not been used by AI Agent yet
                </div>
            )}
        </KnowledgeEditorSidePanelSection>
    )
}

const Title = ({ tickets }: Pick<Props, 'tickets'>) => (
    <span className={css.title}>
        Recent tickets <Tag color="grey">{tickets?.length ?? 0}</Tag>
    </span>
)

const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <Link
        to={ticket.url}
        target="_blank"
        rel="noopener noreferrer"
        className={css.ticketCard}
    >
        <div className={css.ticketCardHeader}>
            <div className={css.ticketCardTitle}>
                <span className={css.ticketCardIcon}>
                    <Icon name="comm-mail" size={IconSize.Sm} />
                </span>
                {ticket.title}
            </div>
            <div className={css.ticketCardLastUpdatedDatetime}>
                <RelativeTime
                    datetime={ticket.lastUpdatedDatetime.toISOString()}
                />
            </div>
        </div>
        <div className={css.ticketCardContent}>
            <div>
                {ticket.aiAgentOutcome ===
                AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover ? (
                    <Tag color="orange">
                        {AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover}
                    </Tag>
                ) : (
                    <Tag color="green">
                        {AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated}
                    </Tag>
                )}
            </div>
            <div>
                {ticket.messageCount}
                {ticket.messageCount > 1 ? ' messages' : ' message'}
            </div>
        </div>
    </Link>
)
