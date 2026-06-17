import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

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
