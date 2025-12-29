import { Box } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-queries'

import { TicketFieldsOverflowList } from './TicketFieldsOverflowList'
import { TicketFooter } from './TicketFooter'
import { TicketHeader } from './TicketHeader'
import type { TicketCustomField } from './types'
import { formatTicketTime } from './utils'

import css from './TicketTimelineWidget.less'

type TicketListItemProps = {
    ticket: TicketCompact
    iconName: IconName
    customFields: TicketCustomField[]
    conditionsLoading: boolean
}

export function TicketListItem({
    ticket,
    iconName,
    customFields,
    conditionsLoading,
}: TicketListItemProps) {
    return (
        <li>
            <Box
                display="inline-block"
                width="100%"
                marginBottom="sm"
                paddingTop="sm"
                paddingBottom="sm"
                paddingLeft="md"
                paddingRight="md"
                className={css.card}
            >
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
            </Box>
        </li>
    )
}
