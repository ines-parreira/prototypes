import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

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
                allowAuthorFallback={false}
            />
            {event.created_datetime && (
                <TicketThreadEventDateTime datetime={event.created_datetime} />
            )}
        </TicketThreadEventContainer>
    )
}
