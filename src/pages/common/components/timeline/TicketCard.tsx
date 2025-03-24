import cn from 'classnames'

import { CustomField, TicketSummary } from '@gorgias/api-queries'
import { TicketStatus } from '@gorgias/api-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { StatusLabel } from 'pages/common/utils/labels'

import { OwnerLabel } from './OwnerLabel'
import { SourceBadge } from './SourceBadge'
import TicketFields from './TicketFields'

import css from './TicketCard.less'

type Props = {
    ticket: TicketSummary
    isHighlighted?: boolean
    customFieldDefinitions?: CustomField[]
    isLoadingCFDefinitions?: boolean
}

export default function TicketCard({
    ticket,
    isHighlighted = false,
    customFieldDefinitions,
    isLoadingCFDefinitions = false,
}: Props) {
    const hasNewTimeline = useFlag(FeatureFlagKey.CustomerTimeline)
    return (
        <div
            className={cn(css.card, {
                [css.highlight]: isHighlighted,
            })}
        >
            <SourceBadge channel={ticket.channel} />
            <div className={css.content}>
                <div className={css.heading}>
                    <span className={css.title}>
                        <span className={css.subject}>{ticket.subject}</span>
                        <StatusLabel
                            status={
                                ticket.snooze_datetime
                                    ? 'snoozed'
                                    : ticket.status || TicketStatus.Open
                            }
                        />
                    </span>
                    <DatetimeLabel
                        dateTime={
                            ticket.last_message_datetime ||
                            ticket.created_datetime
                        }
                    />
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
