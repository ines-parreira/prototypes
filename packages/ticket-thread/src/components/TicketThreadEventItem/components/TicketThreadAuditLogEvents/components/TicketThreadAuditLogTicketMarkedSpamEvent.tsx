import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

type TicketThreadAuditLogTicketMarkedSpamEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-marked-spam'>
}
export function TicketThreadAuditLogTicketMarkedSpamEvent({
    item,
}: TicketThreadAuditLogTicketMarkedSpamEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="nav-flag" />
            <Text size="sm">Marked as spam</Text>
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
