import { Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAuditLogEventByType } from '../../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../../TicketThreadEventDateTime'

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
