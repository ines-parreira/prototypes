import { useCallback } from 'react'
import type { JSX } from 'react'

import { Link } from 'react-router-dom'

import { Button, Icon, IconSize, Skeleton, Tag } from '@gorgias/axiom'

import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import type { KnowledgeMetrics } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import useAppDispatch from 'hooks/useAppDispatch'
import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'
import RelativeTime from 'pages/common/components/RelativeTime'

import css from './KnowledgeEditorSidePanelSectionRelatedTickets.less'

type Ticket = {
    id: number
    title: string
    lastUpdatedDatetime: Date
    messageCount: number
    aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS
}

export type Props = {
    ticketCount?: number
    latest3Tickets?: Ticket[]
    isLoading?: boolean
    sectionId: string
    resourceSourceId?: number
    resourceSourceSetId?: number
    dateRange?: {
        start_datetime: string
        end_datetime: string
    }
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
}

export const KnowledgeEditorSidePanelSectionRelatedTickets = ({
    sectionId,
    ticketCount,
    latest3Tickets,
    isLoading,
    resourceSourceId,
    resourceSourceSetId,
    dateRange,
    outcomeCustomFieldId,
    intentCustomFieldId,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()

    const handleViewMoreClick = useCallback(() => {
        if (!resourceSourceId || !resourceSourceSetId || !dateRange) return

        const metricData: KnowledgeMetrics = {
            metricName: KnowledgeMetric.Tickets,
            title: 'Recent tickets',
            resourceSourceId,
            resourceSourceSetId,
            dateRange,
            outcomeCustomFieldId,
            intentCustomFieldId,
        }

        dispatch(setMetricData(metricData))
    }, [
        dispatch,
        resourceSourceId,
        resourceSourceSetId,
        dateRange,
        outcomeCustomFieldId,
        intentCustomFieldId,
    ])

    return (
        <KnowledgeEditorSidePanelSection
            header={{
                title: (
                    <Title ticketCount={ticketCount} isLoading={isLoading} />
                ),
                subtitle: 'Last 28 days',
            }}
            sectionId={sectionId}
            bottomElement={
                ticketCount !== undefined &&
                ticketCount > 3 &&
                resourceSourceId &&
                resourceSourceSetId &&
                dateRange ? (
                    <Button
                        variant="tertiary"
                        size="sm"
                        intent="regular"
                        onClick={handleViewMoreClick}
                    >
                        View more
                    </Button>
                ) : undefined
            }
        >
            {isLoading ? (
                <div className={css.container}>
                    <div className={css.ticketsList}>
                        {[1, 2, 3].map((index) => (
                            <TicketCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            ) : latest3Tickets && latest3Tickets.length > 0 ? (
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

const Title = ({
    ticketCount,
    isLoading,
}: {
    ticketCount?: number
    isLoading?: boolean
}) => (
    <span className={css.title}>
        Recent tickets{' '}
        {isLoading ? (
            <Skeleton width={30} height={24} />
        ) : (
            <Tag
                color="grey"
                style={{ width: 'auto' }}
                className={css.titleTag}
            >
                {ticketCount ?? 0}
            </Tag>
        )}
    </span>
)

const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <Link
        to={`/app/ticket/${ticket.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className={css.ticketCard}
    >
        <div className={css.ticketCardHeader}>
            <div className={css.ticketCardTitle}>
                <span className={css.ticketCardIcon}>
                    <Icon name="comm-mail" size={IconSize.Sm} />
                </span>
                <span className={css.ticketCardTitleSubject}>
                    {ticket.title}
                </span>
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

const TicketCardSkeleton = () => (
    <div className={css.ticketCard}>
        <div className={css.ticketCardHeader}>
            <div className={css.ticketCardTitle}>
                <Skeleton width={150} height={16} />
            </div>
            <div className={css.ticketCardLastUpdatedDatetime}>
                <Skeleton width={60} height={16} />
            </div>
        </div>
        <div className={css.ticketCardContent}>
            <Skeleton width={80} height={24} />
            <Skeleton width={80} height={16} />
        </div>
    </div>
)
