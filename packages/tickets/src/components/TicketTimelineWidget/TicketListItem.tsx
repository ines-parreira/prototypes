import { Box } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-queries'

import { TicketFieldsOverflowList } from './TicketFieldsOverflowList'
import { TicketFooter } from './TicketFooter'
import { TicketHeader } from './TicketHeader'
import { TimelineCard } from './TimelineCard'
import type { TicketCustomField } from './types'
import { formatTicketTime } from './utils'

type TicketListItemProps = {
    ticket: TicketCompact
    iconName: IconName
    customFields: TicketCustomField[]
    conditionsLoading: boolean
    className?: string
    onSelect?: () => void
}

export function TicketListItem({
    ticket,
    iconName,
    customFields,
    conditionsLoading,
    className,
    onSelect,
}: TicketListItemProps) {
    return (
        <li>
            <div style={{ cursor: 'pointer' }}>
                <TimelineCard className={className} onClick={onSelect}>
                    <Box display="flex" flexDirection="column" gap="xs">
                        <TicketHeader
                            subject={ticket.subject}
                            time={formatTicketTime(ticket.created_datetime)}
                            iconName={iconName}
                        />
                        <TicketFieldsOverflowList
                            customFields={customFields}
                            isLoading={conditionsLoading}
                        />
                        <TicketFooter
                            status={ticket.status}
                            isSnoozed={!!ticket.snooze_datetime}
                            assignee={ticket.assignee_user}
                            messagesCount={ticket.messages_count}
                        />
                    </Box>
                </TimelineCard>
            </div>
        </li>
    )
}
