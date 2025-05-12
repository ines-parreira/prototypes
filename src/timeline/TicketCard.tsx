import type { ReactNode } from 'react'

import cn from 'classnames'

import { CustomField, TicketSummary } from '@gorgias/api-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { SourceBadge } from 'tickets/ticket-detail/components/SourceBadge'
import { TicketStatus } from 'tickets/ticket-detail/components/TicketStatus'

import { OwnerLabel } from './OwnerLabel'
import TicketFields from './TicketFields'

import css from './TicketCard.less'

type Props = {
    className?: string
    ticket: TicketSummary
    displayedDate: ReactNode
    isHighlighted?: boolean
    customFieldDefinitions?: CustomField[]
    isLoadingCFDefinitions?: boolean
}

export default function TicketCard({
    ticket,
    isHighlighted = false,
    customFieldDefinitions,
    isLoadingCFDefinitions = false,
    displayedDate,
    className,
}: Props) {
    const hasNewTimeline = useFlag(FeatureFlagKey.CustomerTimeline)
    return (
        <div
            className={cn(css.card, className, {
                [css.highlight]: isHighlighted,
            })}
        >
            <SourceBadge channel={ticket.channel} size="small" />
            <div className={css.content}>
                <div className={css.heading}>
                    <span className={css.title}>
                        <span className={css.subject}>{ticket.subject}</span>
                        <TicketStatus ticket={ticket} />
                    </span>
                    <span>{displayedDate}</span>
                </div>
                {hasNewTimeline ? (
                    <TicketFields
                        definitions={customFieldDefinitions}
                        fieldValues={ticket.custom_fields}
                        isLoading={isLoadingCFDefinitions}
                        className={css.ticketFields}
                    />
                ) : (
                    <div className={css.excerpt}>{ticket.excerpt}</div>
                )}
                <div className={css.meta}>
                    <OwnerLabel
                        type="agent"
                        owner={ticket.assignee_user?.name}
                    />
                    <span className={css.separator}>•</span>
                    <OwnerLabel
                        type="team"
                        owner={ticket.assignee_team?.name}
                    />
                    <span className={css.separator}>•</span>
                    <span className={css.metaText}>ID: {ticket.id}</span>
                    <span className={css.separator}>•</span>
                    <span className={css.metaText}>
                        {ticket.messages_count} message
                        {ticket.messages_count > 1 && 's'}
                    </span>
                </div>
            </div>
        </div>
    )
}
