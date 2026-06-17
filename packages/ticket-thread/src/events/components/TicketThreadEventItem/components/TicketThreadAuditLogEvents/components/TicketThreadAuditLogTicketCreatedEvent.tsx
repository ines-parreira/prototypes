import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketCreatedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-created'>
}

export function TicketThreadAuditLogTicketCreatedEvent({
    item,
}: TicketThreadAuditLogTicketCreatedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="add-plus-circle" />
            <Text size="sm">Ticket was created</Text>
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
