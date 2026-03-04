import { Icon, Text } from '@gorgias/axiom'

import { SYSTEM_RULE_TYPE } from '../../../../../hooks/events/constants'
import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketMessageSummaryCreatedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-message-summary-created'>
}

export function TicketThreadAuditLogTicketMessageSummaryCreatedEvent({
    item,
}: TicketThreadAuditLogTicketMessageSummaryCreatedEventProps) {
    const event = item.data

    if (event.data?.type === SYSTEM_RULE_TYPE) {
        return null
    }

    return (
        <TicketThreadEventContainer>
            <Icon name="comm-mail" />
            <Text size="sm">
                Chat summarized - Unseen chat messages were sent by email
            </Text>
            <TicketThreadAuditLogEventAttribution
                attribution={item.meta.attribution}
                authorId={event.user_id}
            />
            {event.created_datetime && (
                <TicketThreadEventDateTime datetime={event.created_datetime} />
            )}
        </TicketThreadEventContainer>
    )
}
