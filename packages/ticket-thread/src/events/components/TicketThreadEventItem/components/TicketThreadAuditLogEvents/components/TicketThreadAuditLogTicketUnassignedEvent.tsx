import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketUnassignedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-unassigned'>
}
export function TicketThreadAuditLogTicketUnassignedEvent({
    item,
}: TicketThreadAuditLogTicketUnassignedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="user-close" />
            <Text size="sm">Ticket was unassigned</Text>
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
