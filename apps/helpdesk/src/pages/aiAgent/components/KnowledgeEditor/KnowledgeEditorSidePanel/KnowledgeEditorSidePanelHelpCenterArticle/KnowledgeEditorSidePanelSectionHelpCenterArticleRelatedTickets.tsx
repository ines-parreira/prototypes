import { useMemo } from 'react'

import { Icon, IconSize } from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'
import RelativeTime from 'pages/common/components/RelativeTime'

import { KnowledgeEditorSidePanelFieldDescription } from '../KnowledgeEditorSidePanelCommonFields'

import css from './KnowledgeEditorSidePanelSectionHelpCenterArticleRelatedTickets.less'

type Ticket = {
    title: string
    content: string
    lastUpdatedDatetime: Date
}

type Props = {
    tickets?: Ticket[]
    relatedTicketsUrl?: string
    sectionId: string
}

export const KnowledgeEditorSidePanelSectionHelpCenterArticleRelatedTickets = ({
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
            header={{ title: <Title tickets={tickets} /> }}
            sectionId={sectionId}
            bottomLink={{
                text: 'View all',
                url: relatedTicketsUrl,
            }}
        >
            {latest3Tickets.length > 0 ? (
                <div className={css.container}>
                    <KnowledgeEditorSidePanelFieldDescription description="Tickets where AI Agent used this knowledge" />
                    <div className={css.ticketsList}>
                        {latest3Tickets.map((ticket) => (
                            <TicketCard key={ticket.title} ticket={ticket} />
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
        Related tickets{' '}
        <span className={css.ticketsCount}>{tickets?.length ?? 0}</span>
    </span>
)

const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <div className={css.ticketCard}>
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
        <div className={css.ticketCardContent}>{ticket.content}</div>
    </div>
)
