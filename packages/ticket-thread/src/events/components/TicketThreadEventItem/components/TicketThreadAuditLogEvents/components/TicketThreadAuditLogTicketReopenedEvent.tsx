import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogTicketReopenedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-reopened'>
}
export function TicketThreadAuditLogTicketReopenedEvent({
    item,
}: TicketThreadAuditLogTicketReopenedEventProps) {
    const event = item.data

    return (
        <TicketThreadEventContainer>
            <Icon name="inbox" />
            <Text size="sm">Status was changed to Open</Text>
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
