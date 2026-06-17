import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketClosedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-closed'>
}

export function TicketThreadAuditLogTicketClosedEvent({
    item,
}: TicketThreadAuditLogTicketClosedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="check-circle" />
            <Text size="sm">Status was changed to Closed</Text>
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
